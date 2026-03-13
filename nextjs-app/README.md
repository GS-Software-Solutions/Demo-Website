## Next.js Demo App

### Run locally

```bash
npm install
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Required environment variables

Set these in local `.env.local` and in Vercel project settings:

- `SEXYTALK_API_KEY`: API key for `https://api.sexytalk.io/inference`
- `OPENAI_API_KEY`: key used by `/api/langcheck` and `/api/gendercheck`
- `APP_ACCESS_CODE`: access code checked on the server at login
- `ACCESS_COOKIE_SECRET`: long random secret used to sign auth cookies

Example:

```bash
SEXYTALK_API_KEY=...
OPENAI_API_KEY=...
APP_ACCESS_CODE=...
ACCESS_COOKIE_SECRET=...
```

### Security model

- The access code is validated server-side (`/api/auth/login`).
- Browser sessions use an `HttpOnly` signed cookie (`chatcraft_auth`).
- Proxy routes require that auth cookie and no longer accept browser-supplied API keys.
- API keys are read only from server environment variables.
