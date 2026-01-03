# Deployment Fix Guide

You are encountering CORS errors and Firebase API key errors. These are caused by missing or incorrect environment variables in your Vercel and Render deployments.

Follow these steps to fix the issues.

## 1. Fix Frontend (Vercel)

You need to update your Environment Variables in Vercel Project Settings.

1.  Go to your Vercel Project Dashboard.
2.  Click on **Settings** -> **Environment Variables**.
3.  Add or Edit the following variables:

    | Variable | Value | Description |
    | :--- | :--- | :--- |
    | `NEXT_PUBLIC_API_URL` | `https://squad-up-sfhn.onrender.com/api` | **IMPORTANT:** Must end with `/api`. Your current error suggests you are missing this suffix. |
    | `NEXT_PUBLIC_SOCKET_URL` | `https://squad-up-sfhn.onrender.com` | The base URL of your backend (no `/api`). |
    | `NEXT_PUBLIC_FIREBASE_API_KEY` | *(Your Firebase API Key)* | From Firebase Console -> Project Settings. |
    | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *(Your Firebase Auth Domain)* | |
    | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *(Your Firebase Project ID)* | |
    | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *(Your Firebase Storage Bucket)* | |
    | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(Your Sender ID)* | |
    | `NEXT_PUBLIC_FIREBASE_APP_ID` | *(Your App ID)* | |
    | `NEXT_PUBLIC_APP_URL` | `https://squadup-nine.vercel.app` | Used for redirects and links. |

    > **Note:** You can find your Firebase config in your local `.env` file or in the Firebase Console.

4.  **Redeploy** your frontend for these changes to take effect. You can do this by pushing a new commit or manually redeploying in Vercel.

## 2. Fix Backend (Render)

You need to allow your Vercel frontend to access your backend.

1.  Go to your Render Dashboard.
2.  Select your Backend service.
3.  Click on **Environment**.
4.  Add or Edit the `ALLOWED_ORIGINS` variable:

    | Variable | Value |
    | :--- | :--- |
    | `ALLOWED_ORIGINS` | `https://squadup-nine.vercel.app,http://localhost:3000` |

    > **Note:** This must exactly match the URL in your browser address bar when you visit your site. If you have a custom domain, add that too (comma-separated).

5.  Render usually restarts the service automatically when you save environment variables. If not, manually deploy the latest commit.

## 3. Verify

1.  Wait for both services to redeploy.
2.  Open your browser console (F12) on your Vercel site.
3.  Try to login again.
4.  If you see "Allowed Origins" logs in your Render logs, check if your Vercel URL matches one of them.
