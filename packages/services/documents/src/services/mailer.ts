// Email delivery port for document attachments, backed by the notifykit SMTP provider.
// The adapter is shaped like notifications/src/services/senders.ts: a narrow structural
// view of the notifykit NotificationManager, so tests can stub it without the real kit.
export interface DocumentEmailAttachment {
  filename: string;
  content: Uint8Array;
  contentType?: string;
}

export interface DocumentEmailInput {
  to: string;
  cc?: readonly string[];
  subject: string;
  body: string;
  attachment: DocumentEmailAttachment;
}

export interface DocumentEmailSendResult {
  ok: boolean;
  provider: string;
  messageId?: string;
  reason?: string;
  retryable?: boolean;
}

/** The slice of a notifykit email Notifier this module uses. */
interface EmailTransport {
  send(
    message: {
      to: string;
      cc?: readonly string[];
      notification: { title: string; body: string };
      native: {
        html: string;
        text: string;
        attachments: readonly {
          filename: string;
          content: Uint8Array;
          contentType?: string;
        }[];
      };
    },
    options?: { timeout?: number },
  ): Promise<{
    ok: boolean;
    messageId?: string;
    retryable?: boolean;
    status?: string;
  }>;
}

/** The slice of the notifykit NotificationManager this module uses. */
export interface DocumentEmailTransportSource {
  provider(name: string): Promise<unknown>;
}

export type DocumentMailer = (input: DocumentEmailInput) => Promise<DocumentEmailSendResult>;

const SEND_TIMEOUT_MS = 15_000;

function describeError(error: unknown): { retryable: boolean; reason: string } {
  const reason = error instanceof Error ? error.message : "unknown error";
  const retryable = (error as { retryable?: unknown } | null)?.retryable;
  return { retryable: retryable !== false, reason };
}

/** Returns undefined when no `email` provider is configured, so callers can report `skipped`. */
export function createDocumentMailer(
  source: DocumentEmailTransportSource | undefined,
  providers: readonly string[],
): DocumentMailer | undefined {
  if (!source || !providers.includes("email")) return undefined;
  return async (input) => {
    try {
      const transport = (await source.provider("email")) as EmailTransport;
      const result = await transport.send(
        {
          to: input.to,
          cc: input.cc,
          notification: { title: input.subject, body: input.body },
          native: {
            html: `<p>${input.body.replace(/\n/g, "<br>")}</p>`,
            text: input.body,
            attachments: [
              {
                filename: input.attachment.filename,
                content: input.attachment.content,
                contentType: input.attachment.contentType ?? "application/pdf",
              },
            ],
          },
        },
        { timeout: SEND_TIMEOUT_MS },
      );
      return {
        ok: result.ok,
        provider: "email",
        messageId: result.messageId,
        retryable: result.ok ? false : (result.retryable ?? true),
        reason: result.ok ? undefined : (result.status ?? "send failed"),
      };
    } catch (error) {
      return { ok: false, provider: "email", ...describeError(error) };
    }
  };
}
