# Sourdough benchmark results

Historical performance results for
[`redwoodjs/sourdough`](https://github.com/redwoodjs/sourdough).

Sourdough runs paired benchmarks for every pull request. The base and proposed
commits run on the same GitHub Actions worker in an alternating order so that
machine differences do not become apparent performance changes. A trusted
workflow then publishes the result here.

## Layout

```text
pulls/<pull-request>/<head-sha>/<workflow-run>.json
main/<commit-sha>/<workflow-run>.json
schema/benchmark-result.schema.json
```

Result files are immutable. Re-running a workflow creates a new file rather
than replacing history.

Each document contains:

- source repository, pull request, commits, and workflow run;
- Node.js, operating system, architecture, and CPU information;
- raw per-round benchmark medians;
- aggregated base and proposed medians;
- relative changes, thresholds, and regression decisions; and
- added or removed benchmark names.

## Regression policy

The source repository owns benchmark definitions and thresholds. A pull request
fails when latency is over its configured threshold and all proposed rounds are
slower than all base rounds. This guards against obvious shared-runner noise.
Removed benchmarks also fail unless the policy is deliberately changed.

The required pull-request check does not depend on this repository being
writable. Publishing happens afterward in a separate trusted workflow, so pull
request code never receives the deployment credential.

## Validation

All result JSON is checked on every push:

```bash
node scripts/validate.mjs
```

The schema is versioned so readers can continue to understand older results.
