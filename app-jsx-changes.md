# app.jsx — wiring sign-in and sync

Eight edits. Apply **all of them to all three repos** — `app.jsx` must stay
byte-identical. Line numbers are from v4.1.1 as deployed; the FIND text is the
reliable anchor, so use that rather than the line number.

Nothing here changes how the app behaves when signed out. Signed out, every
new code path returns immediately and the app is exactly what it is today.

---

## Edit 1 — imports

**FIND** (line 23):

```js
import { createStore, localStorageAdapter } from "./core/storage.js";
```

**REPLACE WITH:**

```js
import { createStore, localStorageAdapter } from "./core/storage.js";
import { isConfigured, currentUser, onAuthChange, sendMagicLink, signOut } from "./core/supabase.js";
import {
  configureSync, pullAndMerge, queueLogDay, queueOverrideChanges,
  queueSettings, flushNow, watchConnectivity,
} from "./core/sync.js";
```

---

## Edit 2 — remove the dead Apps Script import

**FIND** (line 11):

```js
  PROGRAM, THEME, ProgramView, CLIENT_LABEL, CLIENT_NAME, STORAGE_PREFIX, BACKUP_URL,
```

**REPLACE WITH:**

```js
  PROGRAM, THEME, ProgramView, CLIENT_LABEL, CLIENT_NAME, STORAGE_PREFIX,
```

Leave `BACKUP_URL` in `config.jsx`. It is simply no longer imported.

---

## Edit 3 — new state

**FIND** (line 91):

```js
  const [backupText, setBackupText] = useState("");
```

**REPLACE WITH:**

```js
  const [backupText, setBackupText] = useState("");

  // Account and sync. All inert when signed out.
  const [authUser, setAuthUser] = useState(null);
  const [syncState, setSyncState] = useState({ status: "offline", pendingCount: 0, lastSyncedAt: null });
  const [emailDraft, setEmailDraft] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const syncedUserRef = useRef(null);
```

---

## Edit 4 — the sync bootstrap

A NEW effect. The existing load effect is not touched — local data still loads
first, exactly as now, and the app is usable before the network is consulted.

**FIND** (ends line 115, just after the existing load effect):

```js
    return () => { cancelled = true; };
  }, []);

  const viewedDate = useMemo(() => {
```

**REPLACE WITH:**

```js
    return () => { cancelled = true; };
  }, []);

  /* ------------------------------- Cloud sync ----------------------------- */
  // Runs after the local load above. Signed out, this does nothing at all.
  //
  // Note it re-reads from `store` rather than from React state: state inside
  // this effect would be frozen at mount, and the store is always current.
  useEffect(() => {
    if (!isConfigured()) return;

    const attach = async (user) => {
      setAuthUser(user || null);
      const uid = user?.id || null;
      if (syncedUserRef.current === uid) return;   // same user, nothing to redo
      syncedUserRef.current = uid;

      await configureSync({ store, userId: uid, onStateChange: setSyncState });
      if (!uid) return;

      const [l, ov, s] = await Promise.all([
        store.loadJSON("log", {}),
        store.loadJSON("overrides", {}),
        store.loadJSON("settings", { gentler: false, hrMax: null }),
      ]);

      // Returns null if offline or the fetch failed — in which case the local
      // copy is left exactly as it is. Never a reason to lose anything.
      const merged = await pullAndMerge({ log: l, overrides: ov, settings: s });
      if (!merged) return;

      setLog(merged.log);
      setOverrides(merged.overrides);
      setSettings(merged.settings);
      setHrMaxDraft(merged.settings?.hrMax != null ? String(merged.settings.hrMax) : "");
      store.saveJSON("log", merged.log);
      store.saveJSON("overrides", merged.overrides);
      store.saveJSON("settings", merged.settings);
    };

    let stopAuth = () => {};
    const stopConn = watchConnectivity();
    stopAuth = onAuthChange(attach);
    currentUser().then(attach);

    return () => { stopAuth(); stopConn(); };
  }, []);

  const viewedDate = useMemo(() => {
```

---

## Edit 5 — persist writes one day to the cloud

`persist` already knows which day changed, so no diffing is needed — the day
key is right there.

**FIND** (lines 160–161):

```js
      store.saveJSON("log", next);
      pushBackup(next);
```

**REPLACE WITH:**

```js
      store.saveJSON("log", next);
      queueLogDay(viewedKey, next[viewedKey]);
```

---

## Edit 6 — settings

**FIND** (line 276):

```js
      store.saveJSON("settings", next);
```

**REPLACE WITH:**

```js
      store.saveJSON("settings", next);
      queueSettings(next);
```

---

## Edit 7 — overrides

Both versions are in scope here, so the changed days can be worked out honestly
rather than guessed.

**FIND** (lines 282–285):

```js
    setOverrides((prev) => {
      const next = updater(prev);
      store.saveJSON("overrides", next);
      return next;
```

**REPLACE WITH:**

```js
    setOverrides((prev) => {
      const next = updater(prev);
      store.saveJSON("overrides", next);
      queueOverrideChanges(prev, next);
      return next;
```

