
ALTER TABLE telegram_groups
ADD COLUMN submission_code VARCHAR(20) NULL;

CREATE UNIQUE INDEX uk_telegram_groups_submission_code
ON telegram_groups (submission_code);

