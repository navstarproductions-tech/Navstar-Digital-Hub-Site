# NAVSTAR DIGITAL HUB

Public site for NAVSTAR DIGITAL HUB, with course listings, cyber services, admissions, donations, and role-based portal previews.

## Run locally

```powershell
npm install
npm run dev
```

Create a production build with `npm run build`. Preview the output with `npm run preview`.

## Pages

- Home, Courses, Services, and Donations are public pages.
- Student, Tutor, Admissions, Principal, and Admin portals currently show preview screens.
- Enrollment collects an application draft and displays the selected course summary.
- Admin provides local previews for courses, services, gallery images, notifications, and settings.

## Backend required for production operations

GitHub Pages is static hosting. Sign-in, student records, publishing admin changes, payment prompts, transaction validation, notifications, and cashouts require a separately hosted API with authentication, authorization, input validation, and audit logging.

The frontend reads the API origin from `VITE_API_BASE_URL`. It expects these server routes when configured:

- `POST /api/auth/login`
- `POST /api/enrollments`
- `POST /api/payments/stk-push`
- `POST /api/admin/cashouts`

Do not put Daraja credentials in frontend variables, source files, or GitHub Pages. Keep consumer secrets and passkeys in the backend host's secret store, verify provider callbacks server-side, and require role-based authorization for admin and financial actions. Users must enter their M-Pesa PIN only on the official phone prompt, never on this website.

Production Daraja credentials were pasted into a chat. Revoke and rotate them before connecting a payment backend.

## GitHub Pages

GitHub Actions builds `dist` and deploys it to the Pages environment. The configured project base path is `/Navstar-Digital-Hub-Site/`.
