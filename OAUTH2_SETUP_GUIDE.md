# OAuth2 Setup Guide for Render Deployment

## 🔧 Environment Variables to Set in Render

### Backend Service (Java Spring Boot)
```
# Database
DATABASE_URL=postgresql://wingit_user:password@host:port/wingit

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-at-least-64-characters
SPRING_PROFILES_ACTIVE=production
PORT=8080

# OAuth2 Google Configuration
GOOGLE_CLIENT_ID=your-google-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-google-console
OAUTH2_REDIRECT_URI=https://your-backend-url.onrender.com/login/oauth2/code/google

# Service URLs
BACKEND_URL=https://your-backend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com
PROFANITY_DETECTION_URL=http://YOUR_LOCAL_IP:5000

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Email (Password Reset)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Frontend Service (Next.js)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-backend-url.onrender.com/ws
NEXT_PUBLIC_AI_URL=https://wingit-ai.onrender.com
NODE_ENV=production
```

### AI Service (Python Flask)
```
MODEL_PATH=./best_phobert_model.pth
FLASK_ENV=production
PORT=5000
```

## 🚀 Google OAuth2 Setup Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API (or Google Identity API)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add Authorized redirect URIs:
   - `https://your-backend-url.onrender.com/login/oauth2/code/google`
   - `http://localhost:8080/login/oauth2/code/google` (for local testing)
7. Copy the Client ID and Client Secret

### 2. Render Environment Variables
- Set `GOOGLE_CLIENT_ID` to your Google Client ID
- Set `GOOGLE_CLIENT_SECRET` to your Google Client Secret
- Set `OAUTH2_REDIRECT_URI` to `https://your-backend-url.onrender.com/login/oauth2/code/google`
- Set `FRONTEND_URL` to your frontend URL (e.g., `https://your-frontend-url.onrender.com`)

## ✅ Code Changes Made

1. **Enabled OAuth2 in SecurityConfig.java** - Uncommented OAuth2 configuration
2. **Fixed hardcoded URLs** - Now uses `${app.base-url}` environment variable
3. **Updated OAuth2AuthenticationSuccessHandler** - Uses dynamic frontend URL
4. **Updated OAuth2AuthenticationFailureHandler** - Uses dynamic frontend URL

## 🧪 Testing OAuth2

### Local Testing:
1. Set environment variables in your IDE or application.properties
2. Use `http://localhost:3000` as FRONTEND_URL
3. Use `http://localhost:8080` as BACKEND_URL
4. Add `http://localhost:8080/login/oauth2/code/google` to Google OAuth2 redirects

### Production Testing:
1. Deploy to Render with all environment variables set
2. Test the Google login button on your frontend
3. Check Render logs for any OAuth2 errors

## 🔍 Troubleshooting

- **Redirect URI mismatch**: Make sure the redirect URI in Google Console exactly matches your backend URL
- **Invalid client error**: Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- **CORS errors**: Make sure your frontend URL is correctly set in FRONTEND_URL variable

## 📋 Deployment Checklist

- [ ] Google Cloud OAuth2 app created
- [ ] Redirect URIs added to Google OAuth2 app
- [ ] All environment variables set in Render
- [ ] Backend service deployed and running
- [ ] Frontend service deployed and running
- [ ] OAuth2 login button tested
