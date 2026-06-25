# WTN Solo

A mobile-first MVP for UK one-van waste carriers to create, sign, store,
search, and export compliant digital Waste Transfer Notes (WTNs).

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Auth, Postgres, Storage) · Stripe Checkout · React Hook Form + Zod ·
@react-pdf/renderer**.

## 1. Prerequisites

- Node.js 18.18+ (Next.js 14 requirement)
- A Supabase project
- A Stripe account with one £15/month recurring price

## 2. Install

```bash
npm install
```

## 3. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `SUPABASE_SERVICE_ROLE_KEY` is only used server-side (Stripe webhook). Never
  expose it to the client.
- `NEXT_PUBLIC_STRIPE_PRICE_ID` is the Price ID for the £15/month plan.

## 4. Set up Supabase

1. Create a new Supabase project.
2. Run the migration in `supabase/migrations/0001_init.sql` against it (SQL
   editor, or `supabase db push` if you're using the Supabase CLI locally).
   This creates every table, the `wtn-private` storage bucket, all RLS
   policies, and two triggers:
   - `on_auth_user_created` — provisions a workspace, profile, empty company
     profile, and a 14-day trial subscription row the moment someone signs up.
   - `set_wtn_reference` — assigns `WTN-000123`-style reference numbers
     automatically on insert.
3. In **Authentication → URL configuration**, add
   `http://localhost:3000/dashboard` (and your production URL) as a
   redirect URL.
4. If you want frictionless signup during development, turn off "Confirm
   email" under **Authentication → Providers → Email**. Leave it on for
   production.

## 5. Set up Stripe

1. Create a recurring price: £15/month.
2. Add a webhook endpoint pointing at `/api/stripe/webhook` listening for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

For local testing, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 6. Run it

```bash
npm run dev
```

## 7. Deploy

Designed to deploy to Vercel with zero config beyond environment variables:

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add the same environment variables from `.env.local`, with
   `NEXT_PUBLIC_APP_URL` set to your production URL.
4. Update the Stripe webhook endpoint and Supabase redirect URL to match
   production.

## How it's organised

```
app/
  page.tsx                     marketing landing page
  login/, signup/               auth pages (Supabase email/password)
  dashboard/
    layout.tsx                  sidebar nav + trial/read-only banner
    page.tsx                    overview (counts, recent notes)
    wtns/page.tsx                list + search (company, postcode, date, EWC)
    wtns/new/                    6-step creation wizard + server actions
    wtns/[id]/page.tsx           detail view, signed PDF download, print view
    settings/                    company profile (prefills the transferor)
    billing/                     trial status, Stripe checkout/portal
  api/
    wtn/[id]/pdf/                 signed-URL PDF download redirect
    stripe/checkout, portal, webhook
components/
  ui/                            small Tailwind primitives (no external lib)
  wtn-wizard/                    one file per wizard step + signature pad
lib/
  supabase/                      browser / server / middleware clients
  validations/wtn.ts             Zod schemas, incl. conditional permit rules
  pdf.tsx                        @react-pdf/renderer template
  workspace.ts                   resolves the signed-in user's workspace + trial state
supabase/migrations/0001_init.sql  full schema, triggers, RLS, storage policies
```

## Design notes

The UI leans into the subject: a duplicate-ticket motif (perforated edge,
carbon-copy shadow) on the landing page, a navy/paper palette instead of the
generic AI-cream-and-serif look, and a monospace face for reference numbers
and EWC codes so they read like a real manifest rather than a generic web
form.

## Known MVP limitations (intentional, per brief)

- **No team members yet** — one user per workspace owner role; multi-user
  invites aren't built.
- **Drafts can't be edited after saving** — "Save draft & exit" stores
  whatever's been filled in, but there's no resume-and-edit screen yet; you'd
  add a `/dashboard/wtns/[id]/edit` route reusing the wizard steps.
- **"Create corrected copy"** currently links back into the wizard with a
  `?correct=id` query param but doesn't yet prefill from the original — wire
  that up in `app/dashboard/wtns/new/page.tsx` by reading the param and
  loading the source WTN's parties/waste/transfer fields as defaults.
- **EWC code field is free text**, not a searchable list — intentionally
  excluded per the brief.
- **No automated tests.** Given the compliance angle, before launch add at
  least: a test that finalising without both signatures is rejected, and a
  test that RLS actually blocks cross-workspace reads (easiest done against
  a local Supabase instance with two seeded workspaces).

## Compliance notes baked into the product

- WTNs lock once finalised (`status = 'final'`); there's no UPDATE policy
  granted to `wtn_parties`/`wtn_signatures` after insert, so edits genuinely
  aren't possible at the database layer, not just hidden in the UI.
- The waste hierarchy confirmation is a hard requirement in both the Zod
  schema and the database default — `finaliseWtn` always sets it to `true`
  and the wizard won't call it until the checkbox is ticked.
- Records aren't deleted automatically; the UI notes the 2-year minimum
  retention requirement but keeps everything indefinitely.
