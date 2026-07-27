# Cross-sensor file-upload activity

## Input observations

| Source | Observation | Integrity limitation |
| --- | --- | --- |
| Browser | request ID, origin, File name/size/type/lastModified, user/app, decision | Page file lacks local stable identity |
| Native host | task ID, local candidate path, metadata, DLP result | Current mixed-batch response correlation is positional |
| Endpoint proxy | process/destination/body/flow/policy outcome | Attribution/coverage varies by platform/path |
| LLM Gateway | request ID, model/provider/account context, prompt attachment/classification | Exists only when routed through gateway |
| DLP worker | category/subcategory/entities/reason/timing | Classification may differ by detector/version |

## Correlation

Use propagated IDs first. Otherwise require device/user/application destination plus file metadata/digest and a calibrated time window. If the native mixed-batch defect applies, retain the candidate association and do not use its local path/content classification as conclusive evidence.

## Output

```text
parent: data.transferred
children: data.read, data.uploaded, prompt.submitted,
          policy.evaluated, decision.allowed|denied, model.invocation.*
entities: user, device, process/browser, application surface/account,
          model deployment, data asset/class, sensor/enforcement point
evidence: every source observation and raw reference
```

One sensitive-transfer finding may use all these signals. It is not one finding per sensor.
