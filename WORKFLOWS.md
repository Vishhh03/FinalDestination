# 🔄 CI/CD Workflows

## Overview

Automated testing, building, and deployment using GitHub Actions.

## Workflow Files

```
.github/workflows/
├── ci-cd.yml          # Main CI/CD pipeline
├── docker-publish.yml # Container registry publishing
└── docker-test.yml    # Docker container testing
```

## 1. CI/CD Pipeline (`ci-cd.yml`)

### Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Jobs

#### Job 1: Build & Test
```yaml
Runs on: ubuntu-latest
Steps:
  1. Checkout code
  2. Setup .NET 8.0
  3. Restore dependencies
  4. Build solution (Release)
  5. Run 50 unit tests
  6. Collect code coverage
  7. Upload test results (30 days)
  8. Upload coverage reports (30 days)
```

**Artifacts**:
- `test-results` - Test execution results (.trx)
- `coverage-reports` - Code coverage (Cobertura XML)

#### Job 2: Docker Build
```yaml
Runs on: ubuntu-latest
Depends on: build-and-test
Condition: Push events only
Steps:
  1. Checkout code
  2. Setup Docker Buildx
  3. Build Docker image
  4. Tag with commit SHA
  5. Save image as .tar
  6. Upload artifact (7 days)
```

**Artifacts**:
- `docker-image` - Docker image (.tar)

#### Job 3: Code Quality
```yaml
Runs on: ubuntu-latest
Runs in parallel with build-and-test
Steps:
  1. Checkout code
  2. Setup .NET 8.0
  3. Restore dependencies
  4. Run static code analysis
```

### Workflow Diagram

```
Push/PR to main/develop
         ↓
    ┌────┴────┐
    │         │
    ↓         ↓
Build & Test  Code Quality
    │         (parallel)
    ↓
  Tests Pass?
    │
    ├─ No → ❌ Fail
    │
    ↓ Yes
Docker Build
    │
    ↓
✅ Success
```

### Example Output

```
✅ Build & Test
   - Restore: 5s
   - Build: 15s
   - Test: 8s (50/50 passed)
   - Coverage: 85%

✅ Docker Build
   - Build: 45s
   - Tag: 1s
   - Save: 10s

✅ Code Quality
   - Analysis: 20s
   - Warnings: 0
```

## 2. Docker Publish (`docker-publish.yml`)

### Triggers
- Version tags (v*)
- Manual workflow dispatch

### Job: Build & Push

```yaml
Runs on: ubuntu-latest
Permissions: packages:write
Steps:
  1. Checkout code
  2. Login to GitHub Container Registry
  3. Extract metadata (tags, labels)
  4. Build and push Docker image
```

### Tags Generated

```
v1.0.0 → ghcr.io/username/repo:v1.0.0
       → ghcr.io/username/repo:1.0
       → ghcr.io/username/repo:latest
```

### Usage

```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0

# Workflow automatically:
# 1. Builds image
# 2. Pushes to GitHub Container Registry
# 3. Tags with version
```

### Pull Published Image

```bash
docker pull ghcr.io/username/repo:v1.0.0
docker run -p 5000:80 ghcr.io/username/repo:v1.0.0
```

## 3. Docker Test (`docker-test.yml`)

### Triggers
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Job: Docker Test

```yaml
Runs on: ubuntu-latest
Steps:
  1. Checkout code
  2. Build Docker image
  3. Run container
  4. Test health endpoint
  5. Test Swagger UI
  6. Capture logs
  7. Stop container
```

### Tests Performed

```bash
✅ Container starts successfully
✅ Health endpoint responds (200 OK)
✅ Swagger UI accessible
✅ No errors in logs
```

## Workflow Execution Flow

### On Push to Main

```
1. Trigger ci-cd.yml
   ↓
2. Run build-and-test job
   ↓
3. Run code-quality job (parallel)
   ↓
4. If tests pass → Run docker-build job
   ↓
5. Upload artifacts
   ↓
6. ✅ Complete
```

