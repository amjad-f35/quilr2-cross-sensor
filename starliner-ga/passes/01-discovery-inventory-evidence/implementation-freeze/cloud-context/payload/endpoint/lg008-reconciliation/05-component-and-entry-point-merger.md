# 05 — Component and Entry-Point Merger

The endpoint-only merger contains 37 logical components and
37 entry points. It preserves executable, worker, hook,
proxy, platform extension, build, installer, updater, uninstaller and dormant
gRPC entry paths separately.

`Verified:` primary runtime chain:

`agent main → shared lifecycle → supervised children → monitor/proxy/template/IPC`

The monitor then runs process discovery, Lua/file scanning, package scanning,
delta/ingest sync, enforcer and hook management. The proxy separately owns HTTP,
HTTPS, macOS Network Extension/relay and Windows redirector paths.

`Verified:` hook clients are one-shot Cursor/Claude entry points. Parse/IPC
failures generally fail open to Allow.

`Verified:` the generic DbService gRPC server is feature-gated, has no caller in
the default runtime and has schema/code incompatibilities. Its disposition is
`DEAD_OR_UNREACHABLE`; it is not an assumed target integration path.

`Reachability qualification:` static active code is
`CONFIGURATION_DEPENDENT`, not `ENABLED_AND_REACHABLE`, because deployed build
flags/process/configuration were not observed.

See
[`components.csv`](../../lg008-endpoint/catalogs/components.csv) and
[`entry-points.csv`](../../lg008-endpoint/catalogs/entry-points.csv).
