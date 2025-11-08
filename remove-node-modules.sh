#!/bin/bash

# Script to remove node_modules from Git tracking
# This keeps the files locally but stops Git from tracking them

echo "🧹 Removing node_modules from Git tracking..."
echo ""

# Remove node_modules from Git index
echo "Step 1: Removing from Git index..."
git rm -r --cached finaldestination/ClientApp/node_modules 2>/dev/null || echo "node_modules not in Git index (this is fine)"

# Also try to remove any other node_modules that might exist
git rm -r --cached **/node_modules 2>/dev/null || echo "No other node_modules found"

echo ""
echo "Step 2: Staging .gitignore changes..."
git add .gitignore

echo ""
echo "Step 3: Committing changes..."
git commit -m "Remove node_modules from Git tracking and update .gitignore"

echo ""
echo "Step 4: Checking status..."
git status

echo ""
echo "✅ Done! node_modules is now ignored by Git."
echo ""
echo "To push these changes to remote, run:"
echo "  git push origin main"
echo ""
echo "Note: Replace 'main' with your branch name if different (e.g., 'master')"