### On Pull Request

```
1. Trigger ci-cd.yml
   ↓
2. Run build-and-test job
   ↓
3. Run code-quality job (parallel)
   ↓
4. Trigger docker-test.yml
   ↓
5. Test Docker container
   ↓
6. ✅ Complete (no Docker build)
```

### On Version Tag

```
1. Trigger docker-publish.yml
   ↓
2. Build Docker image
   ↓
3. Push to GitHub Container Registry
   ↓
4. Tag with version
   ↓
5. ✅ Published
```

## Viewing Workflow Results

### GitHub UI
1. Go to repository
2. Click **Actions** tab
3. Select workflow run
4. View job details and logs

### Download Artifacts
1. Go to workflow run
2. Scroll to **Artifacts** section
3. Download:
   - test-results
   - coverage-reports
   - docker-image

## Workflow Status Badges

Add to README.md:

```markdown
![CI/CD](https://github.com/username/repo/workflows/CI/CD%20Pipeline/badge.svg)
![Docker](https://github.com/username/repo/workflows/Docker%20Image%20Publish/badge.svg)
```

## Environment Variables

### Secrets (GitHub Settings)
- `GITHUB_TOKEN` - Automatic (for registry)

### Variables (In Workflows)
- `DOTNET_VERSION` - 8.0.x
- `REGISTRY` - ghcr.io
- `IMAGE_NAME` - ${{ github.repository }}

## Workflow Configuration

### Retention Periods
- Test results: 30 days
- Coverage reports: 30 days
- Docker images: 7 days

### Timeouts
- Build & Test: 30 minutes (default)
- Docker Build: 30 minutes (default)
- Code Quality: 15 minutes (default)

## Manual Workflow Triggers

### Via GitHub UI
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

### Via GitHub CLI
```bash
# Trigger docker-publish
gh workflow run docker-publish.yml

# Trigger docker-test
gh workflow run docker-test.yml
```

## Troubleshooting

### Tests Failing
```
Check logs:
  Actions → Workflow run → build-and-test → View logs
  
Common issues:
  - Dependency conflicts
  - Database connection
  - Missing environment variables
```

### Docker Build Failing
```
Check logs:
  Actions → Workflow run → docker-build → View logs
  
Common issues:
  - Dockerfile syntax
  - Missing files
  - Build context issues
```

### Artifacts Not Uploading
```
Check:
  - Path patterns correct
  - Files exist after build
  - Permissions set correctly
```

## Best Practices

1. **Always run tests before Docker build**
2. **Use caching for dependencies**
3. **Keep workflows fast (<10 min)**
4. **Upload artifacts for debugging**
5. **Use semantic versioning for tags**
6. **Monitor workflow execution times**
7. **Review failed workflows immediately**

## Workflow Metrics

### Average Execution Times
- Build & Test: ~30 seconds
- Docker Build: ~60 seconds
- Code Quality: ~25 seconds
- **Total**: ~2 minutes

### Success Rate
- Target: >95%
- Current: 100% (50/50 tests passing)

## Notifications

### On Failure
- Email to commit author
- GitHub notification
- Status check on PR

### On Success
- Green checkmark on commit
- Status check passed
- Artifacts available

## Workflow Updates

### Updating Actions Versions
```yaml
# Keep actions up to date
- uses: actions/checkout@v4
- uses: actions/setup-dotnet@v4
- uses: actions/upload-artifact@v4
```

### Adding New Jobs
```yaml
new-job:
  runs-on: ubuntu-latest
  needs: build-and-test
  steps:
    - uses: actions/checkout@v4
    - name: Custom step
      run: echo "Custom job"
```

## Security

### Secrets Management
- Never commit secrets
- Use GitHub Secrets
- Rotate tokens regularly

### Permissions
- Minimal required permissions
- Read-only by default
- Write only when needed

---

**Workflows Status**: Fully Automated ✅
