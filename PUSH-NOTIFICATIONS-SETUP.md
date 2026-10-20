# Rankers Nest push notifications — activation checklist

The homepage opt-in button and Firebase Messaging background handler are committed. Actual push delivery stays inactive until the steps below are completed.

## 1. Create a Web Push public key

1. Open Firebase Console: https://console.firebase.google.com/
2. Select project **rankets-nest**.
3. Open **Project settings** (gear) → **Cloud Messaging**.
4. Under **Web configuration / Web Push certificates**, generate a key pair.
5. Copy the **public key only**. Do not copy or publish any private/service-account key.

## 2. Add the public key to the website

Edit `push-config.js` in the GitHub repository and replace:
`ADD_FIREBASE_WEB_PUSH_PUBLIC_KEY_HERE`
with the public key generated above. Commit the change.

## 3. Deploy the secure server functions

Install Node.js 20+ and Firebase CLI on a trusted computer, sign in with access to the Firebase project, then run from the repository root:

```bash
npm install -g firebase-tools
firebase login
firebase use rankets-nest
firebase functions:secrets:set PUSH_PUBLISH_SECRET
```

When prompted for the secret value, create a long random value (at least 32 random characters) and keep it private. Do not commit it to GitHub. Then deploy:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Firebase may require the project to be on the **Blaze billing plan** for Cloud Functions/Secret Manager. Review Firebase's current pricing before enabling billing.

The deploy output includes the URL for `publishSiteUpdate` (region `us-central1`). Keep it for the next step.

## 4. Add GitHub Actions secrets

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

- `PUSH_PUBLISH_URL`: the deployed `publishSiteUpdate` function URL.
- `PUSH_PUBLISH_SECRET`: the exact same private secret value configured in Firebase.

Do not put either secret in a public file or chat.

## 5. Test

1. Open the live site in Chrome on the student's phone.
2. Tap **Subscribe to Notifications** and allow notifications.
3. Confirm the button changes to **Notifications enabled**.
4. Add a new item at the top of `site-updates.json` and commit it. The GitHub Actions workflow should invoke the function, which sends a push to subscribed devices.
5. Test once with a non-critical update before relying on it.

## Notes

- Notifications are opt-in and can be disabled from the browser/site notification settings.
- Push support depends on the browser, operating system and device settings.
- Existing Firestore rules can remain restrictive: the callable function stores tokens server-side with the Admin SDK.
- The public Firebase web config and VAPID public key are not Admin credentials. Never commit a Firebase service-account private key or the publishing secret.
- The GitHub workflow watches changes to `site-updates.json` on the `main` branch and sends only the newest feed item. Keep newest update first.
