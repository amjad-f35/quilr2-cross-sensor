# Product surface recommendations


| sensor_datum_capability | product_location | default_drilldown | display_label | calculation | filter_dimensions | click_through | action | hide_reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gateway deployment and health | Coverage | Default | LLM Gateway | latest health/source freshness | tenant, deployment, version | Sensor detail | fix coverage/upgrade |  |
| Application surface activity | Applications | Default aggregate; evidence drill-down | Gateway-routed AI application | configured app plus observed requests | tenant, owner, active time | Application detail | approve/restrict/assign owner |  |
| Provider/model route | Models | Default | Model route | provider/model/deployment/label claims | provider, model, app, time | Model route detail | configure/reroute |  |
| Request activity/outcome | Activity | Default metadata | Model request | one final request record | user, app, model, action, status | Evidence | investigate |  |
| Prompt/response content | Evidence | Restricted drill-down only | Captured content | native evidence | request/category/side | Evidence access | investigate | Sensitive raw content must not be default UI |
| Latency/tokens/cost | Analytics | Aggregate | Gateway usage and performance | metrics.csv | tenant/app/provider/model/time | Activity | optimize/reroute |  |
| Detector result | Findings/Evidence | Finding only after admission; signal otherwise | Guardrail signal | finding rules | category/action/side | Finding evidence | configure/investigate | Detector positives are not findings by themselves |
| Temporary timing fields/start_time | None | Hidden |  | runtime-only |  |  |  | Internal implementation only; removed before persistence |

Default product views show inventory, activity metadata, actionable findings,
usage/performance and coverage. Raw prompts/responses, detector internals,
temporary timings and secret-bearing configuration remain restricted evidence
or operator-only data.
