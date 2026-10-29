# BM Lesson Studio — GitHub Pages + Firebase

This package replaces the static lesson hub with the same dark teacher workspace, hover previews, lesson editing, resource links and online saving. It contains the original 38 week slots, 277 activities, worksheets, Mahjong link and demographic activity entry. The demographic PDF is excluded from this public repository pending explicit publication approval. The motivation escape-room link still needs to be added.

## What is ready and what is not

The app uses Firebase Google sign-in and Cloud Firestore for lesson data. The web configuration and teacher UID are configured for `bm-lesson-plan`. Only that teacher can access the database under the supplied rules. No Firebase Storage, billing upgrade, or paid upload service is required. Stay on Firebase's Spark plan and within its free quotas.

Resource files are served from GitHub Pages or linked from another host such as Google Drive. Add a link in the activity editor; direct file uploads are not offered. Original worksheets are bundled with the site. Authenticated save-and-reload verification must be completed by the teacher after deployment.

The current ChatGPT-hosted copy continues to use its existing database. Connecting Firebase does not automatically transfer edits or uploads from that copy. Before migration, use its Backup button. Replace `src/seed.json` with that exported JSON so the first Firebase save starts with your latest lessons. Existing `/api/files?...` uploads must also be downloaded, hosted on GitHub or Google Drive, and linked in the Firebase version; these belong to the old host. The bundled original PDFs already work on GitHub Pages.

## One-time Firebase setup

1. In Firebase Console, choose or create a project and register a Web app. Copy its web configuration into `public/firebase-config.json` under `firebase`. This is the browser configuration, not a service-account key.
2. Enable Authentication > Google. Add `neo12phyte.github.io` under Authentication > Settings > Authorized domains. Add `localhost` only if needed for local development.
3. Enable the default Cloud Firestore database in production mode. Skip Firebase Storage.
4. For a new teacher, use the standalone `firebase-setup.html` sign-in page to obtain their UID. Set `teacherUid` in the configuration and the UID in `firestore.rules` to the same account.
5. Publish `firestore.rules` in Firebase Console, or use `firebase deploy --only firestore:rules --project bm-lesson-plan`.
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
- Add resource links to GitHub Pages, shared Google Drive files, or other activity sites. Make sure students have permission to open any shared files.
- Backup downloads a JSON copy of current lesson data.

## Data structure

`courses/business-management` stores a version and lesson IDs. Each lesson is stored separately at `courses/business-management/lessons/{weekId}`, avoiding a single growing course document. A lesson is limited to 800 KB and a course to 100 weeks. The original source archive is preserved at `public/original.html`. The build extracts its 277 embedded PDFs into static worksheet assets, preserving their bytes.

## Preview limitations

External websites may prohibit iframes using their own security policies. The app cannot override those restrictions. It supports a fallback link and converts common Google Drive and YouTube URLs into their embed variants. Original PDFs retain their printed white pages; the surrounding application is dark.

## References

- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
