# Observability

Produces the instrumentation that answers two questions — **is it working?** and **where
and why is it not?** — and nothing else. Not a catalogue of everything measurable.

**Start from the signals the release compares to decide a rollback.** If a threshold in
`Docs/Operations/deployment.md` mentions a signal, that signal is instrumented first; otherwise the
release has a rule it cannot evaluate.

## Health checks

**Liveness and readiness are different things, and confusing them takes the system down:**

- **Liveness** answers *is this process able to serve?* It **does not check dependencies**.
  A database outage that fails liveness restarts every instance at once, turning a partial
  failure into a total one.
- **Readiness** answers *should traffic come here now?* It does check what this instance
  needs to serve.
- **Health endpoints reveal nothing sensitive** to an anonymous caller: no versions of
  internal components, no connection strings, no dependency topology.

## Logs

- **Structured, with named properties**, not sentences with values glued into them. A log
  you cannot filter is a log nobody reads twice.
- **Correlation per request**, propagated across components, so one user's path can be
  followed end to end.
- **Levels with meaning.** An expected business rejection is **not** `Error`: an expired
  coupon is the system working. A log level that cries wolf trains everyone to ignore it.
- **One entry per significant event.** A log inside a loop drowns the signal it was meant to
  carry.
- Write down what is never logged: credentials, tokens, personal data, whole request bodies.

## Metrics

**RED per endpoint**: rate, errors and duration.

- **Errors separated by type**: a server failure and an expected rejection are not the same
  number, and mixing them hides the one that matters.
- **Duration in percentiles, never only the average.** The average hides exactly the tail
  the user feels.
- **Labels are bounded.** A user id as a label blows up the metric store — high-cardinality
  values belong in logs and traces, not in metric dimensions.

## Alerts

- **Alert on a symptom the user feels**, not on a cause. CPU at 90% may be fine; checkout
  failing is not.
- Each alert says **what it means and what the first step is**. An alert with no first step
  wakes someone up to do research.
- **An alert nobody acts on is deleted or turned into a dashboard.** Keeping it trains the
  team to ignore the channel it arrives on.

## Verify it by watching it arrive

Instrumentation that was only written is **not verified**:

- Call the health endpoints and see them answer — both of them, in both states if you can
  produce them.
- Generate a request and **find its lines by correlation id**.
- Watch the metric move.

Report what you could not observe as not observed. This is the same rule the test run and
the mockup follow: writing it is not evidence that it works.

## Done when

Rehearse it: at three in the morning, could someone tell whether it is working and where it
is failing, using only this?

- Every signal a rollback threshold names is instrumented.
- Liveness does not check dependencies, and no health endpoint leaks internals.
- Logs are structured, correlated, and quiet when nothing is wrong.
- Errors are split by type and durations are percentiles.
- Every alert names a user-visible symptom and a first step.
- Everything added was seen arriving, or is reported as not verified.
