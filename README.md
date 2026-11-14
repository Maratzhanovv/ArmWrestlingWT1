# Kazaly Arm Club

Responsive, eight-page student website by Aibek Baimakhan and Magzhan Assankhan.
The existing club topic, athlete biographies, weekly schedule and local photographs are retained.

## Run locally

Open this folder in VS Code and use Live Server, or run:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Visit http://127.0.0.1:8000. Use localhost or HTTPS for password hashing and clipboard support.
There is no build step, npm installation, jQuery or Bootstrap dependency.

## Pages

Home (`index.html`), Our club (`about.html`), Training (`training.html`), Gallery (`gallery.html`), Contact (`contact.html`), Sign up (`join.html`), Log in (`login.html`), Profile (`profile.html`).

## Features

- Responsive Grid/Flexbox layouts, mobile navigation, focus indicators and reduced-motion support.
- Persistent light/dark theme shared across pages.
- Browser-local signup/login/logout, duplicate-email checks and member profile.
- Passwords stored as salted PBKDF2 hashes, never displayed in the profile.
- All forms use `novalidate` and JavaScript validation with inline field errors.
- Training search, focus filters, persisted filters and member-specific saved sessions.
- Searchable FAQ, expandable photographs, newsletter simulation and schedule copy.
- Live Kazaly weather via Open-Meteo, including loading, timeout, error and retry states.
- All images are local files from the original project.

Authentication is a coursework simulation, not production security. Accounts can be modified through browser storage. Use demo credentials, not a real password. Contact messages and subscriptions are saved locally; they do not send anything. Saved training sessions are bookmarks, not reservations.

API documentation: https://open-meteo.com/en/docs

## Checks

```sh
node --check js/script.js
node tests/check.js
python tests/check_links.py
```

Manual review before submission: test desktop/tablet/mobile widths, light and dark modes, keyboard navigation, signup/login/logout, gallery, forms, and API success/failure in a browser. Automated checks do not replace visual review.

## Hosting and submission

Upload the contents of this folder to the existing GitHub repository (keep your team commit history). In GitHub Settings → Pages, select Deploy from a branch, your main branch and `/ (root)`. Alternatively deploy this folder as a static site on Netlify or Vercel. All asset paths are relative to support project subpaths.

Submit both the verified live URL and repository URL. Hosting has not been configured by this update. The original repository is https://github.com/Maratzhanovv/ArmWrestlingWT1.

Suggested presentation: club purpose → responsive design/theme → signup and profile → saved/filtered sessions → external API and failure handling → team contributions.
