simcard-frontend-starter

Lightweight Ionic/Angular frontend starter you can copy into a new Ionic project and use with the provided backend (`simcard-tracking-api`).

Quick steps:

1. Install Ionic CLI if you don't have it:

   npm install -g @ionic/cli

2. Create a new Ionic Angular app:

   ionic start simcard-tracking-app blank --type=angular

3. Copy the files from `simcard-frontend-starter/src/app` into your new project's `src/app` (merge with existing files). Also copy `api.service.ts` and `environments` as needed.

4. Update `API_BASE` in `src/app/services/api.service.ts` to your backend URL (e.g. `http://localhost:3000`).

5. Run the app:

   ionic serve

If you want, I can scaffold these files directly into a freshly created Ionic project in your workspace—tell me to proceed.
