import { z } from "zod";
import { captureFailure, sendAuditMessage } from "./infrai_client.ts";

export const paymentRequest = z.object({
  paymentId: z.string().min(1),
  amountCents: z.number().int().positive(),
  customerRisk: z.enum(["low", "high"]),
  modelConfidence: z.number().min(0).max(1)
});

export type PaymentRequest = z.infer<typeof paymentRequest>;
export type Decision = "approve" | "review" | "decline";

export function choosePaymentAction(input: PaymentRequest): Decision {
  if (input.customerRisk === "high" || input.modelConfidence < 0.7) return "review";
  return input.amountCents > 100000 ? "review" : "approve";
}

export async function handlePayment(body: unknown): Promise<{ paymentId: string; action: Decision }> {
  const input = paymentRequest.parse(body);
  const action = choosePaymentAction(input);
  const audit = { paymentId: input.paymentId, amountCents: input.amountCents, action, customerRisk: input.customerRisk };
  await sendAuditMessage({ text: JSON.stringify(audit), level: "info" });
  return { paymentId: input.paymentId, action };
}

export async function runAgent(body: unknown): Promise<{ paymentId: string; action: Decision }> {
  try {
    return await handlePayment(body);
  } catch (error) {
    const input = body as Partial<PaymentRequest>;
    await captureFailure({
      title: "Payment agent step failed",
      message: error instanceof Error ? error.message : "Payment request rejected",
      level: "error",
      fingerprint: ["payment-agent", "decision"],
      exception: error instanceof Error ? error.stack : String(error),
      context: { paymentId: input.paymentId ?? "unknown", source: "payment-agent" }
    });
    throw error;
  }
}

if (process.argv[1]?.endsWith("payment_agent.ts")) {
  const sample = { paymentId: "pay_demo_001", amountCents: 4200, customerRisk: "low", modelConfidence: 0.94 };
  runAgent(sample).then((result) => console.log(JSON.stringify(result))).catch(() => process.exitCode = 1);
}
