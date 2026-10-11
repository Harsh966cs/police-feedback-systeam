# Resume Demo Launch Plan

## Status

The local application validation milestone is complete:

- Frontend dependencies installed.
- Backend dependencies installed.
- Frontend production build passes.
- Frontend lint passes.
- Backend JavaScript syntax checks pass.

## Milestones

### 1. Local validation and launch blockers — Complete

- Install dependencies from the existing lockfiles.
- Run the frontend build and lint checks.
- Validate backend syntax and active entry point.
- Fix only issues that block startup, API access, or the feedback flow.

### 2. Deploy frontend and backend — Blocked until provider credentials are ready

- Configure hosting accounts.
- Configure MongoDB connection string.
- Configure SMTP credentials for OTP delivery.
- Configure Google reCAPTCHA site and secret keys.
- Set `VITE_API_BASE_URL` and `VITE_RECAPTCHA_SITE_KEY`.
- Deploy the backend, verify `/health`, then deploy the frontend.
- Current blocker: hosting accounts plus MongoDB, SMTP, and reCAPTCHA credentials
  are not available in this workspace.

### 3. Verify the public demo — Blocked until deployment is complete

- Send and verify a real OTP.
- Complete reCAPTCHA.
- Submit feedback.
- Confirm MongoDB persistence.
- Check CORS, HTTPS, health endpoint, and mobile layout.
- Record the public URLs and a screenshot.

## Three-hour launch sequence

1. Local validation — 45–60 minutes.
2. Backend and frontend deployment — 45–60 minutes.
3. Browser smoke test and documentation — 45–60 minutes.

This estimate excludes hosting approval, SMTP verification, MongoDB setup,
reCAPTCHA setup, DNS, and email delivery delays.

## Suggested commits

```text
deploy: configure resume demo
fix: resolve launch blockers
docs: record live demo and limitations
```

## Deferred improvements

- Persistent shared OTP storage.
- API rate limiting and structured logging.
- Automated backend and frontend tests.
- Admin dashboard or protected export.
- Full accessibility and Hindi translation review.
- Monitoring, backups, CI/CD, and custom-domain setup.

Do not commit `.env` files or any secret value.
