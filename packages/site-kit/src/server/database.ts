import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import type { SiteConfig } from "../config/types";

export type FormSiteId = SiteConfig["id"];
export type FormKind = "careers" | "pqrs" | "suppliers";
export type NotificationStatus = "pending" | "sent" | "failed";

export type StoredFormAttachment = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export type FormSubmissionInput = {
  site: FormSiteId;
  kind: FormKind;
  clientRequestId?: string;
  contactEmail: string;
  subject: string;
  data: Readonly<Record<string, string>>;
  attachments?: readonly StoredFormAttachment[];
};

export type PersistedFormSubmission = {
  id: number;
  trackingNumber: string;
  notificationStatus: NotificationStatus;
  confirmationStatus: NotificationStatus;
};

export type NotificationChannel = "internal" | "confirmation";

export class FormDatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormDatabaseError";
  }
}

type FormDatabasePoolGlobal = typeof globalThis & {
  __corporativoFormDatabasePool?: Pool;
};

const formDatabaseGlobal = globalThis as FormDatabasePoolGlobal;

const SITE_CODES: Record<FormSiteId, string> = {
  "la-nieve": "NV",
  unimarka: "UK",
};

const FORM_CODES: Record<FormKind, string> = {
  careers: "VAC",
  pqrs: "PQRS",
  suppliers: "PRO",
};

function getDatabasePool() {
  if (formDatabaseGlobal.__corporativoFormDatabasePool) {
    return formDatabaseGlobal.__corporativoFormDatabasePool;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const databaseHost = process.env.DATABASE_HOST?.trim();
  const databaseName = process.env.DATABASE_NAME?.trim();
  const databaseUser = process.env.DATABASE_USER?.trim();
  const databasePassword = process.env.DATABASE_PASSWORD ?? "";

  if (
    !databaseUrl &&
    (!databaseHost || !databaseName || !databaseUser || !databasePassword)
  ) {
    throw new FormDatabaseError(
      "La base de datos no esta configurada. Define DATABASE_URL o las variables DATABASE_HOST, DATABASE_NAME, DATABASE_USER y DATABASE_PASSWORD."
    );
  }

  const pool = databaseUrl
    ? mysql.createPool(databaseUrl)
    : mysql.createPool({
        host: databaseHost,
        port: Number(process.env.DATABASE_PORT || 3306),
        database: databaseName,
        user: databaseUser,
        password: databasePassword,
        charset: "utf8mb4",
        waitForConnections: true,
        connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT || 5),
        queueLimit: 0,
        ssl:
          process.env.DATABASE_SSL?.trim().toLowerCase() === "true"
            ? {}
            : undefined,
      });

  formDatabaseGlobal.__corporativoFormDatabasePool = pool;
  return pool;
}

function colombianYear(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      year: "numeric",
    }).format(date)
  );
}

function trackingNumber(
  site: FormSiteId,
  kind: FormKind,
  year: number,
  sequenceNumber: number
) {
  return `${SITE_CODES[site]}-${FORM_CODES[kind]}-${year}-${String(sequenceNumber).padStart(6, "0")}`;
}

function notificationStatus(value: unknown): NotificationStatus {
  return value === "sent" || value === "failed" ? value : "pending";
}

function rowToSubmission(row: RowDataPacket) {
  return {
    id: Number(row.id),
    trackingNumber: String(row.tracking_number),
    notificationStatus: notificationStatus(row.notification_status),
    confirmationStatus: notificationStatus(row.confirmation_status),
  } satisfies PersistedFormSubmission;
}

