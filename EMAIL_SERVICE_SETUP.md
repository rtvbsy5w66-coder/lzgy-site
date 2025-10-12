# Email Szolgáltatás Beállítása

Ez a dokumentum leírja, hogyan kell beállítani az email szolgáltatásokat a fejlesztési és production környezetekhez.

## 🔧 Fejlesztési Környezet

A fejlesztési környezetben **Ethereal Email**-t használunk, ami automatikusan működik, külön beállítás nélkül.

### Ethereal Email Előnyei:
- ✅ **Ingyenes** és korlátlan használat
- ✅ **Automatikus** konfiguráció
- ✅ **Email preview** URL-ek a böngészőben
- ✅ **Nincs spam** probléma
- ✅ **Valós email teszt** production kód nélkül

### Hogyan Működik:
1. Az aláíráskor a szerver automatikusan generál egy Ethereal Email fiókot
2. Elküldi az email-t az Ethereal SMTP szerveren keresztül
3. A konzolban megjelenik egy **preview URL**, ahol megtekinthető az email
4. A preview URL-en keresztül tesztelhető az email tartalom és a hitelesítési link

## 🚀 Production Környezet

Production környezetben ajánlott ingyenes tier-rel rendelkező szolgáltatások:

### 1. **SendGrid** (Ajánlott)
- **Ingyenes tier**: 100 email/nap
- **Beállítás**:
  ```bash
  npm install @sendgrid/mail
  ```
  
  `.env.local`:
  ```
  NODE_ENV=production
  SENDGRID_API_KEY=SG.xxxxxxxxxx
  SENDGRID_FROM_EMAIL=petition@yourdomain.com
  ```

### 2. **Mailgun**
- **Ingyenes tier**: 5,000 email/hónap (első 3 hónap)
- **Beállítás**:
  ```bash
  npm install mailgun-js
  ```
  
  `.env.local`:
  ```
  NODE_ENV=production
  MAILGUN_API_KEY=key-xxxxxxxxxx
  MAILGUN_DOMAIN=yourdomain.com
  ```

### 3. **Resend** (Jelenlegi)
- **Ingyenes tier**: 3,000 email/hónap
- **Beállítás**:
  ```
  NODE_ENV=production
  RESEND_API_KEY=re_xxxxxxxxxx
  ```

## 📝 Email Szolgáltatás Implementálása

### SendGrid Integráció
```typescript
// src/lib/email.ts
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Production environment - use SendGrid
if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Petíció aláírás megerősítése - ${petitionTitle}`,
    html: emailHtml,
  };
  
  await sgMail.send(msg);
}
```

### Mailgun Integráció
```typescript
import Mailgun from 'mailgun-js';

const mailgun = Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// Production environment - use Mailgun
const data = {
  from: `Lovas Zoltán Petíciók <petition@${process.env.MAILGUN_DOMAIN}>`,
  to: email,
  subject: `Petíció aláírás megerősítése - ${petitionTitle}`,
  html: emailHtml,
};

await mailgun.messages().send(data);
```

## 🔄 Automatikus Váltás

A jelenlegi implementáció automatikusan vált a környezetek között:

```typescript
// Development: Ethereal Email (ingyenes, preview URL-lel)
if (process.env.NODE_ENV === 'development') {
  // Ethereal Email használata
}

// Production: Resend/SendGrid/Mailgun
if (process.env.NODE_ENV === 'production') {
  // Production email szolgáltatás használata
}
```

## 📊 Email Statisztikák

### Fejlesztési Használat
- **Költség**: $0
- **Limit**: Korlátlan
- **Email delivery**: Ethereal preview (nem valós delivery)

### Production Használat (SendGrid példa)
- **Költség**: $0 (100 email/nap alatt)
- **Limit**: 100 email/nap
- **Email delivery**: Valós email küldés

## 🛠 Beállítási Lépések Production-hoz

1. **Válasszon email szolgáltatót** (SendGrid ajánlott)
2. **Regisztráljon** a szolgáltatónál
3. **API kulcs létrehozása**
4. **Domain verifikáció** (ha szükséges)
5. **Environment változók** beállítása
6. **Email service kód** frissítése az `src/lib/email.ts`-ben
7. **Teszt email** küldése

## ⚠️ Fontos Megjegyzések

- **Development**: Ethereal Email automatikusan működik
- **Production**: Email szolgáltató API kulcs szükséges
- **Rate limiting**: Production környezetben figyelni kell a napi limiteket
- **Domain reputation**: Production környezetben saját domain használata ajánlott
- **Email delivery**: Development-ben csak preview, production-ben valós küldés

## 🔍 Troubleshooting

### "API key is invalid" hiba
- Ellenőrizze a `.env.local` fájlban az API kulcsot
- Győződjön meg róla, hogy `NODE_ENV=production` van beállítva

### Email nem érkezik meg
- Ellenőrizze a spam mappát
- Verifíka ja a domain-t a szolgáltatónál
- Ellenőrizze a napi limitet

### Ethereal Email nem működik
- Ellenőrizze a `NODE_ENV=development` beállítást
- Nézze meg a console logokat a preview URL-ért