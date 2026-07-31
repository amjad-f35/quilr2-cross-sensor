# Logs, Traces, Audit, and Evidence

| signal | mechanism | producer | consumer | status |
| --- | --- | --- | --- | --- |
| API completion | one-line JSON tracing event | api_log middleware | stdout collector | implemented/tested |
| regular application logs | JSON tracing | Rust modules | stdout collector | implemented |
| internal timings | timing context + SQLite | ObservedClickHouse/API timing | internal admin | implemented/tested |
| authentication audit | session/store events | AuthService | operator/API | implemented partial |
| source audit logs | LocalStore/ClickHouse | upstream systems | platform audit UI | implemented |
| frontend errors | Console Assist report | QueryClient/ErrorBoundary | PostgreSQL/Slack/assist | implemented |
| distributed tracing | no Rust OTLP exporter visible | none | none | not implemented |

Structured logs are operational evidence, not automatically durable product audit. Runtime outputs from this analysis are summarized in `26-runtime-verification.md`; raw customer data was not captured.
