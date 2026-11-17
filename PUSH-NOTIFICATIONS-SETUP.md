# Rankers Nest automatic Physics Challenge notifications

The GitHub Actions workflow is configured to send a OneSignal push whenever `site-updates.json` changes on the `main` branch. It sends the newest item (the first item in the `updates` array) to the OneSignal **Total Subscriptions** audience and links to that resource.

## One-time setup still required: GitHub Actions secrets

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**. Add these two secrets:

- `ONESIGNAL_APP_ID`: the App ID for the **Rankers Nest App** in OneSignal.
- `ONESIGNAL_REST_API_KEY`: the OneSignal REST API key for that same app. Treat this as a password: never commit it to a file or share it in chat.

The workflow file is `.github/workflows/publish-push-notification.yml`. It expects those exact secret names. Do not use the Firebase `PUSH_PUBLISH_URL` / `PUSH_PUBLISH_SECRET` names for this workflow.

## How automatic delivery works

1. Publish the new Daily Physics Challenge page.
2. Add its title, description, and relative page URL as the first entry in `site-updates.json`.
3. Commit both changes to `main`.
4. GitHub Actions reads the newest update and asks OneSignal to send the notification to subscribed users.

The workflow refuses to send if either secret is missing or the newest update has no URL. GitHub Actions → **Notify Rankers Nest subscribers on new Physics Challenge** shows the run result.

## Test safely

After adding both secrets, make a small test edit to the top item in `site-updates.json` and commit it. Open the repository's **Actions** tab and check that the workflow succeeds; confirm the notification arrives on the subscribed phone. Every change to `site-updates.json` sends the newest item, so avoid unnecessary edits to that file.

Notifications go only to users subscribed to the OneSignal app. Keep the newest item first in the `updates` array.
