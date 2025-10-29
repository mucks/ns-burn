# GitHub Secrets Template

Copy this template when setting up GitHub Secrets for automated deployment.

## Required Secrets

Go to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

### 1. SERVER_HOST
**Description:** Your server's IP address or domain name  
**Example:**
```
123.45.67.89
```
or
```
server.mucks.me
```

---

### 2. SERVER_USER
**Description:** SSH username for your server  
**Example:**
```
mucks
```
or
```
ubuntu
```

---

### 3. SERVER_SSH_KEY
**Description:** Your SSH private key for authentication  
**How to get:**
```bash
cat ~/.ssh/id_rsa
```
**Example:** (Copy the ENTIRE output)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...
(many lines)
...
-----END OPENSSH PRIVATE KEY-----
```

---

### 4. NEXT_PUBLIC_SOLANA_NETWORK
**Description:** Solana RPC endpoint URL  
**Examples:**

For **Devnet**:
```
https://api.devnet.solana.com
```

For **Mainnet-Beta**:
```
https://api.mainnet-beta.solana.com
```

For **Custom RPC** (like Helius or Alchemy):
```
https://rpc.helius.xyz/?api-key=YOUR_KEY
```

---

### 5. NS_BURN_DOMAIN
**Description:** Your custom domain for the application  
**Example:**
```
ns-burn.mucks.me
```

---

## Optional Secrets

### GITHUB_TOKEN
**Description:** Automatically provided by GitHub Actions. No need to add manually.

---

## Verification Checklist

After adding secrets, verify:

- [ ] All 5 required secrets are added
- [ ] SECRET_SSH_KEY includes BEGIN and END lines
- [ ] SERVER_HOST is accessible: `ping YOUR_SERVER_HOST`
- [ ] SSH key works: `ssh -i ~/.ssh/id_rsa SERVER_USER@SERVER_HOST`
- [ ] Domain DNS is configured: `dig ns-burn.mucks.me`

---

## Testing SSH Connection

Before deploying, test your SSH connection:

```bash
# Test connection
ssh -i ~/.ssh/id_rsa mucks@YOUR_SERVER_HOST

# If successful, you should be logged into your server
# Type 'exit' to disconnect
```

---

## Adding Secrets via GitHub UI

1. Go to your repository on GitHub
2. Click **Settings** (repository settings, not account settings)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. For each secret:
   - Enter the **Name** (e.g., `SERVER_HOST`)
   - Enter the **Value** (e.g., `123.45.67.89`)
   - Click **Add secret**

---

## Security Notes

- ✅ Secrets are encrypted by GitHub
- ✅ Secrets are not visible after creation (can only update/delete)
- ✅ Secrets are not exposed in logs
- ✅ Only GitHub Actions workflows can access secrets
- ⚠️ Don't commit secrets to your repository
- ⚠️ Don't echo secrets in workflow scripts

---

## Need Help?

If you're stuck:

1. **SSH Key Issues**: Make sure you're copying the PRIVATE key (usually `~/.ssh/id_rsa`), not the public key (`.pub`)
2. **Server Access**: Test SSH connection manually before using in GitHub Actions
3. **Domain Issues**: Verify DNS with `dig ns-burn.mucks.me` and ensure it points to your server IP
4. **Docker Issues**: Ensure Docker and Docker Compose are installed on your server

See `GITHUB_ACTIONS.md` for complete troubleshooting guide.

