# Project Guidance

## Overview

This repository contains the Rajasthan Police Feedback System:

- `Frontend/` — React 18 + Vite + Material UI application.
- `Backend/` — CommonJS Express API with MongoDB/Mongoose, Brevo API or SMTP OTP delivery, and reCAPTCHA verification.

The active backend entry point is `Backend/api/Feedback.js`. Older examples under
`Backend/SubmitedData/` and `Backend/api/helper/otpacces.js` are not part of the
active application flow.

## Commands

Run commands from the relevant directory:

```bash
cd Frontend && npm install
cd Frontend && npm run dev
cd Frontend && npm run build
cd Frontend && npm run lint

cd Backend && npm install
cd Backend && npm start
```

The frontend defaults to `http://localhost:3000` for the API. Override it with
`Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_RECAPTCHA_SITE_KEY=
```

Configure the backend through `Backend/.env`:

```env
PORT=3000
DB_URL=
SMTP_SERVICE=gmail
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
BREVO_API_KEY=
RECAPTCHA_SECRET=
OTP_TTL_MS=300000
OTP_RESEND_MS=60000
OTP_MAX_VERIFY_ATTEMPTS=5
OTP_DEBUG_RESPONSE=false
```

Never commit `.env` files, credentials, API keys, or database connection
strings.

## Active API

- `GET /health` — service and database availability.
- `POST /otp/send` — sends an email OTP.
- `POST /otp/verify` — verifies an OTP for an email.
- `POST /feedback` — validates and stores feedback when MongoDB is available.

## Development rules

- Preserve the existing frontend-to-backend API contract unless a coordinated
  frontend and backend change is required.
- Use the existing React and Material UI patterns.
- Keep user-facing errors explicit; do not silently pretend that persistence or
  verification succeeded.
- Keep OTP debug responses disabled for public deployments.
- Validate the production build and lint after frontend changes.
- Run backend syntax checks after backend changes.

## Resume-demo limitations

The current application is intended as a public resume demonstration. OTPs are
stored in backend memory, so the flow is not suitable for multiple backend
instances without a shared store. Login/signup verifies an email OTP but does
not create persistent user accounts. There is no admin dashboard or feedback
export workflow.
