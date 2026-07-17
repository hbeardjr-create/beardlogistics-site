# Beard Logistics Website QA Report

## Scope
Static source audit of 15 HTML pages, shared assets, Netlify configuration, internal navigation, forms, metadata, and responsive CSS.

## Passed
- No embedded base64/data URI images remain.
- All local image references resolve to files in `/assets/images`.
- All internal navigation links resolve to existing pages or approved redirects.
- Capability Statement links now resolve to `/capability-statement.html`.
- Contact form is configured as a Netlify form named `contact-quote` with honeypot protection and a thank-you destination.
- Interactive quote bot submits to a Netlify form named `quote-bot`.
- Approved company history is present directly in `about-us.html`; runtime content rewriting is no longer required.
- Edge Functions were removed and Netlify configuration was simplified.
- Duplicate warehousing/cross-docking URL redirects permanently to `/cross-docking.html`.
- All content pages include a viewport declaration and exactly one H1.
- Images include alternative text.
- Form controls with visible IDs have associated labels or accessible names.
- Titles and meta descriptions are present on indexable content pages.
- Responsive breakpoints exist for navigation, grids, forms, and footer layouts.
- Security and caching headers are configured in `netlify.toml`.

## Deployment notes
1. Deploy the repository to Netlify.
2. In Netlify, open **Forms → Form notifications** and add an email notification for `contact-quote` and `quote-bot` to `henry@beardlogistic.com`. Netlify form capture works from the source, but notification recipients are an account-level setting and cannot be embedded safely in the website.
3. Submit one test through each form after deployment and confirm receipt.
4. Verify the custom domain uses the intended primary hostname and update canonical URLs if the production hostname differs.

## Go-live result
Source-level QA: PASS. Production approval remains conditional on successful Netlify deploy and live form-delivery tests.
