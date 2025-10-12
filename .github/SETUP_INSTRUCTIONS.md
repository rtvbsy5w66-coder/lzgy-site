# 🚀 CI/CD Pipeline Setup Instructions

## 📋 Overview

This document provides step-by-step instructions to configure GitHub Actions CI/CD pipeline for automatic testing, building, and deployment to Vercel.

## 🔧 Prerequisites

- [ ] GitHub repository with admin access
- [ ] Vercel account and project
- [ ] Vercel CLI installed (for getting project IDs)

## 🔐 GitHub Secrets Configuration

### Step 1: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Or using yarn
yarn global add vercel
```

### Step 2: Get Vercel Information

```bash
# Login to Vercel
vercel login

# Get your user/organization ID
vercel whoami

# Navigate to your project directory
cd /path/to/your/project

# Link to existing Vercel project (or create new)
vercel link

# Get project information
vercel project ls
```

### Step 3: Create Vercel API Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions - [Project Name]`
4. Set expiration as needed
5. Copy the token (you won't see it again!)

### Step 4: Add Secrets to GitHub

Go to your GitHub repository:
1. Navigate to `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Add these secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | From Step 3 above |
| `VERCEL_ORG_ID` | Your organization ID | Run `vercel whoami` |
| `VERCEL_PROJECT_ID` | Project ID | From `vercel project ls` output |

### Example Commands to Get IDs:

```bash
# Get organization ID
vercel whoami
# Output: > Team ID: team_xxxxxxxxxxxxxxxxxxxxx

# Get project ID  
vercel project ls
# Output: > Project Name: your-project (prj_xxxxxxxxxxxxxxxxxxxxx)
```

## 🌟 Workflow Features

### 🔄 Automatic Triggers

- **Push to `main-for-vercel`**: Full CI + Production deployment
- **Push to `develop`**: Full CI + Preview deployment  
- **Pull Requests**: Full CI + Preview deployment + PR comments
- **Config changes**: Configuration validation only

### 🧪 Testing & Quality

- **TypeScript**: Type checking with `tsc --noEmit`
- **ESLint**: Code linting with Next.js rules
- **Jest**: Unit tests with coverage reports
- **Bundle Analysis**: Size monitoring and large file detection
- **Security**: npm audit for vulnerabilities

### 🚀 Deployment

- **Preview**: Automatic preview deployments for PRs
- **Production**: Automatic production deployment on main branch
- **Health Checks**: Post-deployment verification
- **Rollback**: Manual rollback via Vercel dashboard if needed

## 📊 Monitoring & Reports

### Status Badges

Add these to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
![Config Validation](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/🔧%20Configuration%20Validation/badge.svg)
```

### Coverage Reports

- Jest coverage reports are uploaded as artifacts
- Available for download from GitHub Actions runs
- Retained for 7 days

### Bundle Analysis

- Automatic bundle size monitoring
- Alerts for files > 500KB
- JavaScript chunk analysis

## 🐛 Troubleshooting

### Common Issues

#### 1. Vercel Deployment Fails

**Error**: `Error: No authorization found`
**Solution**: 
- Check that `VERCEL_TOKEN` is valid and not expired
- Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct

#### 2. Build Fails with Environment Variables

**Error**: Environment variable validation fails
**Solution**:
- The workflow sets `SKIP_ENV_VALIDATION=true` automatically
- If still failing, check your environment validation logic

#### 3. Type Check Fails

**Error**: TypeScript errors in CI but not locally
**Solution**:
```bash
# Run locally to debug
npm run type-check

# Check for different TypeScript versions
npm ls typescript
```

#### 4. Tests Fail in CI

**Error**: Tests pass locally but fail in CI
**Solution**:
```bash
# Run tests with same environment
SKIP_ENV_VALIDATION=true npm test

# Check for environment-specific issues
npm run test:coverage
```

### Getting Help

1. **Check workflow logs**: Go to Actions tab → Click on failed run
2. **Run commands locally**: Test the same commands that fail in CI
3. **Environment differences**: Ensure CI and local environments match

## 🔄 Manual Operations

### Trigger Deployment Manually

```bash
# Deploy to preview
git push origin feature-branch

# Deploy to production  
git push origin main-for-vercel
```

### Run Checks Locally

```bash
# Run all checks that CI runs
npm run type-check
npm run lint  
npm run test:coverage
npm run build

# Check bundle size
npm run build
du -sh .next/
```

### Rollback Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project
3. Go to "Deployments" tab
4. Click "..." next to a previous deployment
5. Click "Promote to Production"

## 📈 Performance Optimization

### Workflow Performance

- **Caching**: Node modules are cached automatically
- **Parallel Jobs**: Lint, test, and security run in parallel
- **Artifacts**: Build outputs are shared between jobs
- **Concurrency**: Old runs are cancelled when new ones start

### Build Performance

Current targets:
- **Build time**: < 5 minutes
- **Bundle size**: < 2MB total
- **Large files**: Alert if any file > 500KB

## 🔒 Security

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly (recommended: every 90 days)

### Environment Variables

- Production vars in Vercel dashboard
- Preview vars can be different from production
- `SKIP_ENV_VALIDATION=true` only for CI builds

## 📝 Customization

### Adding New Environments

To add staging environment:

1. Create new Vercel project for staging
2. Add staging secrets: `VERCEL_STAGING_*`
3. Modify workflow to deploy `develop` branch to staging

### Custom Health Checks

Edit `.github/workflows/ci-cd.yml`:

```yaml
- name: 🏥 Check custom endpoint
  run: |
    curl -f $URL/api/your-endpoint || exit 1
```

### Notification Integration

Add Slack/Discord notifications:

```yaml
- name: 📢 Notify Slack
  if: failure()
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"Deployment failed!"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}
```

## ✅ Verification Checklist

After setup, verify:

- [ ] All GitHub secrets are configured
- [ ] Workflow runs successfully on push
- [ ] Preview deployments work for PRs
- [ ] Production deployments work for main branch
- [ ] Health checks pass after deployment
- [ ] PR comments include preview URLs
- [ ] Status badges work in README

## 📞 Support

For issues with:
- **GitHub Actions**: Check [GitHub Actions docs](https://docs.github.com/en/actions)
- **Vercel**: Check [Vercel docs](https://vercel.com/docs)
- **Next.js**: Check [Next.js docs](https://nextjs.org/docs)

---

*Last updated: $(date)*
*CI/CD Pipeline v1.0*