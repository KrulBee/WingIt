# 🚀 WingIt Deployment Guide - Render Platform

## 📋 Prerequisites

1. **GitHub Repository**: Your WingIt code pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com) (free)
3. **External Services** (optional):
   - Google OAuth2 credentials
   - Cloudinary account for media uploads
   - Gmail app password for email features

## 🎯 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. **Commit all changes** to your GitHub repository:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

2. **Verify files are in place**:
   - ✅ `render.yaml` (root directory)
   - ✅ `fe/Dockerfile`
   - ✅ `server/Dockerfile` 
   - ✅ `AI/Dockerfile`
   - ✅ Updated CORS configuration in SecurityConfig.java

### **Step 2: Deploy Database First**

1. **Go to Render Dashboard** → **New** → **PostgreSQL**
2. **Configure database**:
   - Name: `wingit-db`
   - Database Name: `wingit`
   - User: `wingit_user`
   - Region: Choose closest to you
   - Plan: **Free**
3. **Click "Create Database"**
4. **Save connection details** (you'll need them later)

### **Step 3: Deploy Backend Service**

1. **New** → **Web Service**
2. **Connect GitHub repository**
3. **Configure service**:
   - Name: `wingit-backend`
   - Root Directory: `server`
   - Environment: `Java`
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/server-0.0.1-SNAPSHOT.jar`
   - Plan: **Free**

4. **Environment Variables**:
```
DATABASE_URL=postgresql://wingit_user:password@host:port/wingit
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
PROFANITY_DETECTION_URL=https://wingit-ai.onrender.com
SPRING_PROFILES_ACTIVE=production
PORT=8080

# Optional (for full features):
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=https://wingit-frontend.onrender.com
```

5. **Click "Create Web Service"**

### **Step 4: Deploy AI Server**

1. **New** → **Web Service**
2. **Connect same GitHub repository**
3. **Configure service**:
   - Name: `wingit-ai`
   - Root Directory: `AI`
   - Environment: `Python`
   - Build Command: `pip install -r requirements_deploy.txt`
   - Start Command: `python real_ai_server.py`
   - Plan: **Free**

4. **Environment Variables**:
```
MODEL_PATH=./best_phobert_model.pth
FLASK_ENV=production
PORT=5000
```

5. **Click "Create Web Service"**

### **Step 5: Deploy Frontend**

1. **New** → **Web Service**
2. **Connect same GitHub repository**
3. **Configure service**:
   - Name: `wingit-frontend`
   - Root Directory: `fe`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free**

4. **Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://wingit-backend-s1gb.onrender.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://wingit-backend-s1gb.onrender.com/ws
NODE_ENV=production
```

5. **Click "Create Web Service"**

### **Step 6: Initialize Database**

1. **Go to your database** in Render dashboard
2. **Connect** → **External Connection**
3. **Use a database client** (like DBeaver, pgAdmin, or online tool)
4. **Run your database schema**:
   - Convert your `database.sql` from MySQL to PostgreSQL format
   - Or use the migration script below

### **Step 7: Test Your Deployment**

1. **Check all services are running**:
   - ✅ Frontend: `https://wingit-frontend.onrender.com`
   - ✅ Backend: `https://wingit-backend-s1gb.onrender.com/api/v1/health`
   - ✅ AI Server: `https://wingit-ai.onrender.com/health`

2. **Test key features**:
   - User registration/login
   - Create a post
   - AI content moderation
   - Real-time messaging

## 🔧 Database Migration (MySQL → PostgreSQL)

Since Render uses PostgreSQL, you'll need to convert your MySQL schema:

### **Key Changes Needed**:

1. **AUTO_INCREMENT** → **SERIAL**
2. **DATETIME** → **TIMESTAMP**
3. **TEXT** → **TEXT** (same)
4. **BIGINT** → **BIGINT** (same)

### **Example Conversion**:
```sql
-- MySQL
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_date DATETIME NOT NULL
);

-- PostgreSQL
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    created_date TIMESTAMP NOT NULL
);
```

## 🚨 Common Issues & Solutions

### **Issue 1: Build Fails**
```bash
# Check build logs in Render dashboard
# Common fixes:
- Ensure all dependencies are in package.json/pom.xml
- Check Java version (should be 17)
- Verify Node version (should be 18+)
```

### **Issue 2: Database Connection Fails**
```bash
# Solution: Check DATABASE_URL format
postgresql://username:password@hostname:port/database_name
```

### **Issue 3: AI Model Too Large**
```bash
# Solution: Use Git LFS for large files
git lfs track "*.pth"
git add .gitattributes
git add AI/best_phobert_model.pth
git commit -m "Add model with LFS"
git push
```

### **Issue 4: CORS Errors**
- ✅ Already fixed in SecurityConfig.java
- Verify frontend URL matches backend CORS settings

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier Limit | Your Usage |
|---------|----------------|------------|
| **Web Services** | 750 hours/month each | 3 services = 2250 hours |
| **Database** | 1GB storage, 1 month retention | Should be sufficient |
| **Bandwidth** | 100GB/month | Should be sufficient |
| **Build Minutes** | 500 minutes/month | Should be sufficient |

**Total Cost: $0/month** (within free limits)

## 🎓 Demo Preparation

1. **Custom Domain** (optional):
   - Add custom domain in Render dashboard
   - Point DNS to Render

2. **SSL Certificate**:
   - ✅ Automatic HTTPS on Render

3. **Monitoring**:
   - Check logs in Render dashboard
   - Set up uptime monitoring

4. **Demo Data**:
   - Create test users
   - Add sample posts
   - Test all features

## ✅ Deployment Checklist

- [ ] All code pushed to GitHub
- [ ] Database deployed and configured
- [ ] Backend service deployed
- [ ] AI server deployed  
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Database schema migrated
- [ ] All services health checks passing
- [ ] CORS configured correctly
- [ ] Test user registration/login
- [ ] Test post creation
- [ ] Test AI moderation
- [ ] Test real-time features
- [ ] Demo data populated

**Estimated deployment time: 3-4 hours**
**Total cost: Free**

## 🆘 Need Help?

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test each service individually
4. Check database connections
5. Review CORS configuration

Your WingIt project is now ready for professional deployment! 🎉
