import test from "node:test";
import assert from "node:assert/strict";
import { choosePaymentAction, paymentRequest } from "./payment_agent.ts";

test("high-risk or uncertain payments enter review", () => {
  const input = paymentRequest.parse({ paymentId: "pay_7", amountCents: 4200, customerRisk: "high", modelConfidence: 0.99 });
  assert.equal(choosePaymentAction(input), "review");
});

test("a small, confident low-risk payment is approved", () => {
  const input = paymentRequest.parse({ paymentId: "pay_8", amountCents: 4200, customerRisk: "low", modelConfidence: 0.94 });
  assert.equal(choosePaymentAction(input), "approve");
});
