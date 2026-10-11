# Rajasthan Police Feedback System

A resume-ready citizen feedback application built with React, Express,
MongoDB, email OTP verification, and Google reCAPTCHA.

## Architecture

```text
Frontend (React/Vite)  ->  Backend (Express)  ->  MongoDB
                                  |
                                  -> SMTP email for OTP
                                  -> Google reCAPTCHA verification
```

- `Frontend/` contains the public feedback UI and OTP flow.
- `Backend/` contains the API and feedback persistence.
- The active backend entry point is `Backend/api/Feedback.js`.

## Features

- OTP verification through email.
- Login and signup-style entry flow.
- Feedback categories including complaints, suggestions, cyber crime, and
  general enquiries.
- District, police station, contact, address, and feedback fields.
- Google reCAPTCHA before submission.
- MongoDB persistence when configured.
- English/Hindi display toggle.

## Local setup

### Backend

```bash
cd Backend
npm install
cp .env.example .env
npm start
```

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on the Vite development URL and calls the backend at
`http://localhost:3000` by default.

## Environment variables

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_RECAPTCHA_SITE_KEY=
```

Backend `.env`:

```env
PORT=3000
DB_URL=
SMTP_SERVICE=gmail
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
RECAPTCHA_SECRET=
OTP_TTL_MS=300000
OTP_RESEND_MS=60000
OTP_MAX_VERIFY_ATTEMPTS=5
OTP_DEBUG_RESPONSE=false
```

Never commit `.env` files or credentials.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Check service and database availability |
| POST | `/otp/send` | Send an email OTP |
| POST | `/otp/verify` | Verify an email OTP |
| POST | `/feedback` | Validate and persist feedback |

## Validation commands

```bash
cd Frontend && npm run lint
cd Frontend && npm run build
node --check Backend/api/Feedback.js
```

## Resume-demo deployment

Deploy the backend first, configure its database, SMTP, reCAPTCHA, and OTP
variables, then verify `/health`. Deploy the frontend with
`VITE_API_BASE_URL` set to the deployed backend URL and
`VITE_RECAPTCHA_SITE_KEY` set to the public reCAPTCHA key.

Before sharing the demo, verify:

1. OTP email arrives.
2. OTP verification succeeds.
3. reCAPTCHA completes.
4. Feedback submission returns success.
5. A feedback record appears in MongoDB.
6. The frontend works on a mobile-sized viewport.

See [`plan.md`](./plan.md), [`CLAUDE.md`](./CLAUDE.md), and the local deployment
skill at [`skills/resume-demo-deployment/SKILL.md`](./skills/resume-demo-deployment/SKILL.md).

## Known limitations

- OTP state is stored in backend memory and is not shared across instances.
- Login/signup verifies email ownership but does not create persistent accounts.
- There is no admin dashboard or feedback export workflow.
- Real SMTP, MongoDB, and reCAPTCHA credentials are required for a complete
  public demo.
