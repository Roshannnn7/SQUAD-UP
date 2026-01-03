# Vercel Environment Variable Setup

## Your Backend URL (from Render)
https://squad-up-3fh0nrender.com

## Environment Variable to Add on Vercel

**Name:** NEXT_PUBLIC_API_URL
**Value:** https://squad-up-3fh0nrender.com/api

## Steps:

1. Go to: https://vercel.com/dashboard
2. Click on your "squadup" project
3. Click "Settings" at the top
4. Click "Environment Variables" on the left
5. Click "Add New" button
6. Enter:
   - Key: NEXT_PUBLIC_API_URL
   - Value: https://squad-up-3fh0nrender.com/api
   - Select all environments: Production, Preview, Development
7. Click "Save"
8. Go to "Deployments" tab
9. Click the three dots on the latest deployment
10. Click "Redeploy"
11. Wait for deployment to complete

## After Redeployment

Your login should work! The frontend will now correctly call:
https://squad-up-3fh0nrender.com/api/auth/verify

Instead of:
https://squadup-roshannnn7.vercel.app/api/auth/verify (wrong!)

## Verify It's Working

1. Open: https://squadup-roshannnn7.vercel.app/auth/login
2. Press F12 to open DevTools
3. Go to Network tab
4. Try logging in with Google
5. Check the request URL - should be squad-up-3fh0nrender.com
