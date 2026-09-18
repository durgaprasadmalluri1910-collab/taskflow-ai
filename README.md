# TaskFlow AI

A local-first static MVP for turning messy messages, bills, and reminders into organized actions.

## Live website

[Open TaskFlow AI](https://durgaprasadmalluri1910-collab.github.io/taskflow-ai/)

## Multi-user login

The site includes Supabase email/password authentication. To enable real private accounts:

1. Create a Supabase project.
2. Copy `auth-config.example.js` to `auth-config.js`.
3. Add the project URL and public anon key from Supabase Project Settings > API.
4. Keep `auth-config.js` local; it is excluded from Git by `.gitignore`.

Never commit passwords, service-role keys, or other secrets. Until configured, the site uses a local demo workspace.

## Run locally

Open `index.html` in a browser. The app stores demo tasks in browser local storage.

## Deploy

This folder is intentionally separate from `github-portfolio` and is published with GitHub Pages.
