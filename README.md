# GroupHub

GroupHub is a Telegram-only group directory. This repository now contains the React/Vite frontend and a Spring Boot/MySQL backend scaffold wired to the existing frontend API contract.

## Requirements
- Node.js 20+ and npm
- Java 21
- Maven 3.9+
- MySQL 8+

## Start the database
Create a MySQL database (Flyway can create the schema, but the database itself must exist):

```sql
CREATE DATABASE grouphub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Start the backend
In `backend/`, set environment variables before running. At minimum change the admin password and JWT secret for any non-local deployment.

PowerShell example:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/grouphub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="use-a-strong-local-password"
$env:JWT_SECRET="replace-with-a-random-secret-of-at-least-32-bytes"
./mvnw spring-boot:run
```

If Maven Wrapper is not present, run `mvn spring-boot:run`.

The first Flyway migration creates the tables and starter categories. Admin login is `POST /api/v1/admin/auth/login` using the configured environment credentials (`ADMIN_USERNAME` is the admin email address expected by the existing login screen). The backend issues an 8-hour signed JWT.

## Start the frontend
In the repository root:

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed. Open http://localhost:5173.

`.env.example` points the frontend to `http://localhost:8080/api/v1`.

## Implemented API areas
- Public group listing, search, details, trending, submission and reports
- Public categories and public statistics
- Contact message submission and protected admin contact inbox
- Admin login and dashboard statistics
- Admin group approval, rejection and deletion
- Admin category CRUD (category deletion is blocked while groups reference it)
- Admin report listing, status updates and deletion

## Important production work before launch
- Replace local CORS origins with your real frontend origin.
- Use a secrets manager/environment variables; never commit credentials.
- Add rate limiting and anti-spam/CAPTCHA for public submission, reporting and contact endpoints.
- Add email delivery or an admin inbox workflow for contact messages; currently messages are persisted in MySQL only.
- Review Privacy Policy and Terms with a qualified legal professional and add the operator's real contact details.
- Add pagination for report management and an admin UI for viewing contact messages if needed.
- Configure HTTPS, backups, monitoring and production database credentials.
