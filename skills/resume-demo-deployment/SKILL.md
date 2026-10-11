---
name: resume-demo-deployment
description: Deploy and verify the Rajasthan Police Feedback System as a public resume demo.
---

# Resume Demo Deployment Skill

## Prerequisites

- Node.js 18 or newer.
- A frontend hosting account.
- A backend hosting account.
- MongoDB connection string.
- SMTP credentials that can send OTP email.
- Google reCAPTCHA site and secret keys.

## Local validation

```bash
cd Backend && npm install && node --check api/Feedback.js
cd ../Frontend && npm install && npm run lint && npm run build
```

## Deployment order

1. Deploy `Backend/` with start command `npm start`.
2. Set backend `PORT`, `DB_URL`, `BREVO_API_KEY`, `SMTP_FROM`, `RECAPTCHA_SECRET`, and
   `OTP_DEBUG_RESPONSE=false`.
3. Verify `GET /health`.
4. Deploy `Frontend/` with build command `npm run build`.
5. Set `VITE_API_BASE_URL` to the deployed backend URL and set
   `VITE_RECAPTCHA_SITE_KEY`.
6. Open the frontend and run the complete browser smoke test.

## Smoke test

1. Enter name, mobile number, and email.
2. Send an OTP and confirm the email arrives.
3. Verify the OTP.
4. Complete reCAPTCHA.
5. Fill the feedback fields and submit.
6. Confirm the success message and MongoDB record.
7. Check the backend health endpoint.

## Troubleshooting

- OTP failure: verify the Brevo API key, verified sender address, and provider logs. SMTP is used only when `BREVO_API_KEY` is absent.
- CORS failure: allow the exact deployed frontend origin in the backend.
- CAPTCHA failure: verify the site key domain and backend secret.
- Database failure: verify the MongoDB network allowlist and connection string.
- Blank frontend: verify `VITE_API_BASE_URL` was set before the frontend build.

Never place credentials in this file or in source control.
