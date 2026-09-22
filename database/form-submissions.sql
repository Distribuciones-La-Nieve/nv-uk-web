-- Ejecutar una sola vez en la base MySQL de Hostinger.
-- Las tablas usan InnoDB para que el consecutivo y el expediente se guarden
-- en una transaccion.

CREATE TABLE IF NOT EXISTS form_submission_sequences (
  site_id VARCHAR(32) NOT NULL,
  form_kind VARCHAR(32) NOT NULL,
  sequence_year SMALLINT UNSIGNED NOT NULL,
  next_number INT UNSIGNED NOT NULL,
  PRIMARY KEY (site_id, form_kind, sequence_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id VARCHAR(32) NOT NULL,
  form_kind VARCHAR(32) NOT NULL,
  sequence_year SMALLINT UNSIGNED NOT NULL,
  sequence_number INT UNSIGNED NOT NULL,
  tracking_number VARCHAR(80) NOT NULL,
  client_request_id VARCHAR(64) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  contact_email VARCHAR(254) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  payload_json JSON NOT NULL,
  notification_status VARCHAR(16) NOT NULL DEFAULT 'pending',
  confirmation_status VARCHAR(16) NOT NULL DEFAULT 'pending',
  notification_error VARCHAR(1000) NULL,
  confirmation_error VARCHAR(1000) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  notification_sent_at DATETIME(3) NULL,
  confirmation_sent_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_form_tracking_number (tracking_number),
  UNIQUE KEY uq_form_sequence (site_id, form_kind, sequence_year, sequence_number),
  UNIQUE KEY uq_form_client_request (site_id, form_kind, client_request_id),
  KEY idx_form_created_at (created_at),
  KEY idx_form_contact_email (contact_email),
  KEY idx_form_kind_status (site_id, form_kind, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_submission_attachments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  submission_id BIGINT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(150) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  content MEDIUMBLOB NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_attachment_submission (submission_id),
  CONSTRAINT fk_attachment_submission
    FOREIGN KEY (submission_id) REFERENCES form_submissions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
