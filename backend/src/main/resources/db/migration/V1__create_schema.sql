CREATE TABLE categories (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(80) NOT NULL UNIQUE,
 slug VARCHAR(100) NOT NULL UNIQUE,
 description VARCHAR(250)
);
CREATE TABLE telegram_groups (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(80) NOT NULL,
 slug VARCHAR(110) NOT NULL UNIQUE,
 invite_link VARCHAR(300) NOT NULL,
 description VARCHAR(500) NOT NULL,
 category_id BIGINT NOT NULL,
 country_code VARCHAR(2), country_name VARCHAR(80),
 language_code VARCHAR(12), language_name VARCHAR(80),
 contact_email VARCHAR(254),
 status VARCHAR(16) NOT NULL,
 views BIGINT NOT NULL DEFAULT 0,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 CONSTRAINT fk_group_category FOREIGN KEY (category_id) REFERENCES categories(id),
 INDEX idx_group_status_created (status, created_at),
 INDEX idx_group_country_language (country_code, language_code)
);
CREATE TABLE group_tags (
 group_id BIGINT NOT NULL, tag VARCHAR(40) NOT NULL,
 PRIMARY KEY (group_id, tag),
 CONSTRAINT fk_tag_group FOREIGN KEY (group_id) REFERENCES telegram_groups(id) ON DELETE CASCADE
);
CREATE TABLE group_reports (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 group_id BIGINT NOT NULL,
 reason VARCHAR(100) NOT NULL,
 description VARCHAR(1500),
 status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 CONSTRAINT fk_report_group FOREIGN KEY (group_id) REFERENCES telegram_groups(id) ON DELETE CASCADE,
 INDEX idx_report_status_created (status, created_at)
);
CREATE TABLE contact_messages (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(254) NOT NULL,
 subject VARCHAR(120) NOT NULL,
 message VARCHAR(3000) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);
INSERT INTO categories(name,slug,description) VALUES
('Education','education','Learning and education communities'),('Technology','technology','Technology and gadgets'),('Jobs & Careers','jobs-careers','Jobs and career opportunities'),('Business','business','Business and entrepreneurship'),('Entertainment','entertainment','Entertainment communities'),('Gaming','gaming','Gaming communities'),('Sports','sports','Sports discussions'),('News','news','News and current affairs'),('Finance','finance','Finance and investing education'),('Health & Fitness','health-fitness','Health and fitness'),('Travel','travel','Travel communities'),('Lifestyle','lifestyle','Lifestyle and interests'),('Programming','programming','Software development'),('Marketing','marketing','Marketing communities'),('Shopping','shopping','Deals and shopping'),('Movies & Web Series','movies-web-series','Movies and series'),('Music','music','Music communities'),('Government Jobs','government-jobs','Government job preparation'),('Competitive Exams','competitive-exams','Competitive exam preparation'),('Other','other','Other communities');
