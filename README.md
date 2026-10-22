# BM Lesson Studio — GitHub Pages + Firebase

This package replaces the static lesson hub with the same dark teacher workspace, hover previews, lesson editing, resource uploads and online saving. It contains the original 38 week slots, 277 activities, worksheets, Mahjong link and demographic activity entry. The demographic PDF is excluded from this public repository pending explicit publication approval. The motivation escape-room link still needs to be added.

## What is ready and what is not

The static application builds successfully. The GitHub Actions publishing workflow, Firebase adapter and restrictive rules are included. Firebase configuration is intentionally blank: no Firebase project has been created or connected, and this package has not been deployed to your GitHub repository. Actual Firebase sign-in, Firestore saves and Storage uploads require your project and rules and have not yet been tested against a live Firebase project.

The current ChatGPT-hosted copy continues to use its existing database. Connecting Firebase does not automatically transfer edits or uploads from that copy. Before migration, use its Backup button. Replace `src/seed.json` with that exported JSON so the first Firebase save starts with your latest lessons. Existing `/api/files?...` uploads must also be downloaded and re-uploaded in the Firebase version; these belong to the old host. The bundled original PDFs already work on GitHub Pages.

## One-time Firebase setup

1. In Firebase Console, choose or create a project and register a Web app. Copy its web configuration into `public/firebase-config.json` under `firebase`. This is the browser configuration, not a service-account key.
2. Enable Authentication > Google. Add `neo12phyte.github.io` under Authentication > Settings > Authorized domains. Add `localhost` only if needed for local development.
3. Enable Cloud Firestore in production mode and provision Cloud Storage if you want file uploads. Firebase may require billing to provision/use Storage; review the console's requirements before enabling it. Links and Firestore lesson editing do not require file uploads.
4. Obtain your teacher user's Firebase Authentication UID. An existing Firebase Google user can be used. For a new user, temporarily enter a nonempty placeholder `teacherUid` in the configuration and sign in once; the app refuses access because the UID does not match, but the user appears in Firebase Authentication. Copy that UID into `teacherUid` in the configuration.
5. Replace `REPLACE_WITH_TEACHER_UID` in both `firestore.rules` and `storage.rules` with that same UID. Deploy these rules from the Firebase Console or, with Firebase CLI authenticated: `firebase deploy --only firestore:rules,storage --project YOUR_PROJECT_ID`.
6. Keep the rules restrictive. The client UID check is a convenience; the deployed rules enforce access. Other accounts and signed-out visitors cannot read or write the database. The public site shell, original course assets and seed content in the repository are public on GitHub Pages, just as the existing GitHub site is; do not put confidential student records in the repository.
7. Sign in on the published site and save a lesson. The initial save imports the bundled course into Firestore. Later saves use transactions and reject stale edits from another tab.

## GitHub Pages setup

1. Back up the current `neo12phyte/Lesson_Plan_BM` repository or use a pull request before replacing its files.
2. Put this package's contents at the repository root, including the hidden `.github` directory. Do not upload a ZIP as the website itself. Keep your repository's existing Git history.
3. Ensure `public/firebase-config.json` contains the real web configuration and UID, and that the Firebase rules are deployed.
4. Set repository Settings > Pages > Build and deployment > Source to **GitHub Actions**.
5. Push to `main`. The included workflow installs dependencies, builds, and deploys `dist`. If your default branch differs, update `.github/workflows/pages.yml`.
6. The expected address for this existing repository is `https://neo12phyte.github.io/Lesson_Plan_BM/`. The Vite build uses relative asset paths so repository subfolders work.

## Local development

Use Node.js 22.13 or later:

```
npm install
npm run dev
npm run build
```

Without Firebase configuration the page displays setup instructions; it does not pretend local changes are saved online.

## Everyday use

- Hover a card for a preview; click Preview activity or a resource link to expand the preview in the same page.
- Use the resource selector to switch between a worksheet and other links.
- Press Escape or Close preview to dismiss. Open original is an explicit fallback for websites that reject embedding.
- Add activity / Edit activity updates title, type, topic, instructions, lesson placement and resources.
- Edit lesson updates its summary, unit, progress and teaching notes.
- Uploads are limited to 10 MB. Firebase Storage resource URLs are shareable download links: anyone with a token URL can access that individual file. Use this for classroom resources, not confidential records.
- Backup downloads a JSON copy of current lesson data.

## Data structure

`courses/business-management` stores a version and lesson IDs. Each lesson is stored separately at `courses/business-management/lessons/{weekId}`, avoiding a single growing course document. A lesson is limited to 800 KB and a course to 100 weeks. Uploads use `resources/{teacherUid}/{uniqueId}/{filename}`. The original source archive is preserved at `public/original.html`. The build extracts its 277 embedded PDFs into static worksheet assets, preserving their bytes.

## Preview limitations

External websites may prohibit iframes using their own security policies. The app cannot override those restrictions. It supports a fallback link and converts common Google Drive and YouTube URLs into their embed variants. Original PDFs retain their printed white pages; the surrounding application is dark.

## References

- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://firebase.google.com/docs/storage/web/upload-files
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
