# Vercel Deployment Guide

## Environment Variables Required

Add these environment variables to your Vercel project settings:

### Essential Variables (Must Have)

```bash
DATABASE_URL=******
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=bbd839c4d0990f316c6f8b2f71067bcd48b9b63f935c73c4
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Optional Variables (For Full Functionality)

```bash
# Email Service
RESEND_API_KEY=your_resend_api_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# File Storage
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your_appwrite_bucket_id
```

## Steps to Deploy

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Add the environment variables above**
4. **Deploy**

## Important Notes

- Replace `your-domain.vercel.app` with your actual Vercel domain
- The `DATABASE_URL` is already configured for your Neon database
- The `NEXTAUTH_SECRET` is already generated
- Make sure to add all variables before deploying

## Troubleshooting

If you still see the error "We're having trouble loading the latest content":

1. Check Vercel Function Logs for database connection errors
2. Verify all environment variables are set correctly
3. Ensure your database is accessible from Vercel's servers
4. Check if your database has the required tables (run `npx prisma db push` locally first) 