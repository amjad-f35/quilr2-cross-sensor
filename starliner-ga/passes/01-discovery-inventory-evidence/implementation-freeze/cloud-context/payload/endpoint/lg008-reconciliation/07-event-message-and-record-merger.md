# 07 — Event, Message, and Record Merger

- Native record types: 66
- Native event types: 47
- Event transport/message manifestations: 47

Every record/event/message row preserves producer, consumer, native schema,
delivery, ordering, retry and loss semantics. A message ID is a transport
manifestation of its event ID, not an assertion that all events are durable
network messages.

`Verified delivery limits:`

- process/entity changes can be memory-only;
- hook activities batch in memory and drop after bounded failures;
- alert storage has SQLite/quarantine/DLQ paths but is alert-specific;
- IPC broker delivery is local and not the frozen central evidence WAL;
- current HTTP sync paths do not establish frozen per-record durable receipts.

The merger therefore never upgrades the system to global at-least-once,
ordered or replayable delivery. Those are frozen Edge Runtime requirements,
not current source facts.
