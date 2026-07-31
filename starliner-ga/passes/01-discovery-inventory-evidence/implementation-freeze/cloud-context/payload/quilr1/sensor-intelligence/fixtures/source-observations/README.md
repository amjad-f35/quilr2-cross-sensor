# source-observations

Contains proposed Starliner envelopes built from the checked-in envelope JSON Schema.
The normal, duplicate, out-of-order, late, offline-buffered, partial, and unsupported-version files validate against that schema; the designated invalid-missing-tenant file must fail it.
Their Quilr 1 source profile remains proposed and uncertified.

Every JSON file carries provenance/status metadata unless it must remain
strictly valid against an external JSON Schema. All values are synthetic and
use the reserved `.invalid` domain where applicable.