function safeDatabaseError(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : "unknown error";
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

function normalizeClientRequestId(value: string | undefined) {
  const normalized = value?.trim() || null;
  if (!normalized) return null;
  if (!/^[0-9a-f-]{16,64}$/i.test(normalized)) {
    throw new FormDatabaseError("El identificador de envio no es valido.");
  }
  return normalized;
}

function normalizeFilename(value: string) {
  const normalized = value.replace(/[\\/\u0000-\u001f]/g, "_").trim();
  return (normalized || "archivo-adjunto").slice(0, 255);
}

/** Stores one validated form, its consecutive number and its binary attachments atomically. */
export async function persistFormSubmission(
  input: FormSubmissionInput
): Promise<PersistedFormSubmission> {
  const clientRequestId = normalizeClientRequestId(input.clientRequestId);
  let connection: PoolConnection | undefined;

  try {
    connection = await getDatabasePool().getConnection();
    await connection.beginTransaction();

    if (clientRequestId) {
      const [existingRows] = await connection.execute<RowDataPacket[]>(
        `SELECT id, tracking_number, notification_status, confirmation_status
         FROM form_submissions
         WHERE site_id = ? AND form_kind = ? AND client_request_id = ?
         LIMIT 1
         FOR UPDATE`,
        [input.site, input.kind, clientRequestId]
      );
      const existing = existingRows[0];
      if (existing) {
        await connection.commit();
        return rowToSubmission(existing);
      }
    }

    const year = colombianYear();
    await connection.execute(
      `INSERT INTO form_submission_sequences
         (site_id, form_kind, sequence_year, next_number)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE next_number = next_number`,
      [input.site, input.kind, year]
    );

    const [sequenceRows] = await connection.execute<RowDataPacket[]>(
      `SELECT next_number
       FROM form_submission_sequences
       WHERE site_id = ? AND form_kind = ? AND sequence_year = ?
       FOR UPDATE`,
      [input.site, input.kind, year]
    );
    const sequenceNumber = Number(sequenceRows[0]?.next_number);
    if (!Number.isSafeInteger(sequenceNumber) || sequenceNumber < 1) {
      throw new Error("The form sequence could not be read.");
    }

    await connection.execute(
      `UPDATE form_submission_sequences
       SET next_number = next_number + 1
       WHERE site_id = ? AND form_kind = ? AND sequence_year = ?`,
      [input.site, input.kind, year]
    );

    const number = trackingNumber(input.site, input.kind, year, sequenceNumber);
    const [submissionResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO form_submissions
         (site_id, form_kind, sequence_year, sequence_number, tracking_number,
          client_request_id, status, contact_email, subject, payload_json)
       VALUES (?, ?, ?, ?, ?, ?, 'received', ?, ?, ?)`,
      [
        input.site,
        input.kind,
        year,
        sequenceNumber,
        number,
        clientRequestId,
        input.contactEmail,
        input.subject.slice(0, 255),
        JSON.stringify(input.data),
      ]
    );
    const submissionId = Number(submissionResult.insertId);

    for (const attachment of input.attachments ?? []) {
      await connection.execute(
        `INSERT INTO form_submission_attachments
           (submission_id, filename, content_type, size_bytes, content)
         VALUES (?, ?, ?, ?, ?)`,
        [
          submissionId,
          normalizeFilename(attachment.filename),
          attachment.contentType.slice(0, 150) || "application/octet-stream",
          attachment.content.length,
          attachment.content,
        ]
      );
    }

    await connection.commit();
    return {
      id: submissionId,
      trackingNumber: number,
      notificationStatus: "pending",
      confirmationStatus: "pending",
    };
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => undefined);
    }
    if (connection && clientRequestId && isDuplicateKeyError(error)) {
      const [existingRows] = await connection
        .execute<RowDataPacket[]>(
          `SELECT id, tracking_number, notification_status, confirmation_status
           FROM form_submissions
           WHERE site_id = ? AND form_kind = ? AND client_request_id = ?
           LIMIT 1`,
          [input.site, input.kind, clientRequestId]
        )
        .catch(() => [[] as RowDataPacket[]]);
      const existing = existingRows[0];
      if (existing) return rowToSubmission(existing);
    }
    if (error instanceof FormDatabaseError) throw error;
    console.error("No fue posible guardar el formulario", {
      site: input.site,
      kind: input.kind,
      error: safeDatabaseError(error),
    });
    throw new FormDatabaseError(
      "No fue posible guardar la solicitud en la base de datos."
    );
  } finally {
    connection?.release();
  }
}

/** Records the delivery state without changing the stored form or its number. */
export async function markNotificationStatus(
  submissionId: number,
  channel: NotificationChannel,
  status: NotificationStatus,
  errorMessage?: string
) {
  const pool = getDatabasePool();
  const column =
    channel === "internal" ? "notification_status" : "confirmation_status";
  const errorColumn =
    channel === "internal" ? "notification_error" : "confirmation_error";
  const sentAtColumn =
    channel === "internal" ? "notification_sent_at" : "confirmation_sent_at";

  if (status === "sent") {
    await pool.execute(
      `UPDATE form_submissions
       SET ${column} = 'sent', ${errorColumn} = NULL,
           ${sentAtColumn} = CURRENT_TIMESTAMP(3), updated_at = CURRENT_TIMESTAMP(3)
       WHERE id = ?`,
      [submissionId]
    );
    return;
  }

  await pool.execute(
    `UPDATE form_submissions
     SET ${column} = ?, ${errorColumn} = ?, updated_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [
      status,
      errorMessage?.slice(0, 1000) || "No fue posible enviar la notificacion.",
      submissionId,
    ]
  );
}
