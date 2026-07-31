# Detection and Classification

| detector | logic_source | output | confidence | status |
| --- | --- | --- | --- | --- |
| topic structured classifier | validated DeepSeek/Workers AI response | topic assignments and unclassified reason | evidence phrase validation | implemented/tested |
| query language validator | bounded typed AST and operator/type checks | accepted query/error | deterministic | implemented/tested |
| browser findings | source alert lifecycle rows | finding projection | source-defined | implemented projection |
| endpoint DLP | source DLP rows | finding signal | source-defined | implemented projection |
| LLM detection mapping | source result payloads | risk/detection projection | source-defined | implemented projection |
| canonical finding engine | none in this repo | none | unresolved | not implemented |

The activity-topic classifier validates structured output, exact bounded evidence phrases, catalog reuse, and correction attempts. It deliberately classifies topic, not severity/risk. Upstream risk/finding projections remain source-defined signals.
