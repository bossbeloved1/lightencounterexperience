LIGHT ENCOUNTER EXPERIENCE — EPHPHATHA WEBSITE

PAGES
- index.html: minimal fire-themed homepage
- register.html: responsive registration form
- admin/login.html and admin/dashboard.html: private admin portal
- qr-generator.html: generate/download a QR code for the deployed homepage

SOUND
Put your audio file at: assets/sounds.mp3
The homepage already references this path. The sound is triggered by the visitor's click.

SUPABASE SETUP (needed for live registrations/admin)
1. Create a Supabase project.
2. Open database/schema.sql and run it in Supabase SQL Editor.
3. Open js/config.js and replace YOUR_SUPABASE_PROJECT_URL and YOUR_SUPABASE_ANON_PUBLIC_KEY.
4. In Supabase Authentication > Users, create the three admin accounts.
5. Copy each admin user's UUID and insert the three UUIDs into public.lee_admins using the SQL comment at the bottom of schema.sql.
6. Keep the anon/public key in the browser; NEVER put a service-role key in frontend code.
7. Enable email/password sign-in. Share the three admin credentials privately with the administrators.

EXPORTS
CSV and Word-compatible .doc export are built in. Excel export is provided through CSV, which opens in Excel; use Save As > .xlsx. For native .xlsx, add a spreadsheet library or implement server-side export.

SECURITY
The SQL policies are intended to allow public inserts only and restrict reading/deleting to authenticated users whose UUID is in lee_admins. Test policies in your Supabase project before publishing. Do not expose admin credentials.

NOTES
- The QR generator accepts the final deployed homepage URL.
- Browser audio playback requires a user click; the homepage handles this.
- Google Fonts, Supabase JS and QRCode.js load from CDNs, so an internet connection is needed for those libraries.


SCHOOL FIELD UPDATE
If the Supabase registrations table already exists, run this in Supabase SQL Editor:
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS school text;
