# Vercel Deployment Guide

Step-by-step instructions for deploying Stellar DevTools Hub (RevyHubX) to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (the Hobby tier is free for personal projects)
- A GitHub account with access to the [RevenantLabs/RevyHub](https://github.com/RevenantLabs/RevyHub) repository
- Node.js 20+ installed locally (for pre-deploy checks)

## Step 1: Fork the Repository

1. Open [https://github.com/RevenantLabs/RevyHub](https://github.com/RevenantLabs/RevyHub).
2. Click **Fork** in the top-right corner.
3. Choose your GitHub account as the owner.
4. Keep the repository name as `RevyHub` (or rename if you prefer).
5. Click **Create fork**.

> Forking ensures your production deployment is tied to your own GitHub account and gives you full control over environment variables and domain settings.

## Step 2: Import into Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New... > Project**.
3. Under **Import Git Repository**, find your fork (e.g. `your-username/RevyHub`).
4. Click **Import**.

Vercel auto-detects Next.js. The following settings are applied automatically:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Root Directory | `.` |

No changes are needed. Click **Deploy** to proceed with defaults, or configure environment variables first (recommended).

## Step 3: Configure Environment Variables

The app works without custom environment variables because safe defaults are built into the code. For production deployments you should set the following in the Vercel project settings under **Settings > Environment Variables**:

| Variable | Required | Default (if unset) | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | No | `testnet` | Active Stellar network. Use `testnet` for public demos or `mainnet` for production tools. |
| `NEXT_PUBLIC_HORIZON_TESTNET_URL` | No | `https://horizon-testnet.stellar.org` | Horizon API endpoint for Stellar testnet. |
| `NEXT_PUBLIC_HORIZON_MAINNET_URL` | No | `https://horizon.stellar.org` | Horizon API endpoint for Stellar mainnet. |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public URL of the deployed app. Set this to your Vercel domain (e.g. `https://revyhub.vercel.app`) for correct metadata and Open Graph tags. |

### How to Add Variables in Vercel

1. Go to your project in the Vercel Dashboard.
2. Click **Settings** tab.
3. Click **Environment Variables** in the sidebar.
4. For each variable, enter the **Key**, **Value**, and select the environments (Production, Preview, Development).
5. Click **Save**.

> All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secret keys, private keys, or seed phrases in these variables. RevyHubX does not require any secrets.

### Recommended Production Configuration

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_TESTNET_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_HORIZON_MAINNET_URL=https://horizon.stellar.org
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

Setting `NEXT_PUBLIC_STELLAR_NETWORK=testnet` keeps public demos safe. The in-app network switch still allows users to query mainnet Horizon-backed tools when needed.

## Step 4: Deploy

1. After configuring environment variables, click **Deploy**.
2. Vercel clones your repository, installs dependencies, and runs the build.
3. A deployment URL is provided once the build succeeds (e.g. `https://your-project.vercel.app`).

### Build Command Details

Vercel runs these commands during the build:

```bash
npm install
npm run build
```

The build compiles the Next.js App Router pages, optimizes assets, and generates static/server-rendered routes.

## Step 5: Pre-Deploy Checks (Local)

Before pushing to production, run these checks locally to catch issues early:

```bash
npm run lint
npm run test
npm run build
```

Optionally run an audit:

```bash
npm audit --audit-level=moderate
```

All four checks should pass. CI also runs `lint`, `test`, and `build` on every push to `main` and on pull request previews.

## Step 6: Verify the Deployment

After a successful deploy, confirm the following:

1. **Homepage loads** -- the dashboard displays tool cards for all Stellar utilities.
2. **Network switch works** -- toggle between testnet and mainnet in the UI.
3. **Stellar tools respond** -- try the Address Validator with a known Stellar public key (e.g. `GAXTCLBIQCF32UQPMY4F5Y7LSCLH3YN6VQZ2K5NHWGAU5EYFO7G6PR2W`).
4. **Friendbot funds testnet accounts** -- use the Testnet Faucet Helper to fund a new testnet address.
5. **Freighter detection works** -- the Freighter Connect page detects whether the wallet extension is installed.
6. **No console errors** -- open browser DevTools and check for runtime errors.

## Custom Domain

To use a custom domain:

1. Go to **Settings > Domains** in the Vercel Dashboard.
2. Enter your domain (e.g. `hub.yourdomain.com`).
3. Follow Vercel's DNS configuration instructions:
   - **If using Vercel DNS**: add the domain and Vercel configures records automatically.
   - **If using an external registrar**: add a CNAME record pointing to `cname.vercel-dns.com`.
4. Wait for DNS propagation and SSL certificate provisioning (usually under 5 minutes).
5. Update `NEXT_PUBLIC_APP_URL` in your environment variables to match the new domain.

## Preview Deployments

Vercel automatically creates preview deployments for every push to a non-production branch and for every pull request. Preview deployments:

- Get a unique URL (e.g. `https://revyhub-git-feature-branch-username.vercel.app`)
- Use the same environment variables as Production by default
- Can be overridden per-environment in Vercel settings
- Are commented on the associated GitHub pull request by the Vercel bot

This is useful for testing changes before merging to `main`.

## Common Deployment Errors

### Build Fails with `npm audit` Errors

```
npm audit found vulnerabilities
```

**Solution**: Update dependencies locally before pushing:

```bash
npm update
npm audit fix
```

If the advisory is upstream and cannot be resolved, document it in the PR description.

### Horizon Requests Fail in the Browser

```
Failed to fetch: TypeError: Network request failed
```

**Solution**: Verify the selected network matches the Horizon URL. If using mainnet tools, ensure `NEXT_PUBLIC_HORIZON_MAINNET_URL` is set correctly. CORS issues are unlikely since Horizon allows browser requests.

### Friendbot Funding Fails

```
Account not found or Friendbot error
```

**Solution**: Confirm the destination address is a valid Stellar public key. Friendbot is testnet-only -- it cannot fund mainnet accounts.

### Freighter Network Mismatch Warning

The app detects that the Freighter extension network does not match the selected app network.

**Solution**: Either switch the app network selector or switch the network inside the Freighter browser extension. Both must agree for signing to work.

### Build Fails with Module Not Found

```
Module not found: Can't resolve 'some-package'
```

**Solution**: Ensure `package-lock.json` is committed and not gitignored. Delete `node_modules` and reinstall locally:

```bash
rm -rf node_modules package-lock.json
npm install
```

Commit the fresh `package-lock.json` and push again.

### Environment Variable Not Taking Effect

`NEXT_PUBLIC_*` variables are inlined at build time. Changing them in the Vercel Dashboard requires a **redeploy** (not just a restart). Go to **Deployments** and click **Redeploy** on the latest deployment.

### Build Output Exceeds Vercel Free Tier Limit

The Vercel Hobby plan has a serverless function size limit. If exceeded:

- Check for large unused dependencies
- Ensure no large binary files are imported into server-side code
- Review the build output size in the Vercel deploy logs

## Rollback

If a deployment introduces issues:

1. Go to **Deployments** in the Vercel Dashboard.
2. Find the last known good deployment.
3. Click the **⋯** menu and select **Promote to Production**.

Traffic immediately shifts to the promoted deployment.

## Further Reading

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Stellar SDK Documentation](https://developers.stellar.org/docs)
- [Project Architecture](./ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)
