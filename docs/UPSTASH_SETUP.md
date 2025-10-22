# Upstash Redis Setup Útmutató
## Production Rate Limiting Konfiguráció

---

## 📋 Miért Szükséges?

Az in-memory rate limiter **NEM működik** production környezetben:
- ❌ Load balancer esetén minden szerver külön számolja a kéréseket
- ❌ Serverless környezetben (Vercel) nincs perzisztens memória
- ❌ Nem skálázódik több szerver esetén

**Megoldás:** Upstash Redis - serverless, distributed rate limiting ✅

---

## 🚀 Setup Lépések

### Opció A: Vercel Integration (AJÁNLOTT - 2 perc)

1. **Nyisd meg a Vercel Dashboard-ot:**
   ```
   https://vercel.com/your-team/lovas-political-site/integrations
   ```

2. **Add hozzá az Upstash integrációt:**
   - Keresd meg: "Upstash Redis"
   - Kattints: "Add Integration"
   - Válaszd ki a projektet: `lovas-political-site`

3. **Automatikus konfiguráció:**
   Vercel automatikusan hozzáadja:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXX...
   ```

4. **Redeploy:**
   ```bash
   git commit --allow-empty -m "trigger: upstash integration"
   git push
   ```

**KÉSZ! ✅** A rate limiter automatikusan használja az Upstash-t production-ben.

---

### Opció B: Manuális Setup (5 perc)

#### 1. Upstash Account Létrehozás

```
https://console.upstash.com/
```

- Sign up (GitHub vagy Email)
- Free tier: 10,000 commands/nap (elég kis-közepes projekthez)

#### 2. Redis Database Létrehozás

1. Console → Databases → "Create Database"
2. Beállítások:
   - **Name:** `lovas-rate-limiting`
   - **Type:** Regional (gyorsabb EU régióból)
   - **Region:** Europe (Frankfurt vagy Amsterdam)
   - **TLS:** Enabled

3. Kattints: "Create"

#### 3. Credentials Kimásolása

A database létrehozása után:
```
Dashboard → Your Database → REST API
```

Másold ki:
```
UPSTASH_REDIS_REST_URL=https://eu2-smart-....upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX1ABc...
```

#### 4. Environment Variables Beállítása

**Vercel Production:**
```
Vercel Dashboard → Settings → Environment Variables
```

Add hozzá:
- `UPSTASH_REDIS_REST_URL` = (a másolt URL)
- `UPSTASH_REDIS_REST_TOKEN` = (a másolt token)
- Scope: **Production** ✅

**Local .env.local:**
```bash
# .env.local (ne commitold!)
UPSTASH_REDIS_REST_URL="https://eu2-smart-....upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXX1ABc..."
```

#### 5. Tesztelés

```bash
# Local teszt Upstash-sal
npm run build
npm start

# Check logs
# Kellene látni: "[Rate Limiter] Using Upstash Redis"
# Ne lásd: "[Rate Limiter] Using in-memory fallback"
```

---

## 🧪 Ellenőrzés

### 1. Console Log Check

```bash
npm run build && npm start
```

**Várható output:**
```
✓ [Rate Limiter] Upstash Redis connected
✓ [Rate Limiter] Using production configuration
```

**Ha látod:**
```
⚠ [Rate Limiter] Upstash credentials not found. Using in-memory fallback.
```
→ Environment variables hiányoznak vagy hibásak.

### 2. Upstash Dashboard Analytics

```
https://console.upstash.com/redis/{your-database-id}
```

- **Metrics tab:** Láthatod a parancsok számát
- **Logs:** Real-time rate limit események
- **Analytics:** Hányszor blokkolta a kéréseket

### 3. Load Test

```bash
# Install autocannon
npm install -g autocannon

# Test rate limiting
autocannon -c 100 -d 10 http://localhost:3000/api/test

# Várható: 429 Too Many Requests után 10-20 kérés
```

---

## 📊 Upstash Dashboard Értelmezése

### Metrics Tab

- **Commands:** Összes Redis parancs (minden rate limit check 2-3 parancs)
- **Bandwidth:** Kimenő/bejövő adat
- **Latency:** Átlagos válaszidő (normál: <50ms)

### Rate Limit Analytics

Látni fogod:
- Mennyi kérést blokkolt (429 responses)
- Mely IP címek kértek túl sokat
- Rate limit típusok megoszlása (login, api, petition, stb.)

---

## 💡 Best Practices

### 1. Monitoring Setup

```typescript
// src/lib/rate-limiting/upstash.ts már tartalmazza:
analytics: true // ← Upstash analytics enabled
```

### 2. Alert Setup (Opcionális)

Upstash Console → Alerts:
- Daily command limit elérése (pl. 8000/10000)
- Latency threshold (pl. >200ms)
- Error rate (pl. >5%)

### 3. Backup Rate Limiter

Ha Upstash leáll, automatikus fallback:
```typescript
if (!redis) {
  // Automatikusan in-memory rate limiterre vált
  console.warn('Upstash unavailable, using fallback');
}
```

---

## 🔧 Troubleshooting

### Probléma: "Upstash credentials not found"

**Megoldás:**
```bash
# Ellenőrizd environment variables
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Ha üres, add hozzá .env.local-hoz
# VAGY Vercel Environment Variables-hez
```

### Probléma: "ERR: invalid token"

**Megoldás:**
- Regeneráld a tokent Upstash Console-ban
- Frissítsd mindenhol (local + Vercel)

### Probléma: "Connection timeout"

**Megoldás:**
- Ellenőrizd a region-t (EU projekt → EU Redis)
- Upstash Status: https://status.upstash.com/

### Probléma: "Too many commands"

**Megoldás:**
- Free tier: 10,000 commands/nap
- Upgrade Pro plan: https://upstash.com/pricing
- Vagy optimalizáld: ritkább cleanup, hosszabb window

---

## 💰 Költségek

### Free Tier (ELÉG kis-közepes projekthez)
- ✅ 10,000 commands/nap
- ✅ Max 256MB RAM
- ✅ 1 database
- ✅ TLS encryption

**Becslés:**
- 1000 user/nap × 5 API kérés = 5000 commands/nap ✅
- 10,000 user/nap × 5 API kérés = 50,000 commands/nap → **Pro tier szükséges**

### Pro Tier ($10/hó)
- ✅ 100,000 commands/nap
- ✅ Max 1GB RAM
- ✅ Unlimited databases
- ✅ Priority support

---

## 📚 További Információk

- **Upstash Docs:** https://docs.upstash.com/redis
- **Rate Limiting Guide:** https://upstash.com/docs/redis/features/ratelimiting
- **Vercel Integration:** https://vercel.com/docs/integrations/upstash

---

## ✅ Checklist

Setup befejezése után ellenőrizd:

- [ ] Upstash database létrehozva
- [ ] Environment variables beállítva (local + Vercel)
- [ ] `npm run build && npm start` működik
- [ ] Console log: "Using Upstash Redis" (nem "fallback")
- [ ] Upstash Dashboard mutat metrics-et
- [ ] Load test: 429 Too Many Requests működik
- [ ] Rate limit analytics látható Dashboard-on

**Ha minden ✅ → Upstash Redis READY FOR PRODUCTION! 🚀**

