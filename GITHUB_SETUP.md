# GitHub OAuth Setup

## Quick Setup Steps:

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Fill in OAuth App Details**
   - Application name: `Your App Name`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Get Your Credentials**
   - Copy the Client ID
   - Generate and copy the Client Secret

4. **Update Environment Variables**
   - The .env file already has the correct structure
   - Replace the values with your actual GitHub credentials:
   ```
   GITHUB_CLIENT_ID=your_actual_client_id
   GITHUB_CLIENT_SECRET=your_actual_client_secret
   ```

5. **Test the Setup**
   - Visit: http://localhost:3000/test-github
   - Click "Sign In with GitHub"
   - Should authenticate and show your access token

6. **Use Import Feature**
   - Visit: http://localhost:3000/admin/projects/import
   - Should automatically authenticate and show your repositories

## Current Status:
- ✅ NextAuth configuration is correct
- ✅ Environment variables are set up
- ✅ API routes are created
- ⚠️ Need actual GitHub OAuth app credentials