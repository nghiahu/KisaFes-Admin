# Implementation Notes — Admin Portal Auth & Token Refresh

## 1. Summary
Implemented secure role-based access control for the Admin Portal, seeded correct system roles, and added auto-refresh token logic.

## 2. Specs used
- User instructions regarding admin permissions and role requirements.

## 3. Project conventions detected
- Architecture: React frontend with Axios client (`axiosClient`), Spring Boot backend with `CommandLineRunner` data seeder.
- API pattern: Refresh token passed securely via HttpOnly cookie.
- UI pattern: Redux Toolkit for authentication state.

## 4. Files changed
- `FrontEnd-admin/src/features/auth/Login.tsx` — Added role validation to block non-admin users (`ADMIN`, `SUPER_ADMIN`).
- `BackEnd/src/main/java/org/example/backend/service/DataSeeder.java` — Configured automatic seeding for `ADMIN` (User & Category management only) and `SUPER_ADMIN` (all permissions).
- `FrontEnd-admin/src/services/axiosClient.ts` — Added interceptor logic to auto-refresh tokens using a pending request queue. Excluded `/login` endpoint from auto-refresh to prevent page reloads on wrong credentials.

## 5. Decisions not explicitly in the spec
- Used raw `axios` instead of `axiosClient` for the `/refresh` endpoint call to prevent infinite interceptor loops if the refresh itself fails with 401.
- Implemented a queue (`failedQueue`) to hold any API requests that fail while the token is actively refreshing.

## 6. Changes required by existing code
- Modified DataSeeder to explicitly handle `Set.of(SystemPermission.values())` for `SUPER_ADMIN`.

## 7. Trade-offs
- No auto-created test users; relies on manual assignment in DB per user preference.

## 8. Deviations from spec
- None.

## 9. Data / API / schema notes
- `ADMIN` is strictly limited to `USER_VIEW`, `USER_MANAGE`, `CATEGORY_VIEW`, `CATEGORY_MANAGE`.

## 10. Testing and verification
- Awaiting user test via backend restart and frontend login.

## 11. Known limitations and follow-up
- None.
