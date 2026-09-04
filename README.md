# GNK Invoice Manager

A Next.js + Neon PostgreSQL invoice application for two fixed formats:

- Catering — based on the supplied `SBI LHO AUG26 A1.docx` layout.
- Housekeeping — based on the supplied housekeeping invoice image.

## 1. Requirements

- Node.js 20+
- A Neon PostgreSQL database
- GitHub account/repository
- Vercel account

## 2. Run locally

```bash
npm install
cp .env.example .env.local
```

Put your Neon connection string into `.env.local`:

```env
DATABASE_URL=postgresql://...
```

In the Neon SQL editor, run everything in `db/schema.sql`.

Then:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 3. Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add `DATABASE_URL` under Project Settings → Environment Variables.
4. Deploy.
5. Run `db/schema.sql` once in Neon.

## 4. Main behavior

- Home screen has Catering and Housekeeping choices.
- Company information and bank details are fixed in `lib/company.ts`.
- Invoice/buyer/line-item/tax fields are editable.
- Data is stored in Neon PostgreSQL.
- Existing invoices can be viewed and edited.
- PDF and DOCX exports are generated from saved invoice data.
- Browser Print can be used for the live formatted preview.

## 5. Important source-format note

The catering template follows the supplied DOCX structure. The housekeeping template follows the supplied photograph. Some details in the photograph are visually ambiguous, so the buyer GSTIN and editable business fields are intentionally editable instead of being hard-coded as immutable values.

## 6. Production improvements recommended later

- Authentication and user roles
- Invoice numbering rules / duplicate prevention beyond the database unique constraint
- Audit history for edits
- Logo/signature management from an admin screen
- GST validation
- Email/WhatsApp delivery
- Automatic monthly invoice creation
