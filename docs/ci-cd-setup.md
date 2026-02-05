# CI/CD Setup Guide

This document describes the GitHub Actions CI/CD pipeline configuration for Sports Yeti.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push to `main` and all pull requests.

**Jobs:**

| Job | Description | Runs On |
|-----|-------------|---------|
| `api-tests` | Laravel PHPUnit tests with MySQL and Redis | Ubuntu |
| `mobile-build` | TypeScript type checking, linting, and unit tests | Ubuntu |
| `nx-workspace` | Nx monorepo lint, test, build, and e2e | Ubuntu |

### 2. Deploy Staging Workflow (`.github/workflows/deploy-staging.yml`)

Triggered on pushes to `main` or `staging/**` branches, or manually via workflow dispatch.

**Jobs:**

| Job | Description | Trigger |
|-----|-------------|---------|
| `pre-deploy` | Detects file changes to determine what needs deployment | Always |
| `deploy-api` | Builds and packages Laravel API for deployment | API changes |
| `build-mobile-preview` | Builds Android APK and iOS simulator builds via EAS | Mobile changes |
| `deploy-admin` | Builds and deploys admin dashboard (web) | Admin changes |
| `smoke-tests` | Runs health checks against staging environment | After API deploy |
| `notify` | Sends deployment status notifications | Always |

---

## Required GitHub Secrets

Configure these secrets in your repository settings: **Settings → Secrets and variables → Actions**

### Core Secrets

| Secret | Description | Required For |
|--------|-------------|--------------|
| `NX_CLOUD_ACCESS_TOKEN` | Nx Cloud access token for distributed caching | CI workflow |

### Staging Deployment Secrets

| Secret | Description | Required For |
|--------|-------------|--------------|
| `STAGING_API_URL` | Base URL of the staging API (e.g., `https://staging-api.sportsyeti.com`) | Staging deploy |
| `EXPO_TOKEN` | Expo access token for EAS builds | Mobile builds |

### SSH Deployment (Optional)

If deploying via SSH to a staging server:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `STAGING_SSH_HOST` | SSH hostname for staging server | SSH deploy |
| `STAGING_SSH_USER` | SSH username | SSH deploy |
| `STAGING_SSH_KEY` | SSH private key (entire key content) | SSH deploy |

### Vercel Deployment (Optional)

If deploying admin dashboard to Vercel:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel API token | Admin deploy |
| `VERCEL_ORG_ID` | Vercel organization ID | Admin deploy |
| `VERCEL_PROJECT_ID` | Vercel project ID | Admin deploy |

### Notifications (Optional)

| Secret | Description | Required For |
|--------|-------------|--------------|
| `SLACK_WEBHOOK` | Slack incoming webhook URL | Slack notifications |

---

## Environment Setup

### GitHub Environments

Create the following environments in **Settings → Environments**:

1. **staging**
   - Protection rules: None (auto-deploy)
   - Secrets: `STAGING_API_URL`, deployment credentials
   
2. **staging-admin**
   - Protection rules: None (auto-deploy)
   - Secrets: Hosting provider credentials

3. **production** (future)
   - Protection rules: Required reviewers
   - Secrets: Production credentials

---

## Expo/EAS Configuration

### Get EXPO_TOKEN

1. Go to [expo.dev/accounts/[account]/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. Create a new Robot token with `Project` scope
3. Add as `EXPO_TOKEN` secret

### EAS Build Profiles

The mobile app uses these EAS build profiles defined in `apps/sports-yeti/eas.json`:

| Profile | Platform | Description |
|---------|----------|-------------|
| `development` | All | Development client with dev menu |
| `preview` | All | Internal distribution for testing |
| `production` | All | App store release builds |

---

## Nx Cloud Setup

### Get NX_CLOUD_ACCESS_TOKEN

1. Go to your Nx Cloud workspace: [cloud.nx.app](https://cloud.nx.app)
2. Navigate to **Workspace Settings → Access Tokens**
3. Create a "Read & Write" token
4. Add as `NX_CLOUD_ACCESS_TOKEN` secret

---

## Manual Workflow Dispatch

The staging deploy workflow supports manual triggers with options:

```
gh workflow run deploy-staging.yml \
  -f deploy_api=true \
  -f deploy_mobile=true \
  -f deploy_admin=false
```

Or via GitHub UI: **Actions → Deploy to Staging → Run workflow**

---

## Artifact Retention

Build artifacts are retained for **7 days**:

- `api-staging-{sha}` - Laravel API deployment package
- `admin-staging-{sha}` - Admin dashboard web build

Download artifacts from the workflow run summary.

---

## Troubleshooting

### API Tests Failing

1. Check MySQL/Redis service containers started correctly
2. Verify PHP extensions are installed
3. Check `.env.example` has all required fields

### Mobile Build Failing

1. Ensure `EXPO_TOKEN` is set and valid
2. Check EAS project is linked: `eas whoami`
3. Verify `eas.json` configuration

### Staging Deploy Not Triggering

1. Check branch name matches `main` or `staging/**`
2. Verify file changes match path filters
3. Check if jobs are being skipped due to conditions

---

## Adding New Secrets

When adding new secrets:

1. Add to GitHub repository secrets
2. Reference in workflow: `${{ secrets.SECRET_NAME }}`
3. Document in this file
4. For local development, add to `.env.example` (without values)
