# Google OAuth Setup for Admin Login

## Steps to configure Google OAuth:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized domains:
   - Development: http://localhost:3000
   - Production: https://yourdomain.com
7. Add authorized redirect URIs:
   - Development: http://localhost:3000/api/auth/callback/google
   - Production: https://yourdomain.com/api/auth/callback/google
8. Copy Client ID and Client Secret to environment files

## Current Admin Email Whitelist:
- lovas.zoltan@mindenkimagyarorszaga.hu
- admin@lovaszoltan.hu

Only these email addresses can access the admin panel.