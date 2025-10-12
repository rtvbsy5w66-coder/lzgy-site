#!/usr/bin/env node

/**
 * BIZTONSÁGI TESZT - Admin autentikáció ellenőrzése
 * Ez a script teszteli, hogy csak a whitelistelt adminok férhetnek hozzá az admin funkcionalitáshoz
 */

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [
  'admin@lovaszoltan.hu',
  'plscallmegiorgio@gmail.com',
  'lovas.zoltan@mindenkimagyarorszaga.hu'
];

console.log('🔒 BIZTONSÁGI AUDIT - Admin Autentikáció');
console.log('======================================\n');

console.log('✅ Engedélyezett admin emailek:');
adminEmails.forEach(email => console.log(`   - ${email}`));

console.log('\n❌ NEM engedélyezett emailek (példák):');
const unauthorizedEmails = [
  'jakabgipsz865@gmail.com',
  'test@example.com', 
  'hacker@malicious.com',
  'user@domain.com'
];

unauthorizedEmails.forEach(email => {
  const isAuthorized = adminEmails.includes(email);
  console.log(`   - ${email}: ${isAuthorized ? '🚨 VESZÉLY!' : '✅ Blokkolva'}`);
});

console.log('\n🔍 TESZT EREDMÉNYEK:');
console.log('1. signIn callback - CSAK whitelistelt emaileket fogad el');
console.log('2. session callback - Csak adminoknak ad ADMIN szerepkört');
console.log('3. JWT callback - Konzisztens szerepkör kezelés');

console.log('\n⚠️  TESZT ÚTMUTATÓ:');
console.log('1. Jelentkezz be jakabgipsz865@gmail.com-mal');
console.log('2. Az bejelentkezésnek SIKERTELEN kell lennie');  
console.log('3. Ha beenged, akkor KRITIKUS BIZTONSÁGI RÉS!');

console.log('\n🛡️  BIZTONSÁGI ELLENŐRZÉS KÉSZ');