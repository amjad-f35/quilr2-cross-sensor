# 13 — Source-to-Adapter Reconciliation

There is one mapping row for each of the 639 native fields.

| Mapping status | Rows |
| --- | --- |
| NOT_REQUIRED | 84 |
| READY_WITH_MINOR_SOURCE_CHANGE | 541 |
| REQUIRES_MAJOR_SOURCE_CHANGE | 14 |

The bounded responsibility chain is:

`native sensor capture/enforcement → source-safe mapper → device-local Edge Runtime → frozen endpoint profile`

Native sensor owns capture and actual local control. The adapter owns
source-specific types, identifier namespaces, minimization and semantic loss.
The Edge Runtime owns enrolled producer identity, signed manifest, sequence,
WAL, delivery, replay and health. Central platform owns canonical resolution,
cross-sensor relationships, findings, materialization, API and UI.

`Verified:` no current common adapter/Edge Runtime/WAL provides that boundary.
All mapping rows are proposals derived from source evidence and are
`INFERRED`. `READY` means the native fact exists; it does not mean the adapter
is implemented.
