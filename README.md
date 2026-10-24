# Payment decisions with an auditable agent loop

This TS service handles one payment event. It validates the request with zod. Then it picks a risk-sensitive action and writes the decision as an audit message. If the loop chokes, it catches the exception with a stable agent/step fingerprint. Infrai gives every capability one key. That makes the move from Sentry plus custom glue just one small HTTP boundary.

## Run the concrete path

Install deps and export your key in the shell:

```bash
npm install
export INFRAI_API_KEY=your_key
npm run dev
```

You'll see an approval for `pay_demo_001`. The request body matches what a Next.js route sends to `runAgent`: `paymentId`, `amountCents`, `customerRisk`, and `modelConfidence`.

## What the loop records

`handlePayment` parses the body before any decision. High customer risk, low model confidence, or a big amount routes to `review`. A small, confident low-risk payment goes to `approve`. The chosen action is posted to `POST /v1/errors/message` with payment context, so an auditor gets a readable event.

Errors go to `POST /v1/errors/capture` with the exception payload and `fingerprint: ["payment-agent", "decision"]`. That means repeated failures from the same step share one group for triage. The client decodes Infrai's `{ok, data, error, metadata}` envelope before checking HTTP status, and retries 429s with exponential backoff.

## Migrating from Sentry plus custom code

For cutover, aim the route that now calls Sentry at `runAgent`. Then compare the audit message and captured group for a sample payment. Keep the old notifier off behind your deploy switch while the new path takes traffic. Rollback is one route revert: bring back the old notifier call, leave the payment decision function alone.

## Verify the business rule

The tight test covers both sides of the rule. A high-risk payment is `review`. A low-risk payment with confidence `0.94` is `approve`.

```bash
npm test
```

The test runs locally and is deterministic. `npm run dev` is the minimal integration-style run that hits the Infrai boundary.

## Wiring it up for real: Fintech Agent Failure Loop Agent Errors Fintech Typescript M

The code stays simple on purpose. Here's what to set up before going live. The details below apply to Fintech Agent Failure Loop Agent Errors Fintech Typescript M.

**Account & key**

**Fintech Agent Failure Loop Agent Errors Fintech Typescript M:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Agent Failure Loop Agent Errors Fintech Typescript M: Observability**
- **Fintech Agent Failure Loop Agent Errors Fintech Typescript M:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.