#!/bin/bash

# WingIt Deployment Script for Render
# This script helps prepare your project for Render deployment

echo "🚀 WingIt Render Deployment Helper"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found render.yaml - we're in the right directory"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: This is not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Git repository detected"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Prepare for Render deployment - $(date)"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Check if we have a remote origin
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No git remote 'origin' found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/wingit.git"
    echo "   git push -u origin main"
    exit 1
fi

echo "✅ Git remote origin found"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub. Please check your git configuration."
    exit 1
fi

# Check for large files (AI model)
if [ -f "AI/best_phobert_model.pth" ]; then
    file_size=$(stat -f%z "AI/best_phobert_model.pth" 2>/dev/null || stat -c%s "AI/best_phobert_model.pth" 2>/dev/null)
    if [ "$file_size" -gt 100000000 ]; then  # 100MB
        echo "⚠️  Warning: AI model file is large ($(($file_size / 1000000))MB)"
        echo "   Consider using Git LFS for better deployment:"
        echo "   git lfs track '*.pth'"
        echo "   git add .gitattributes"
        echo "   git add AI/best_phobert_model.pth"
        echo "   git commit -m 'Add model with LFS'"
        echo "   git push"
    else
        echo "✅ AI model file size is acceptable"
    fi
fi

# Display next steps
echo ""
echo "🎉 Your project is ready for Render deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://render.com and sign up/login"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will automatically detect render.yaml"
echo "5. Review and deploy all services"
echo ""
echo "📚 Detailed instructions: See RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Your repository: $(git remote get-url origin)"
echo ""
echo "⚡ Quick deployment URLs to bookmark:"
echo "   Frontend: https://wingit-frontend.onrender.com"
echo "   Backend:  https://wingit-backend.onrender.com"
echo "   AI Server: https://wingit-ai.onrender.com"
echo ""
echo "Good luck with your deployment! 🚀"
