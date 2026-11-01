# Observability

Produces the instrumentation that answers **is it working?** and **where and why not?** —
nothing more. **Start from the signals the rollback thresholds in `deployment.md` name**.

## Steps

1. **Health checks**: *liveness* (can this process serve?) never checks dependencies — a
   database outage failing liveness restarts every instance at once; *readiness* (should
   traffic come here?) does. Neither reveals internals to an anonymous caller.
2. **Logs**: structured with named properties; a correlation id propagated across components;
   levels with meaning (an expected business rejection is not `Error`); one entry per
   significant event, never inside a loop. Write down what is never logged: credentials,
   tokens, personal data, whole bodies.
3. **Metrics**: rate, errors and duration per entry point; errors split by type; durations in
   percentiles; bounded labels (ids belong in logs and traces).
4. **Alerts** on symptoms the user feels, each with what it means and the first step. An
   alert nobody acts on is deleted or becomes a dashboard.
5. **Watch it arrive**: call both health endpoints (in both states if you can), find a
   request's lines by correlation id, watch a metric move.

## Done when

At three in the morning, someone could tell whether it works and where it fails using only
this.
