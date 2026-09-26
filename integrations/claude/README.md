# Claude Integration

Claude is the sole AI reasoning/model layer.

The integration must:
- keep API credentials outside source control;
- expose structured request/response boundaries;
- record model usage for cost reporting;
- apply timeouts and bounded retries;
- never grant Claude direct unrestricted infrastructure access.
