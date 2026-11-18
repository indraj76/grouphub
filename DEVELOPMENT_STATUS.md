# GroupHub implementation status

## Added in this update
- Optional contact email on the group submission form, including client validation and admin-only display in group moderation results.
- Homepage statistics connected to `GET /api/v1/stats`.
- About, Contact, Privacy Policy and Terms pages with routes (policy text is a draft and needs legal review).
- Admin category management UI and backend create/list/update/delete endpoints.
- Admin report management UI and backend list/status/delete endpoints.
- Expanded admin dashboard statistics and navigation.
- Spring Boot 3 / Java 21 backend scaffold, MySQL entities/repositories, Flyway schema migration, JWT admin authentication and REST endpoints.
- Contact form persists messages to MySQL, with a protected admin inbox for viewing and deleting submissions.

## Important limitations
- The uploaded archive contained only the React frontend. The backend in this updated archive is newly scaffolded and has not been connected to an existing database or deployed environment.
- Contact form messages are stored in MySQL; SMTP/email delivery and an admin inbox page are not configured.
- Public endpoints need rate limiting, spam protection and abuse monitoring before production.
- The legal pages are starter drafts, not legal advice. Add real operator details and have them reviewed before launch.
- Desktop/tablet/mobile visual inspection and browser-console testing still need to be run in a browser against the running app.
- Dependency installation could not complete in this execution environment because the npm registry package was not available. Therefore the Vite production build was not verified here. Maven is also not installed in this environment, so the Spring Boot build was not run here.

## Before first local run
1. Install Node.js 20+, Java 21, Maven 3.9+ and MySQL 8+.
2. Create the `grouphub` database.
3. Configure the backend environment variables from `backend/.env.example` (set a strong password and random JWT secret).
4. Start the backend, then run `npm install` and `npm run dev` from the project root.
5. Log in at `/admin/login` using the configured admin email and password.
