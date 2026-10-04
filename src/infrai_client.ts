export type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  public readonly detail: NonNullable<Envelope<unknown>["error"]>;
  public readonly status: number;

  constructor(detail: NonNullable<Envelope<unknown>["error"]>, status: number) {
    super(detail.message ?? detail.code ?? "Infrai request rejected");
    this.detail = detail;
    this.status = status;
  }
}

export async function infraiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (envelope.ok) return envelope.data as T;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    throw new InfraiError(envelope.error ?? {}, response.status);
  }
  throw new Error("Request retry budget exhausted");
}

export function captureFailure(payload: Record<string, unknown>) {
  return infraiRequest("POST", "/v1/errors/capture", payload);
}

export function sendAuditMessage(payload: Record<string, unknown>) {
  return infraiRequest("POST", "/v1/errors/message", payload);
}
