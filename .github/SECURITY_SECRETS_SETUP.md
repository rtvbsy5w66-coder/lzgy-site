# 🔐 GitHub Secrets Setup for Security Workflows

Ez a dokumentum leírja, hogyan kell beállítani a GitHub repository secrets-eket a biztonsági workflow-k működéséhez.

## 🔑 KÖTELEZŐ SECRETS

### Repository Settings → Secrets and variables → Actions

Navigáljon a GitHub repository-ban: **Settings** → **Secrets and variables** → **Actions**

## 📋 SECRETS LISTA

### 🔐 **Alapvető Biztonsági Secrets**

| Secret Name | Leírás | Példa/Formátum | Kötelező |
|-------------|--------|----------------|----------|
| `SNYK_TOKEN` | Snyk vulnerability scanning | `abcd1234-efgh-5678-ijkl-9012mnop3456` | ✅ |
| `GITLEAKS_LICENSE` | GitLeaks Pro license | `ghs_abcdefgh123456789` | ❌ |
| `SLACK_WEBHOOK_URL` | Slack notifications | `https://hooks.slack.com/services/...` | ❌ |

### 🗄️ **Database & Testing Secrets**

| Secret Name | Leírás | Példa/Formátum | Kötelező |
|-------------|--------|----------------|----------|
| `TEST_DATABASE_URL` | Test database connection | `mysql://user:pass@host:3306/test_db` | ✅ |
| `CI_ENCRYPTION_KEY` | CI/CD encryption key | `base64-encoded-32-char-key` | ✅ |

### 📧 **Notification Secrets (Opcionális)**

| Secret Name | Leírás | Példa/Formátum | Kötelező |
|-------------|--------|----------------|----------|
| `DISCORD_WEBHOOK` | Discord notifications | `https://discord.com/api/webhooks/...` | ❌ |
| `TEAMS_WEBHOOK` | Microsoft Teams | `https://outlook.office.com/webhook/...` | ❌ |

## 🛠️ SECRETS BEÁLLÍTÁSA

### 1. 🔍 **Snyk Token Beszerzése**

```bash
# 1. Regisztráljon: https://snyk.io
# 2. Account Settings → General → Auth Token
# 3. Másolja le a token-t
# 4. GitHub Repository → Settings → Secrets → New repository secret
# Name: SNYK_TOKEN
# Value: [az ön snyk token-je]
```

### 2. 📊 **Slack Webhook Beállítása**

```bash
# 1. Slack workspace → Apps → Incoming Webhooks
# 2. Add to Slack → Create webhook
# 3. Válasszon channel: #security-alerts
# 4. Copy Webhook URL
# Name: SLACK_WEBHOOK_URL  
# Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 3. 🗄️ **Test Database Setup**

```bash
# CI test database (lehet local MySQL vagy cloud service)
# Name: TEST_DATABASE_URL
# Value: mysql://root:test_password@127.0.0.1:3306/lovas_test
```

### 4. 🔐 **CI Encryption Key**

```bash
# Generálás:
openssl rand -base64 32

# Name: CI_ENCRYPTION_KEY
# Value: [generated key]
```

## 📋 SECRETS ELLENŐRZŐ LISTA

Győződjön meg róla, hogy az alábbi secrets be vannak állítva:

### ✅ **Minimális Konfiguráció (Alapműködéshez)**
- [ ] `SNYK_TOKEN` - Vulnerability scanning
- [ ] `TEST_DATABASE_URL` - CI test database
- [ ] `CI_ENCRYPTION_KEY` - Encryption for CI

### ✅ **Teljes Konfiguráció (Teljes funkcionalitáshoz)**
- [ ] `SNYK_TOKEN`
- [ ] `GITLEAKS_LICENSE` (ha van Pro license)
- [ ] `SLACK_WEBHOOK_URL` - Slack notifications
- [ ] `TEST_DATABASE_URL`
- [ ] `CI_ENCRYPTION_KEY`
- [ ] `DISCORD_WEBHOOK` (opcionális)
- [ ] `TEAMS_WEBHOOK` (opcionális)

## 🔧 SECRETS TESZTELÉSE

### GitHub Actions Workflow Trigger

```bash
# 1. Push commit a main branch-re
git add .
git commit -m "test: trigger security workflow"
git push origin main

# 2. Ellenőrizze a workflow eredményeket:
# GitHub → Actions → Security Audit & Testing
```

### Manual Workflow Trigger

```bash
# 1. GitHub Repository → Actions
# 2. "Security Audit & Testing" workflow
# 3. "Run workflow" → "Run workflow"
# 4. Opcionálisan: "Run deep scan" ✅
```

## 🚨 HIBAELHÁRÍTÁS

### ❌ **"Secret not found" hibák**

```bash
# Ellenőrizze:
# 1. Secret név pontosan egyezik (case-sensitive)
# 2. Secret value nem üres
# 3. Repository permissions megfelelőek
```

### ❌ **Snyk authentication failed**

```bash
# 1. Új Snyk token generálása
# 2. Token érvényességének ellenőrzése:
curl -X GET 'https://snyk.io/api/v1/user/me' \
  -H 'Authorization: token YOUR_TOKEN'
```

### ❌ **Database connection failed**

```bash
# CI MySQL service ellenőrzése:
# - Port: 3306
# - Username: root  
# - Password: test_password
# - Database: test_db vagy lovas_test
```

## 🔒 BIZTONSÁGI GYAKORLATOK

### ✅ **DO's**
- Használjon erős, egyedi token-eket
- Rendszeresen forgassa a token-eket
- Csak szükséges permissions-öket adjon
- Monitoring és logging bekapcsolása

### ❌ **DON'Ts**
- Ne commitolja a secrets-eket a kódba
- Ne ossza meg a token-eket
- Ne használjon azonos token-t több célra
- Ne tárolja secrets-eket plain text fájlokban

## 📞 TÁMOGATÁS

Ha problémái vannak a secrets beállításával:

1. **GitHub Docs**: [Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
2. **Snyk Docs**: [Authentication](https://support.snyk.io/hc/en-us/articles/360004037537)
3. **Slack Webhooks**: [Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

📝 **Frissítve**: 2025-09-18  
🔒 **Státusz**: Production Ready