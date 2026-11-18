
CREATE TABLE group_submissions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(20) NOT NULL UNIQUE,

    name VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    description VARCHAR(1000),

    telegram_username VARCHAR(40) NOT NULL,
    verify_token VARCHAR(40) NOT NULL,
    manage_secret_hash VARCHAR(64) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    member_count INT,
    join_clicks BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    verified_at TIMESTAMP(6),
    approved_at TIMESTAMP(6),

    INDEX idx_submission_status_created (status, created_at),
    INDEX idx_submission_telegram_username (telegram_username)
);
