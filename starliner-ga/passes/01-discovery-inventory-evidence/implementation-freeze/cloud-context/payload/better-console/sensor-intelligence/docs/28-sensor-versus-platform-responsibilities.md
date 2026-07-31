# Sensor Versus Platform Responsibilities

| Responsibility | Native sensor/source | Adapter | Central platform |
| --- | --- | --- | --- |
| capture | owns native occurrence/state | does not fabricate | does not recapture |
| source schema/version | publishes/retains | pins and reports | registers compatibility |
| privacy | minimize at source | classify/redact/route | enforce global policy |
| identity | source identifiers | source-scoped candidates | global resolution |
| delivery | source durability if any | WAL/retry/checkpoint | admission/receipt |
| findings | signals/detections | evidence candidates | canonical admission/lifecycle |
| controls | native execution/effect | translate/report | authorize/orchestrate |
| coverage | capability/version | lag/schema/reconcile | customer/operator aggregate |
