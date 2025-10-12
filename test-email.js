#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    console.log('🧪 Testing direct Resend API email...');
    console.log(`📧 From: noreply@lovaszoltan.dev`);
    console.log(`📬 To: plscallmegiorgio@gmail.com`);
    
    const result = await resend.emails.send({
      from: 'Lovas Zoltán <onboarding@resend.dev>',
      to: 'plscallmegiorgio@gmail.com',
      subject: '🔧 EMAIL TESZT - Direct Resend API',
      html: `
        <h2>🔧 Direct Email Test</h2>
        <p>Ez egy közvetlen Resend API teszt email.</p>
        <p><strong>Idő:</strong> ${new Date().toLocaleString('hu-HU')}</p>
        <p>Ha megkaptad ezt az emailt, a Resend API működik!</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
}

testEmail();