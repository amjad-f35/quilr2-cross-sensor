# control-results

Contains future result-state examples that keep request delivery, native acknowledgement, and effect verification distinct.
Success and failure files are proposed state-machine oracles, not captured native enforcement.

Every JSON file carries provenance/status metadata unless it must remain
strictly valid against an external JSON Schema. All values are synthetic and
use the reserved `.invalid` domain where applicable.