---

## Edit 8 — restoring a backup should also reach the cloud

**FIND** (lines 572–574):

```js
      store.saveJSON("log", parsed.log || {});
      store.saveJSON("overrides", parsed.overrides || {});
      store.saveJSON("settings", parsed.settings || { gentler: false, hrMax: null });
```

**REPLACE WITH:**

```js
      store.saveJSON("log", parsed.log || {});
      store.saveJSON("overrides", parsed.overrides || {});
      store.saveJSON("settings", parsed.settings || { gentler: false, hrMax: null });
      // A restore is a deliberate act — push every day of it up.
      Object.keys(parsed.log || {}).forEach((d) => queueLogDay(d, parsed.log[d]));
      queueOverrideChanges({}, parsed.overrides || {});
      queueSettings(parsed.settings || { gentler: false, hrMax: null });
```

---

## Edit 9 — the Account panel in Settings

Goes immediately above the existing Backup block.

**FIND** (line 684):

```js
            <div style={{ borderColor: BORDER }} className="border-t pt-4">
              <p className="text-xs font-semibold mb-1">Backup</p>
```

**REPLACE WITH:**

```js
            <div style={{ borderColor: BORDER }} className="border-t pt-4">
              <p className="text-xs font-semibold mb-1">Account &amp; sync</p>
              {!isConfigured() ? (
                <p style={{ color: TEXT_MUTED }} className="text-[11px]">
                  This build is not connected to an account. Everything stays on this device.
                </p>
              ) : authUser ? (
                <>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-1">
                    Signed in as {authUser.email}
                  </p>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-2">
                    {syncState.status === "syncing"
                      ? "Saving to your account…"
                      : syncState.pendingCount > 0
                      ? `${syncState.pendingCount} change${syncState.pendingCount === 1 ? "" : "s"} waiting for a connection`
                      : syncState.status === "error"
                      ? "No connection — saved on this device, will sync later"
                      : syncState.lastSyncedAt
                      ? `Everything saved · ${new Date(syncState.lastSyncedAt).toLocaleTimeString()}`
                      : "Connected"}
                  </p>
                  <div className="flex gap-1.5">
                    <button onClick={() => flushNow()} style={{ borderColor: BORDER }}
                            className="flex-1 text-xs font-semibold py-1.5 rounded-lg border">Sync now</button>
                    <button onClick={async () => {
                              await signOut();
                              syncedUserRef.current = null;
                              setAuthMsg("Signed out. Your log is still here on this device.");
                            }}
                            style={{ borderColor: BORDER }}
                            className="flex-1 text-xs font-semibold py-1.5 rounded-lg border">Sign out</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-2">
                    Sign in to back up your log and use it on more than one device. The app works
                    without it — everything just stays on this device.
                  </p>
                  <div className="flex gap-1.5">
                    <input type="email" inputMode="email" value={emailDraft} placeholder="you@example.com"
                           onChange={(e) => setEmailDraft(e.target.value)}
                           style={{ borderColor: BORDER, background: BG, color: TEXT_PRIMARY }}
                           className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border" />
                    <button onClick={async () => {
                              setAuthMsg("Sending…");
                              const r = await sendMagicLink(emailDraft);
                              setAuthMsg(r.ok ? "Check your email for a sign-in link." : r.error);
                            }}
                            style={{ background: ACCENT, color: BG }}
                            className="shrink-0 text-xs font-semibold px-3 rounded-lg">Send link</button>
                  </div>
                </>
              )}
              {authMsg && <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-2">{authMsg}</p>}
            </div>

            <div style={{ borderColor: BORDER }} className="border-t pt-4">
              <p className="text-xs font-semibold mb-1">Backup</p>
```

---

## Edit 10 — delete the dead Apps Script function

**FIND** (lines 1727–1748, the whole block):

```js
/* ------------------------------ Cloud backup ------------------------------ */

/**
 * Best-effort copy to a Google Apps Script endpoint. Fire-and-forget: a
 * failure here must never block or break the local save, which is the real
 * source of truth. Inert until BACKUP_URL is set.
 */
let backupTimer = null;
function pushBackup(log) {
```

…through to the closing brace of that function, and **delete it entirely.**
It was never switched on in any repo, and its job now belongs to `sync.js`.

---

## After the edits

1. Bump `APP_VERSION` in `src/core/program-<name>.js` to **5.0.0-beta1** in each repo.
2. Rebuild both:
   ```
   npx esbuild src/entry.jsx --bundle --minify --outfile=bundle.js --loader:.jsx=jsx
   npx @tailwindcss/cli -i ./src/input.css -o ./styles.css
   ```
3. `bundle.js` will grow a lot this time — the Supabase library is genuinely
   being included now. Expect roughly 900 KB–1 MB. That is correct.
4. **Export a backup from your phone before deploying.** Last time this rule
   matters.
5. Deploy **Juha only** first. Henna and Joonatan wait until sign-in and sync
   are confirmed working on your own data.
