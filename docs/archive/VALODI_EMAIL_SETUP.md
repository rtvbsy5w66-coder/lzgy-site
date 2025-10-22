# 📧 Valódi Email Küldés Beállítása

Ez a dokumentum leírja, hogyan állíthat be valódi email küldést a petíció rendszerhez.

## 🎯 Prioritási Sorrend

A rendszer a következő sorrendben próbálja az email szolgáltatásokat:

1. **Gmail SMTP** (ajánlott egyszerűségéért)
2. **Általános SMTP** (más email szolgáltatók)
3. **Resend API** (production környezethez)
4. **Ethereal Email** (csak fallback, preview)

## 🔐 1. Gmail SMTP Beállítása (Ajánlott)

### Lépés 1: Gmail App Password Létrehozása

1. Menjen a [Google Account](https://myaccount.google.com/) oldalra
2. Navigáljon: **Security** → **2-Step Verification** → **App passwords**
3. Válassza ki: **Mail** és **Other (custom name)**
4. Adja meg: "Lovas Political Site"
5. **Másolja le a generált 16 karakteres jelszót**

### Lépés 2: Environment Változók Beállítása

Adja hozzá a `.env.local` fájlhoz:

```bash
# Gmail SMTP Konfiguráció
GMAIL_USER=az.on.gmail.cime@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

⚠️ **Fontos**: Az `GMAIL_APP_PASSWORD` a Gmail-ben generált app password, nem a normál jelszava!

### Tesztelés

Ezután azonnal működni fog a valódi email küldés. A konzolban ezt fogja látni:
```
✅ Gmail SMTP - Email sikeresen elküldve!
📧 Valós email elküldve a következő címre: example@email.com
```

## 🌐 2. Általános SMTP Beállítása

Más email szolgáltatókhoz (pl. Outlook, Yahoo, saját domain):

```bash
# Általános SMTP Konfiguráció
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=az.on.email.cime@domain.com
SMTP_PASS=az.on.jelszava
```

**Népszerű SMTP beállítások:**

### Gmail:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 🚀 3. Resend API Beállítása (Production)

### Lépés 1: Resend Fiók Létrehozása
1. Menjen a [resend.com](https://resend.com) oldalra
2. Regisztráljon ingyenes fiókot
3. Hozzon létre API kulcsot

### Lépés 2: API Kulcs Beállítása
```bash
# Resend API
NODE_ENV=production
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
```

### Lépés 3: Domain Verifikáció (Opcionális)
- Saját domain használatához verifikálja a domain-t a Resend dashboardon

## 🧪 Email Szolgáltatás Tesztelése

### Teszt Kérés Küldése

```bash
curl -X POST http://localhost:3001/api/petitions/PETITION_ID/sign \
-H "Content-Type: application/json" \
-d '{
  "firstName": "Teszt",
  "lastName": "Felhasználó", 
  "email": "AZ_ON_EMAIL_CIME@gmail.com",
  "city": "Budapest",
  "postalCode": "1051",
  "showName": false,
  "allowContact": true
}'
```

### Sikeres Válasz a Konzolban

**Gmail SMTP esetén:**
```
✅ Gmail SMTP - Email sikeresen elküldve!
📬 Email ID: <message-id@gmail.com>
📧 Valós email elküldve a következő címre: az.on.email@gmail.com
```

**Resend esetén:**
```
✅ Resend - Email sikeresen elküldve!
📧 Valós email elküldve a következő címre: az.on.email@gmail.com
```

## 🔍 Hibaelhárítás

### "Gmail credentials not configured"
- Ellenőrizze a `GMAIL_USER` és `GMAIL_APP_PASSWORD` változókat
- Győződjön meg róla, hogy app password-t használ, nem normál jelszót

### "Invalid login"
- Ellenőrizze, hogy a 2-factor authentication be van-e kapcsolva
- Újra generálja az app password-t

### "SMTP connection failed"
- Ellenőrizze a tűzfal beállításokat
- Próbálja meg másik SMTP portot (25, 465, 587)

### Email nem érkezik meg
- Ellenőrizze a spam mappát
- Várjon 1-2 percet (SMTP késleltetés)
- Ellenőrizze az email címet

## 📝 Teljes `.env.local` Példa

```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# Gmail SMTP (válassza ezt egyszerűségért)
GMAIL_USER=az.on.gmail.cime@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# VAGY Resend API (production)
# NODE_ENV=production
# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# VAGY Általános SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=az.on.email.cime@gmail.com
# SMTP_PASS=az.on.jelszava
```

## ✅ Következő Lépések

1. **Válasszon email szolgáltatást** (Gmail SMTP ajánlott)
2. **Konfigurálja a környezeti változókat**
3. **Indítsa újra a development szervert**
4. **Tesztelje a petíció aláírást**
5. **Ellenőrizze az email beérkezését**

A beállítás után a rendszer automatikusan valódi emaileket fog küldeni!