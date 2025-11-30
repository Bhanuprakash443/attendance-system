# How to Push to GitHub and Deploy on Render

## Step 1: Initialize Git (if not already done)

Open terminal in your project folder and run:

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in top right → **"New repository"**
3. Fill in:
   - **Repository name**: `attendance-system` (or any name)
   - **Description**: "Employee Attendance Management System"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

## Step 3: Add Files and Commit

In your terminal (in project folder):

```bash
# Add all files
git add .

# Commit the files
git commit -m "Initial commit: Attendance system frontend"
```

## Step 4: Connect to GitHub and Push

```bash
# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/john/attendance-system.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Sign up/Login (can use GitHub account)
3. Click **"New"** → **"Static Site"**
4. Click **"Connect GitHub"** and authorize
5. Select your repository: `attendance-system`
6. Configure:
   - **Name**: `attendance-system`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
7. Click **"Create Static Site"**
8. Wait for deployment (2-3 minutes)
9. Your site will be live at: `https://attendance-system.onrender.com`

## Troubleshooting

### "Repository not found"
- Check repository name and username are correct
- Make sure repository exists on GitHub

### "Permission denied"
- Use GitHub Personal Access Token instead of password
- Or use SSH: `git@github.com:USERNAME/REPO.git`

### "Branch main does not exist"
```bash
git branch -M main
git push -u origin main
```

### Already have a remote?
```bash
# Check current remote
git remote -v

# Update remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

## Quick Commands Reference

```bash
# Check status
git status

# See what files will be committed
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# View remote
git remote -v
```

## Next Steps After Push

1. ✅ Repository is on GitHub
2. ✅ Connect to Render
3. ✅ Deploy automatically
4. ✅ Get live URL

Your app will auto-deploy on every push to main branch!

