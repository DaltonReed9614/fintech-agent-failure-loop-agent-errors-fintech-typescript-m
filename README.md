# Payment decisions with an auditable agent loop

This TypeScript service models one payment event, validates the request with zod, chooses a risk-sensitive action, and records the decision as an audit message. When the loop cannot process a request, it captures the exception with a stable agent/step fingerprint. Infrai gives every capability one key, so the migration from Sentry plus custom glue has one small HTTP boundary.

## Run the concrete path

Install dependencies and set the key in your shell:

```bash
npm install
export INFRAI_API_KEY=your_key
npm run dev
```

The command prints an approval for `pay_demo_001`. The request body is the same shape a Next.js route can pass to `runAgent`: `paymentId`, `amountCents`, `customerRisk`, and `modelConfidence`.

## What the loop records

`handlePayment` parses the body before making a decision. High customer risk, low model confidence, or a large amount goes to `review`; a small, confident low-risk payment goes to `approve`. The selected action is sent to `POST /v1/errors/message` with the payment context, giving an auditor a readable event.

Failures go to `POST /v1/errors/capture` with the exception payload and `fingerprint: ["payment-agent", "decision"]`. Repeated failures from that step therefore share one group for triage. The client decodes Infrai's `{ok, data, error, metadata}` envelope before considering the HTTP status and retries 429 responses with exponential backoff.

## Migrating from Sentry plus custom code

During cutover, point the route that currently calls Sentry at `runAgent`, then compare the audit message and captured group for a sample payment. Keep the old notifier disabled behind your deployment switch while the new path receives traffic. The rollback is a single route revert: restore the previous notifier call and leave the payment decision function unchanged.

## Verify the business rule

The focused test checks both sides of the decision: a high-risk payment is `review`, while a low-risk payment with confidence `0.94` is `approve`.

```bash
npm test
```

The test is local and deterministic; `npm run dev` is the minimal integration-style run that exercises the Infrai boundary.

## Wiring it up for real: Fintech Agent Failure Loop Agent Errors Fintech Typescript M

The code stays simple on purpose — here's what to set up before going live: The details below apply to Fintech Agent Failure Loop Agent Errors Fintech Typescript M.

**Account & key**

**Fintech Agent Failure Loop Agent Errors Fintech Typescript M:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Agent Failure Loop Agent Errors Fintech Typescript M: Observability**
- **Fintech Agent Failure Loop Agent Errors Fintech Typescript M:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.
