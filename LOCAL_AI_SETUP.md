# 🤖 Local AI Service Setup for Render Deployment

Since Render's free tier has limited RAM (512MB) which isn't sufficient for the PhoBERT model, we run the AI service locally while deploying frontend and backend to Render.

## 🔧 Setup Steps

### **1. Get Your Local IP Address**

**Windows:**
```powershell
ipconfig
```
Look for your IPv4 Address (usually something like `192.168.1.xxx`)

**Or get your public IP (if accessible from internet):**
```powershell
curl ifconfig.me
```

### **2. Update Environment Variables**

Replace `YOUR_LOCAL_IP` with your actual IP address in:

**Frontend (`render.yaml`):**
```yaml
NEXT_PUBLIC_AI_URL=http://YOUR_LOCAL_IP:5000
```

**Backend (Render Environment Variables):**
```
PROFANITY_DETECTION_URL=http://YOUR_LOCAL_IP:5000
```

### **3. Start Local AI Service**

In the `AI` directory:
```powershell
docker-compose up --build
```

The AI service will be available at:
- `http://localhost:5000` (local)
- `http://YOUR_LOCAL_IP:5000` (network)

### **4. Configure Network Access**

**Option A: Local Network (if Render can reach your local IP)**
- Use your local network IP (192.168.x.x)
- May require router configuration

**Option B: Public Access (Recommended)**
- Use ngrok for secure tunneling:
```powershell
# Install ngrok first, then:
ngrok http 5000
```
- Use the ngrok URL (e.g., `https://abc123.ngrok.io`) instead of `YOUR_LOCAL_IP:5000`

**Option C: Cloud Instance**
- Deploy AI service to a cloud instance with more RAM
- Use the cloud instance IP/domain

### **5. Test Integration**

**Test AI Service:**
```powershell
curl http://YOUR_LOCAL_IP:5000/health
```

**Test from Render Backend:**
Check your backend logs for AI service connection status.

## 🚀 Deployment Checklist

- [ ] AI service running locally on port 5000
- [ ] Updated `NEXT_PUBLIC_AI_URL` in render.yaml
- [ ] Updated `PROFANITY_DETECTION_URL` in Render backend environment
- [ ] Network access configured (local IP or ngrok)
- [ ] Frontend deployed to Render
- [ ] Backend deployed to Render
- [ ] AI service accessible from Render backend

## 🔍 Troubleshooting

**AI Service Not Reachable:**
- Check if port 5000 is open
- Verify IP address is correct
- Test with curl from another machine
- Consider using ngrok for public access

**CORS Issues:**
- AI service already configured for Render domains
- Check browser console for CORS errors

**Memory Issues:**
- AI service uses memory-optimized mode
- Model loads per request to save RAM
- Monitor your local machine's memory usage

## 📝 Alternative Solutions

1. **Use a VPS with more RAM** (DigitalOcean, Linode, etc.)
2. **Deploy AI to Heroku with paid plan**
3. **Use cloud ML services** (AWS SageMaker, Google AI Platform)
4. **Optimize model size** (model quantization, distillation)

## 🔧 Environment Variables Summary

**Local Development:**
```
PROFANITY_DETECTION_URL=http://localhost:5000
NEXT_PUBLIC_AI_URL=http://localhost:5000
```

**Production (Render + Local AI):**
```
PROFANITY_DETECTION_URL=http://YOUR_LOCAL_IP:5000
NEXT_PUBLIC_AI_URL=http://YOUR_LOCAL_IP:5000
```

**Production (Render + ngrok):**
```
PROFANITY_DETECTION_URL=https://your-ngrok-url.ngrok.io
NEXT_PUBLIC_AI_URL=https://your-ngrok-url.ngrok.io
```
