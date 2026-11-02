# thecodewolf.com

Single-page personal site for Alex Wolf — The Code Wolf.

Plain HTML, CSS, and vanilla JS. No build step, no framework, no bundler.

## Structure

```
index.html                 All markup — nav, hero, about, AI, skills, work, contact, footer
css/styles.css             Design tokens + all styles
js/main.js                 Typewriter, mobile nav, scroll-spy, reveals, contact form
images/                    city.jpg (hero bg), profile.png (portrait)
staticwebapp.config.json   Azure SWA headers, caching, fallback routing
.github/workflows/         CI/CD to Azure Static Web Apps
```

## Running locally

Any static server works:

```bash
python -m http.server 5173
# http://localhost:5173
```

## Contact form

Posts to [Formspree](https://formspree.io/forms) at `https://formspree.io/f/xeaappan`.
Submission is AJAX via `fetch`, with inline validation and status messages; it falls
back to a normal form POST if JavaScript is unavailable. The `_subject` field is a
Formspree reserved name that sets the notification email's subject line.

## Deployment

Pushes to `main` deploy to Azure Static Web Apps via GitHub Actions. Pull requests get
a preview environment, torn down when the PR closes.

Target Static Web App: **lemon-forest-042109210**.

**Required repository secret:** `AZURE_STATIC_WEB_APPS_API_TOKEN_LEMON_FOREST_042109210`
— the deployment token from the Static Web App (Azure Portal → the SWA → Overview →
*Manage deployment token*). This secret already exists on the repo from the previous site.
