# Zenith Luxury Realty

New site for [zenithlr.com](https://zenithlr.com/): English / Spanish, sand-black-white UI, and a private team panel to edit pages, properties, and photos.

## Run locally

```bash
cd zenithlr
cp .env.example .env.local
npm install
npm run dev
```

- Site: http://localhost:3000/en
- Spanish: http://localhost:3000/es
- Team panel: http://localhost:3000/admin/login

Default panel login (change in `.env.local`):

- Email: `management@zenithlr.com`
- Password: `zenith2026`

## Contact forms

Visit, contact, sell, and newsletter forms POST to `/api/leads`. The server saves the lead and emails `management@zenithlr.com`.

Set SMTP in `.env.local` (and in cPanel → Setup Node.js App → Environment variables on TMDHosting):

```
MANAGEMENT_EMAIL=management@zenithlr.com
MAIL_FROM=Zenith Luxury Realty <management@zenithlr.com>
SMTP_HOST=mail.zenithlr.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=management@zenithlr.com
SMTP_PASS=your-mailbox-password
```

If `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` are missing, local `npm run dev` still saves the lead and logs the message. Production requires SMTP. If 587 is blocked, try `SMTP_PORT=465` and `SMTP_SECURE=true`.

## Deploy on TMDHosting

This app needs Node (cPanel **Setup Node.js App**), not PHP. Do not drop it into WordPress `public_html`.

1. Backup WordPress (`public_html` + MySQL).
2. Push this `zenithlr` folder to GitHub (never commit `.env` / `node_modules` / `.next`).
3. Clone or upload into `/home/USER/zenithlr`.
4. Create a Node app: version **20.20.2**, production, startup file **`server.js`**, URL = your domain.
5. Paste environment variables from `.env.example`.
6. **Run NPM Install**, then `npm run build`, then Restart.

Step-by-step (Spanish): [DEPLOY-TMDHOSTING.md](./DEPLOY-TMDHOSTING.md).

## What the team can edit

From `/admin`:

- Page copy in English and Spanish (Home, Rent, Sell, About, Contact, footer)
- Properties, filters (Rent / Sell / Real Estate Investments), and photo uploads
- Reviews (English / Spanish, publish, homepage order)
- Blog articles (can be added later)

Uploads are saved to `public/uploads`. Content is stored in `data/db.json` so it works without WordPress. A Supabase schema is in `supabase/schema.sql` for when you deploy.
