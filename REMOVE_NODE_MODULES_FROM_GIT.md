# Remove node_modules from Git

## Current Status

✅ `.gitignore` already includes `node_modules/` (line 336)

This means new changes to node_modules won't be tracked, but if it was previously committed, it's still in Git history.

## Steps to Remove node_modules from Git

### Step 1: Verify node_modules is in .gitignore

The `.gitignore` file already contains:
```
node_modules/
```

If you want to be more specific for the Angular project:
```
# Node modules
node_modules/
**/node_modules/
finaldestination/ClientApp/node_modules/
```

### Step 2: Remove node_modules from Git Index (Keep Local Files)

Run these commands in your terminal:

```bash
# Remove node_modules from Git tracking (but keep the files locally)
git rm -r --cached finaldestination/ClientApp/node_modules

# Or if there are multiple node_modules folders:
git rm -r --cached **/node_modules
```

**Note:** The `--cached` flag means Git will stop tracking these files but won't delete them from your local filesystem.

### Step 3: Commit the Changes

```bash
# Stage the .gitignore changes (if you modified it)
git add .gitignore

# Commit the removal
git commit -m "Remove node_modules from Git tracking"
```

### Step 4: Push to Remote

```bash
# Push the changes to remove node_modules from remote
git push origin main
```

(Replace `main` with your branch name if different: `master`, `develop`, etc.)

### Step 5: Verify node_modules is Ignored

```bash
# Check Git status - node_modules should not appear
git status

# Verify .gitignore is working
git check-ignore -v finaldestination/ClientApp/node_modules
```

Expected output:
```
.gitignore:336:node_modules/    finaldestination/ClientApp/node_modules
```

## Complete Command Sequence

Copy and paste these commands in order:

```bash
# 1. Remove from Git tracking
git rm -r --cached finaldestination/ClientApp/node_modules

# 2. Stage all changes
git add .

# 3. Commit
git commit -m "Remove node_modules from Git tracking and ensure it's ignored"

# 4. Push to remote
git push origin main
```

## If node_modules is Still Showing Up

### Option A: Force Remove All Ignored Files

```bash
# Remove all files that should be ignored
git rm -r --cached .
git add .
git commit -m "Remove all ignored files from Git"
git push origin main
```

### Option B: Check for Nested node_modules

```bash
# Find all node_modules directories
find . -name "node_modules" -type d

# Remove each one from Git
git rm -r --cached ./path/to/node_modules
```

## Prevent Future Commits of node_modules

### Pre-commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Check if node_modules is being committed
if git diff --cached --name-only | grep -q "node_modules"; then
    echo "Error: Attempting to commit node_modules!"
    echo "Please remove node_modules from your commit."
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Clean Up Git History (Advanced - Optional)

If you want to completely remove node_modules from Git history to reduce repository size:

⚠️ **WARNING:** This rewrites Git history. Coordinate with your team first!

### Using git filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove node_modules from entire history
git filter-repo --path finaldestination/ClientApp/node_modules --invert-paths

# Force push (⚠️ DANGEROUS - coordinate with team)
git push origin --force --all
```

### Using BFG Repo-Cleaner (Alternative)

```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/

# Remove node_modules folders
java -jar bfg.jar --delete-folders node_modules

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

## Verify Everything is Clean

```bash
# Check repository size
du -sh .git

# Check what's being tracked
git ls-files | grep node_modules

# Should return nothing if successful
```

## For Team Members

After you push these changes, team members should:

```bash
# Pull the latest changes
git pull origin main

# Clean their local Git cache
git rm -r --cached .
git reset --hard

# Reinstall node_modules locally
cd finaldestination/ClientApp
npm install
```

## Summary

### Quick Fix (Recommended)
```bash
git rm -r --cached finaldestination/ClientApp/node_modules
git commit -m "Remove node_modules from Git"
git push origin main
```

### What This Does
- ✅ Stops tracking node_modules in future commits
- ✅ Removes node_modules from the remote repository
- ✅ Keeps node_modules on your local machine
- ✅ Other developers can still `npm install` to get dependencies

### What This Doesn't Do
- ❌ Doesn't remove node_modules from Git history (repo size stays the same)
- ❌ Doesn't delete node_modules from your local filesystem

### To Also Clean History (Optional)
Use `git filter-repo` or BFG Repo-Cleaner (see Advanced section above)

---

**After running these commands, node_modules will no longer be tracked by Git!**
