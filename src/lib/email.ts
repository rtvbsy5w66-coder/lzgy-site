import { Resend } from "resend";
import * as nodemailer from "nodemailer";

// Initialize Resend if API key is available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend initialized with API key');
} else {
  console.log('⚠️ RESEND_API_KEY not found in environment variables');
}

interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  district?: string;
  preferredContact?: string;
  newsletter?: boolean;
}

export async function sendContactNotification(data: ContactData) {
  try {
    console.log("Email küldés kezdése...", {
      to: "lovas.zoltan1986@gmail.com",
      environment: process.env.NODE_ENV,
      resendAvailable: !!resend,
    });

    const { name, email, subject, message, phone, district, preferredContact } = data;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Új kapcsolatfelvételi üzenet érkezett</h2>
        
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Feladó neve:</strong> ${name}</p>
          <p><strong>Email címe:</strong> ${email}</p>
          ${phone ? `<p><strong>Telefonszám:</strong> ${phone}</p>` : ""}
          ${district ? `<p><strong>Kerület:</strong> ${district}</p>` : ""}
          ${
            preferredContact
              ? `<p><strong>Preferált kapcsolattartás:</strong> ${preferredContact}</p>`
              : ""
          }
          <p><strong>Tárgy:</strong> ${subject}</p>
          <p style="margin-top: 20px;"><strong>Üzenet:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="color: #718096; font-size: 14px;">
          Ez egy automatikus értesítés a weboldal kapcsolatfelvételi űrlapjáról.
        </p>
      </div>
    `;

    // Email content for all services
    const emailContent = {
      from: "Lovas Zoltán <noreply@lovaszoltan.dev>",
      to: "lovas.zoltan1986@gmail.com",
      subject: `Új üzenet: ${subject}`,
      html: emailHtml,
      replyTo: email,
    };

    // Priority 1: Try Gmail SMTP first
    const gmailTransporter = createGmailTransporter();
    if (gmailTransporter) {
      try {
        const info = await gmailTransporter.sendMail({
          ...emailContent,
          from: `"Lovas Zoltán" <${process.env.GMAIL_USER}>`,
        });
        
        console.log("✅ Gmail SMTP - Email sikeresen elküldve!");
        console.log(`📬 Email ID: ${info.messageId}`);
        
        return { success: true };
      } catch (error) {
        console.error('Gmail SMTP küldési hiba:', error);
        // Continue to next option
      }
    }

    // Priority 2: Try Resend
    if (resend) {
      try {
        const emailResult = await resend.emails.send(emailContent);

        console.log("✅ Resend - Email sikeresen elküldve!");
        console.log("Resend email eredménye:", emailResult);
        
        return { success: true };
      } catch (error) {
        console.error('Resend küldési hiba:', error);
        // Continue to fallback
      }
    }

    // Priority 3: Fallback to Ethereal Email (development preview)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          
          console.log("⚠️ Fallback: Ethereal Email preview (nem valós email)");
          console.log(`📧 Email Preview URL: ${previewUrl}`);
          console.log(`📬 Email ID: ${info.messageId}`);
          
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    // Final fallback: Log email details
    console.log("❌ Egyetlen email szolgáltatás sem elérhető!");
    console.log(`📧 EMAIL PREVIEW (csak konzol):`);
    console.log(`To: ${emailContent.to}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`From: ${emailContent.from}`);
    console.log(`Reply-To: ${emailContent.replyTo}`);
    console.log(`---`);
    console.log(`🔧 Konfigurálja a Gmail SMTP-t vagy Resend API-t valós email küldéshez!`);
    
    return { success: true };

  } catch (error) {
    console.error("Email küldési hiba részletek:", {
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      statusCode: error instanceof Error && 'statusCode' in error ? error.statusCode : undefined,
    });
    throw error;
  }
}

// Create Ethereal Email transporter for development (fallback)
async function createEtherealTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Failed to create Ethereal transporter:', error);
    return null;
  }
}

// Create Gmail SMTP transporter for real email sending
function createGmailTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Gmail credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// GDPR compliant newsletter subscription confirmation email
export async function sendNewsletterConfirmation(subscriberData: {
  name: string;
  email: string;
  categories?: string[]; // Array of category enums
}) {
  try {
    console.log("Hírlevél megerősítő email küldése...", {
      to: subscriberData.email,
      environment: process.env.NODE_ENV,
      resendAvailable: !!resend,
      categories: subscriberData.categories,
    });

    const { name, email, categories } = subscriberData;
    const unsubscribeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

    // Map category enums to human-readable names
    const categoryNames: Record<string, string> = {
      'NEWS': 'Hírek és Aktualitások',
      'EVENTS': 'Események és Programok',
      'POLICY': 'Politikai Fejlemények',
      'COMMUNITY': 'Közösségi Hírek',
      'NEWSLETTER': 'Általános Hírlevél',
    };

    const subscribedCategories = categories && categories.length > 0
      ? categories.map(cat => categoryNames[cat] || cat).join(', ')
      : 'Minden kategória';

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">📧 Hírlevél Feliratkozás</h1>
          <p style="color: #f0f4f8; margin: 10px 0 0 0; font-size: 16px;">Megerősítjük a feliratkozását</p>
        </div>

        <div style="padding: 40px 20px;">
          <h2 style="color: #2d3748; margin-bottom: 20px;">Kedves ${name}!</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Köszönjük, hogy feliratkozott hírlevelünkre! Ez az email megerősíti, hogy sikeresen feliratkoztattuk Önt a következő email címmel:
          </p>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; color: #2d3748; font-weight: 600;">📧 ${email}</p>
          </div>

          <div style="background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 50%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38b2ac;">
            <h3 style="color: #234e52; margin: 0 0 15px 0; font-size: 18px;">✅ Feliratkozott kategóriák:</h3>
            <p style="color: #2c7a7b; font-size: 16px; margin: 0; font-weight: 600;">
              ${subscribedCategories}
            </p>
          </div>

          <h3 style="color: #2d3748; margin-top: 30px; margin-bottom: 15px;">Mit fog kapni ezekben a kategóriákban?</h3>
          <ul style="color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">🗞️ Új hírek és cikkek értesítései</li>
            <li style="margin-bottom: 8px;">📅 Közelgő események és programok</li>
            <li style="margin-bottom: 8px;">🏛️ Politikai fejlemények és álláspontok</li>
            <li style="margin-bottom: 8px;">🤝 Közösségi események meghívói</li>
          </ul>
          
          <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px;">🔒 Adatvédelem</h4>
            <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.5;">
              Az Ön email címét bizalmasan kezeljük és csak hírlevél küldésre használjuk. 
              Adatait nem adjuk át harmadik félnek. GDPR megfelelően bármikor leiratkozhat.
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Ha nem kíván több hírlevelet kapni, 
              <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                itt leiratkozhat
              </a>
            </p>
          </div>
        </div>
        
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 12px; margin: 0;">
            Ezt az emailt automatikusan küldte a Lovas Zoltán politikai oldal rendszere.
          </p>
          <p style="color: #718096; font-size: 12px; margin: 5px 0 0 0;">
            <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Leiratkozás</a>
          </p>
        </div>
      </div>
    `;

    const emailContent = {
      from: process.env.GMAIL_USER || "noreply@lovaszoltan.dev",
      to: email,
      replyTo: "lovas.zoltan1986@gmail.com",
      subject: "✅ Hírlevél feliratkozás megerősítése - Lovas Zoltán",
      html: emailHtml,
      text: `
Kedves ${name}!

Köszönjük, hogy feliratkozott hírlevelünkre!

Ez az email megerősíti, hogy sikeresen feliratkozott a következő email címmel: ${email}

✅ Feliratkozott kategóriák: ${subscribedCategories}

Mit fog kapni ezekben a kategóriákban:
- Új hírek és cikkek értesítései
- Közelgő események és programok
- Politikai fejlemények és álláspontok
- Közösségi események meghívói

Adatvédelem: Az Ön email címét bizalmasan kezeljük és csak hírlevél küldésre használjuk.

Ha nem kíván több hírlevelet kapni, leiratkozhat itt: ${unsubscribeUrl}

Üdvözlettel,
Lovas Zoltán csapata
      `,
    };

    // Priority 1: Try Gmail SMTP (production AND development)
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.FORCE_GMAIL === 'true') {
      const gmailTransporter = createGmailTransporter();
      if (gmailTransporter) {
        try {
          await gmailTransporter.sendMail(emailContent);
          console.log("✅ Gmail SMTP - Hírlevél megerősítő email sikeresen elküldve!");
          return { success: true };
        } catch (error) {
          console.error('Gmail SMTP küldési hiba:', error);
        }
      }
    }

    // Priority 2: Try Resend
    if (resend) {
      try {
        const emailResult = await resend.emails.send(emailContent);
        console.log("✅ Resend - Hírlevél megerősítő email sikeresen elküldve!");
        console.log("Resend email eredménye:", emailResult);
        return { success: true };
      } catch (error) {
        console.error('Resend küldési hiba:', error);
      }
    }

    // Priority 3: Fallback to Ethereal Email (development preview)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log("⚠️ Fallback: Ethereal Email preview (nem valós email)");
          console.log(`📧 Newsletter Confirmation Preview: ${previewUrl}`);
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    // Final fallback: Log email details
    console.log("❌ Hírlevél megerősítő email küldése sikertelen!");
    console.log(`📧 NEWSLETTER CONFIRMATION EMAIL PREVIEW (csak konzol):`);
    console.log(`To: ${emailContent.to}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`From: ${emailContent.from}`);
    
    return { success: false, error: "Email service unavailable" };
  } catch (error) {
    console.error("Hírlevél megerősítő email küldési hiba:", error);
    return { success: false, error: "Failed to send confirmation email" };
  }
}

// GDPR compliant newsletter unsubscribe confirmation email to user
export async function sendUnsubscribeConfirmation(subscriberData: {
  name: string;
  email: string;
}) {
  try {
    console.log("Leiratkozás megerősítő email küldése...", {
      to: subscriberData.email,
      environment: process.env.NODE_ENV,
      resendAvailable: !!resend,
    });

    const { name, email } = subscriberData;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">📭 Hírlevél Leiratkozás</h1>
          <p style="color: #fed7d7; margin: 10px 0 0 0; font-size: 16px;">Leiratkozás megerősítése</p>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2 style="color: #2d3748; margin-bottom: 20px;">Kedves ${name}!</h2>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Ez az email megerősíti, hogy sikeresen leiratkozott a hírlevelünkről. A következő email cím került eltávolításra:
          </p>
          
          <div style="background-color: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e53e3e;">
            <p style="margin: 0; color: #2d3748; font-weight: 600;">📧 ${email}</p>
          </div>
          
          <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #38a169;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px;">✅ Leiratkozás sikeres</h4>
            <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.5;">
              Többé nem fog hírlevelet kapni tőlünk. Adatait biztonságosan tároljuk, de newsletter üzeneteket nem küldünk.
            </p>
          </div>
          
          <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px;">💡 Meggondolta magát?</h4>
            <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.5;">
              Ha később újra szeretne feliratkozni, megteheti a <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/kapcsolat" style="color: #667eea; text-decoration: none; font-weight: 600;">kapcsolat oldalon</a> vagy a <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profil" style="color: #667eea; text-decoration: none; font-weight: 600;">profil oldalán</a>.
            </p>
          </div>
        </div>
        
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 12px; margin: 0;">
            Ezt az emailt automatikusan küldte a Lovas Zoltán politikai oldal rendszere.
          </p>
        </div>
      </div>
    `;

    const emailContent = {
      from: process.env.GMAIL_USER || "noreply@lovaszoltan.dev",
      to: email,
      replyTo: "lovas.zoltan1986@gmail.com",
      subject: "📭 Hírlevél leiratkozás megerősítése - Lovas Zoltán",
      html: emailHtml,
      text: `
Kedves ${name}!

Ez az email megerősíti, hogy sikeresen leiratkozott a hírlevelünkről.

Leiratkozott email cím: ${email}

Többé nem fog hírlevelet kapni tőlünk. Adatait biztonságosan tároljuk, de newsletter üzeneteket nem küldünk.

Ha később újra szeretne feliratkozni, megteheti a kapcsolat oldalon vagy a profil oldalán.

Üdvözlettel,
Lovas Zoltán csapata
      `,
    };

    // Priority 1: Try Gmail SMTP (production AND development)
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.FORCE_GMAIL === 'true') {
      const gmailTransporter = createGmailTransporter();
      if (gmailTransporter) {
        try {
          await gmailTransporter.sendMail(emailContent);
          console.log("✅ Gmail SMTP - Leiratkozás megerősítő email sikeresen elküldve!");
          return { success: true };
        } catch (error) {
          console.error('Gmail SMTP küldési hiba:', error);
        }
      }
    }

    // Priority 2: Try Resend
    if (resend) {
      try {
        const emailResult = await resend.emails.send(emailContent);
        console.log("✅ Resend - Leiratkozás megerősítő email sikeresen elküldve!");
        return { success: true };
      } catch (error) {
        console.error('Resend küldési hiba:', error);
      }
    }

    // Priority 3: Fallback to Ethereal Email (development preview)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log("⚠️ Fallback: Ethereal Email preview");
          console.log(`📧 Unsubscribe Confirmation Preview: ${previewUrl}`);
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    return { success: false, error: "Email service unavailable" };
  } catch (error) {
    console.error("Leiratkozás megerősítő email küldési hiba:", error);
    return { success: false, error: "Failed to send unsubscribe confirmation" };
  }
}

// Admin notification for newsletter unsubscription
export async function sendUnsubscribeNotification(data: {
  name: string;
  email: string;
  unsubscribeTime: string;
  action?: string;
}) {
  try {
    console.log("Admin értesítő email küldése leiratkozásról...", {
      to: "lovas.zoltan1986@gmail.com",
      environment: process.env.NODE_ENV,
      resendAvailable: !!resend,
    });

    const { name, email, unsubscribeTime, action } = data;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c53030;">📭 Hírlevél leiratkozás történt</h2>
        
        <div style="background-color: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e53e3e;">
          <p><strong>Leiratkozott személy:</strong> ${name}</p>
          <p><strong>Email címe:</strong> ${email}</p>
          <p><strong>Leiratkozás időpontja:</strong> ${unsubscribeTime}</p>
          ${action ? `<p><strong>Művelet:</strong> ${action}</p>` : ''}
        </div>
        
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #4a5568;">
            <strong>Biztonsági információ:</strong> Ez az automatikus értesítés azért jött létre, 
            hogy nyomon követhesd a hírlevél feliratkozások változásait.
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #718096;">
          Automatikus értesítés a Lovas Zoltán politikai oldal rendszerétől.
        </p>
      </div>
    `;

    const emailContent = {
      from: process.env.GMAIL_USER || "noreply@lovaszoltan.dev",
      to: "lovas.zoltan1986@gmail.com",
      replyTo: "lovas.zoltan1986@gmail.com",
      subject: "📭 ADMIN: Hírlevél leiratkozás - " + email,
      html: emailHtml,
      text: `
HÍRLEVÉL LEIRATKOZÁS

Leiratkozott személy: ${name}
Email címe: ${email}
Leiratkozás időpontja: ${unsubscribeTime}
${action ? `Művelet: ${action}` : ''}

Ez az automatikus értesítés azért jött létre, hogy nyomon követhesd a hírlevél feliratkozások változásait.
      `,
    };

    // Priority 1: Try Gmail SMTP (production AND development)
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.FORCE_GMAIL === 'true') {
      const gmailTransporter = createGmailTransporter();
      if (gmailTransporter) {
        try {
          await gmailTransporter.sendMail(emailContent);
          console.log("✅ Gmail SMTP - Admin leiratkozás értesítő elküldve!");
          return { success: true };
        } catch (error) {
          console.error('Gmail SMTP küldési hiba:', error);
        }
      }
    }

    // Priority 2: Try Resend
    if (resend) {
      try {
        const emailResult = await resend.emails.send(emailContent);
        console.log("✅ Resend - Admin leiratkozás értesítő elküldve!");
        return { success: true };
      } catch (error) {
        console.error('Resend küldési hiba:', error);
      }
    }

    // Priority 3: Fallback to Ethereal Email (development preview)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log("⚠️ Fallback: Ethereal Email preview");
          console.log(`📧 Admin Unsubscribe Notification Preview: ${previewUrl}`);
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    return { success: false, error: "Email service unavailable" };
  } catch (error) {
    console.error("Admin leiratkozás értesítő küldési hiba:", error);
    return { success: false, error: "Failed to send admin notification" };
  }
}

// Create generic SMTP transporter
function createSMTPTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Petition verification email functionality
export async function sendPetitionVerificationEmail(
  email: string,
  firstName: string,
  petitionTitle: string,
  verificationToken: string,
  petitionId: string
): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/peticiok/${petitionId}/verify?token=${verificationToken}`;
    
    console.log("Petíció hitelesítés email küldése...", {
      to: email,
      petitionTitle,
      verificationUrl,
      environment: process.env.NODE_ENV
    });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Petíció Aláírás Megerősítése</h1>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #333;">Kedves ${firstName}!</p>
          
          <p style="color: #666;">Köszönjük, hogy aláírta a következő petíciót:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <strong style="color: #333; font-size: 16px;">${petitionTitle}</strong>
          </div>
          
          <p style="color: #666;">Az aláírás aktiválásához kérjük, kattintson az alábbi gombra:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; 
                      font-weight: bold; font-size: 16px;">
              Aláírás Megerősítése
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Ha a gomb nem működik, másolja be ezt a linket a böngészőjébe:</p>
          <p style="word-break: break-all; color: #667eea; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 14px;">${verificationUrl}</p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Fontos:</strong> Ez a link 24 órán belül lejár. Ha nem erősíti meg aláírását ezen időn belül, újra kell aláírnia a petíciót.</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">Ha nem Ön írta alá ezt a petíciót, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">Ez egy automatikus email. Kérjük, ne válaszoljon rá.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform</p>
        </div>
      </div>
    `;

    // Email content for all services
    const emailContent = {
      from: '"Lovas Zoltán Petíciók" <petition@example.com>',
      to: email,
      subject: `Petíció aláírás megerősítése - ${petitionTitle}`,
      html: emailHtml,
      text: `
Kedves ${firstName}!

Köszönjük, hogy aláírta a következő petíciót:
${petitionTitle}

Az aláírás aktiválásához kattintson az alábbi linkre:
${verificationUrl}

Fontos: Ez a link 24 órán belül lejár.

Ha nem Ön írta alá ezt a petíciót, kérjük, hagyja figyelmen kívül ezt az emailt.

© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform
      `,
    };

    // Priority 1: Try Gmail SMTP (for real email sending)
    const gmailTransporter = createGmailTransporter();
    if (gmailTransporter) {
      try {
        const info = await gmailTransporter.sendMail({
          ...emailContent,
          from: `"Lovas Zoltán Petíciók" <${process.env.GMAIL_USER}>`,
        });
        
        console.log("✅ Gmail SMTP - Email sikeresen elküldve!");
        console.log(`📬 Email ID: ${info.messageId}`);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('Gmail SMTP küldési hiba:', error);
        // Continue to next option
      }
    }

    // Priority 2: Try generic SMTP
    const smtpTransporter = createSMTPTransporter();
    if (smtpTransporter) {
      try {
        const info = await smtpTransporter.sendMail(emailContent);
        
        console.log("✅ SMTP - Email sikeresen elküldve!");
        console.log(`📬 Email ID: ${info.messageId}`);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('SMTP küldési hiba:', error);
        // Continue to next option
      }
    }

    // Priority 3: Try Resend (production service)
    if (resend) {
      try {
        const emailResult = await resend?.emails.send({
          from: "Lovas Zoltán Petíciók <onboarding@resend.dev>",
          to: email,
          subject: `Petíció aláírás megerősítése - ${petitionTitle}`,
          html: emailHtml,
        });

        console.log("✅ Resend - Email sikeresen elküldve!");
        console.log("Resend email eredménye:", emailResult);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('Resend küldési hiba:', error);
        // Continue to fallback
      }
    }

    // Priority 4: Fallback to Ethereal Email (development preview only)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          
          console.log("⚠️ Fallback: Ethereal Email preview (nem valós email)");
          console.log(`📧 Email Preview URL: ${previewUrl}`);
          console.log(`📬 Email ID: ${info.messageId}`);
          
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    // Final fallback: Log email details
    console.log("❌ Egyetlen email szolgáltatás sem elérhető!");
    console.log(`📧 EMAIL PREVIEW (csak konzol):`);
    console.log(`To: ${email}`);
    console.log(`Subject: Petíció aláírás megerősítése - ${petitionTitle}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`---`);
    console.log(`🔧 Konfigurálja a Gmail SMTP-t vagy Resend API-t valós email küldéshez!`);
    
    return { success: true };

  } catch (error) {
    console.error("Petíció hitelesítés email küldési hiba:", {
      error: error instanceof Error ? error.message : String(error),
      email,
      petitionTitle,
    });
    return { success: false };
  }
}

// Event registration confirmation email functionality
export async function sendEventRegistrationEmail(
  email: string,
  name: string,
  eventTitle: string,
  eventLocation: string,
  eventStartDate: string,
  eventEndDate: string
): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    const eventDate = new Date(eventStartDate).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    const eventTime = new Date(eventStartDate).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const eventEndTime = new Date(eventEndDate).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log("Esemény regisztráció email küldése...", {
      to: email,
      eventTitle,
      eventDate,
      environment: process.env.NODE_ENV
    });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Esemény Jelentkezés Megerősítése</h1>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #333;">Kedves ${name}!</p>
          
          <p style="color: #666;">Köszönjük, hogy jelentkezett a következő eseményre:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <strong style="color: #333; font-size: 18px;">${eventTitle}</strong>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1976d2;">📅 Esemény részletei</h3>
            <div style="color: #333;">
              <p style="margin: 5px 0;"><strong>📅 Dátum:</strong> ${eventDate}</p>
              <p style="margin: 5px 0;"><strong>🕐 Időpont:</strong> ${eventTime} - ${eventEndTime}</p>
              <p style="margin: 5px 0;"><strong>📍 Helyszín:</strong> ${eventLocation}</p>
            </div>
          </div>
          
          <div style="background-color: #e8f5e8; border: 1px solid #4caf50; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;"><strong>✅ Jelentkezése megerősítve!</strong></p>
            <p style="margin: 5px 0 0 0; color: #2e7d32;">Várjuk Önt az eseményen! Kérjük, érkezzen időben.</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>💡 Fontos tudnivalók:</strong></p>
            <ul style="margin: 10px 0 0 20px; color: #856404;">
              <li>Kérjük, érkezzen 10 perccel az esemény kezdete előtt</li>
              <li>Hozza magával ezt az email megerősítést (mobilon is elegendő)</li>
              <li>Változás esetén hamarosan értesítjük</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">Ha kérdése van az eseménnyel kapcsolatban, ne habozzon kapcsolatba lépni velünk!</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">Ez egy automatikus email. Kérjük, ne válaszoljon rá.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform</p>
        </div>
      </div>
    `;

    // Email content for all services
    const emailContent = {
      from: '"Lovas Zoltán Események" <events@example.com>',
      to: email,
      subject: `Esemény jelentkezés megerősítve - ${eventTitle}`,
      html: emailHtml,
      text: `
Kedves ${name}!

Köszönjük, hogy jelentkezett a következő eseményre:
${eventTitle}

Esemény részletei:
📅 Dátum: ${eventDate}
🕐 Időpont: ${eventTime} - ${eventEndTime}
📍 Helyszín: ${eventLocation}

✅ Jelentkezése megerősítve!

Fontos tudnivalók:
- Kérjük, érkezzen 10 perccel az esemény kezdete előtt
- Hozza magával ezt az email megerősítést
- Változás esetén hamarosan értesítjük

© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform
      `,
    };

    // Priority 1: Try Gmail SMTP (for real email sending)
    const gmailTransporter = createGmailTransporter();
    if (gmailTransporter) {
      try {
        const info = await gmailTransporter.sendMail({
          ...emailContent,
          from: `"Lovas Zoltán Események" <${process.env.GMAIL_USER}>`,
        });
        
        console.log("✅ Gmail SMTP - Esemény email sikeresen elküldve!");
        console.log(`📬 Email ID: ${info.messageId}`);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('Gmail SMTP esemény email küldési hiba:', error);
        // Continue to next option
      }
    }

    // Priority 2: Try generic SMTP
    const smtpTransporter = createSMTPTransporter();
    if (smtpTransporter) {
      try {
        const info = await smtpTransporter.sendMail(emailContent);
        
        console.log("✅ SMTP - Esemény email sikeresen elküldve!");
        console.log(`📬 Email ID: ${info.messageId}`);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('SMTP esemény email küldési hiba:', error);
        // Continue to next option
      }
    }

    // Priority 3: Try Resend (production service)
    if (resend) {
      try {
        const emailResult = await resend?.emails.send({
          from: "Lovas Zoltán Események <onboarding@resend.dev>",
          to: email,
          subject: `Esemény jelentkezés megerősítve - ${eventTitle}`,
          html: emailHtml,
        });

        console.log("✅ Resend - Esemény email sikeresen elküldve!");
        console.log("Resend email eredménye:", emailResult);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('Resend esemény email küldési hiba:', error);
        // Continue to fallback
      }
    }

    // Priority 4: Fallback to Ethereal Email (development preview only)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          
          console.log("⚠️ Fallback: Ethereal Email preview (nem valós email)");
          console.log(`📧 Email Preview URL: ${previewUrl}`);
          console.log(`📬 Email ID: ${info.messageId}`);
          
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email esemény küldési hiba:', error);
        }
      }
    }

    // Final fallback: Log email details
    console.log("❌ Egyetlen email szolgáltatás sem elérhető!");
    console.log(`📧 ESEMÉNY EMAIL PREVIEW (csak konzol):`);
    console.log(`To: ${email}`);
    console.log(`Subject: Esemény jelentkezés megerősítve - ${eventTitle}`);
    console.log(`Event: ${eventTitle} | ${eventDate} ${eventTime} | ${eventLocation}`);
    console.log(`---`);
    console.log(`🔧 Konfigurálja a Gmail SMTP-t vagy Resend API-t valós email küldéshez!`);
    
    return { success: true };

  } catch (error) {
    console.error("Esemény regisztráció email küldési hiba:", {
      error: error instanceof Error ? error.message : String(error),
      email,
      eventTitle,
    });
    return { success: false };
  }
}

// Passwordless Authentication - Send 6-digit login code
export async function sendLoginCode(
  email: string,
  code: string,
  expiresInMinutes: number = 5
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    console.log("Bejelentkezési kód email küldése...", {
      to: email,
      code: code.substring(0, 2) + "****", // Security: only log first 2 digits
      expiresInMinutes,
      environment: process.env.NODE_ENV
    });

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300;">🔐 Bejelentkezési Kód</h1>
          <p style="color: #f0f4f8; margin: 10px 0 0 0; font-size: 16px;">Biztonságos belépés egyetlen kóddal</p>
        </div>

        <div style="padding: 40px 20px;">
          <p style="color: #2d3748; font-size: 18px; margin-bottom: 30px;">
            Valaki (remélhetőleg Ön) be szeretne lépni a Lovas Zoltán politikai oldalra ezzel az email címmel.
          </p>

          <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 2px solid #667eea;">
            <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Az Ön belépési kódja:</p>
            <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; text-align: center; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #718096; margin: 15px 0 0 0; font-size: 12px;">
              Ez a kód <strong>${expiresInMinutes} percig</strong> érvényes
            </p>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 6px; margin: 30px 0;">
            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⏱️ Gyors belépés</h4>
            <ol style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Lépjen vissza a bejelentkezési oldalra</li>
              <li>Írja be ezt a 6 jegyű kódot</li>
              <li>Kattintson a "Belépés" gombra</li>
            </ol>
          </div>

          <div style="background-color: #fee; border-left: 4px solid #f56565; padding: 20px; border-radius: 6px; margin: 30px 0;">
            <h4 style="color: #c53030; margin: 0 0 10px 0; font-size: 16px;">🛡️ Biztonsági figyelmeztetés</h4>
            <p style="color: #742a2a; font-size: 14px; margin: 0; line-height: 1.6;">
              <strong>Soha ne ossza meg ezt a kódot senkivel!</strong> Ez a kód csak Önnek szól.
              Ha nem Ön kérte ezt a kódot, kérjük hagyja figyelmen kívül ezt az emailt és forduljon hozzánk.
            </p>
          </div>

          <div style="text-align: center; padding: 30px 20px; background-color: #f7fafc; border-radius: 8px; margin: 30px 0;">
            <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0;">
              Nem működik a kód? Kérjen újat a bejelentkezési oldalon.
            </p>
            <p style="color: #718096; font-size: 12px; margin: 0;">
              A biztonsága érdekében egyszerre csak egy kód lehet aktív.
            </p>
          </div>
        </div>

        <div style="background-color: #2d3748; padding: 30px 20px; text-align: center; color: #e2e8f0; font-size: 13px;">
          <p style="margin: 0 0 10px 0;">
            Ezt az emailt a Lovas Zoltán politikai oldal biztonsági rendszere küldte.
          </p>
          <p style="margin: 0; color: #a0aec0; font-size: 12px;">
            Passwordless Authentication | ${new Date().toLocaleString('hu-HU')}
          </p>
        </div>
      </div>
    `;

    const emailContent = {
      from: process.env.GMAIL_USER || "noreply@lovaszoltan.dev",
      to: email,
      subject: `🔐 Belépési kód: ${code} - Lovas Zoltán`,
      html: emailHtml,
      text: `
Bejelentkezési kód

Valaki (remélhetőleg Ön) be szeretne lépni a Lovas Zoltán politikai oldalra ezzel az email címmel.

Az Ön belépési kódja: ${code}

Ez a kód ${expiresInMinutes} percig érvényes.

FIGYELEM: Soha ne ossza meg ezt a kódot senkivel!
Ha nem Ön kérte ezt a kódot, hagyja figyelmen kívül ezt az emailt.

Üdvözlettel,
Lovas Zoltán csapata
      `,
    };

    // Priority 1: Try Resend (using sandbox email)
    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          ...emailContent,
          from: "Lovas Zoltán Bejelentkezés <onboarding@resend.dev>", // Sandbox email - works without domain verification
        });

        // Check if Resend returned an error (it doesn't throw exceptions)
        if (emailResult.error) {
          console.error('Resend küldési hiba:', emailResult.error);
          // Continue to Gmail fallback
        } else {
          console.log("✅ Resend - Belépési kód email sikeresen elküldve!");
          console.log("Resend email eredménye:", emailResult);
          return { success: true };
        }
      } catch (error) {
        console.error('Resend exception:', error);
        // Continue to Gmail fallback
      }
    }

    // Priority 2: Try Gmail SMTP (if configured)
    const gmailTransporter = createGmailTransporter();
    if (gmailTransporter) {
      try {
        await gmailTransporter.sendMail(emailContent);
        console.log("✅ Gmail SMTP - Belépési kód email sikeresen elküldve!");
        return { success: true };
      } catch (error) {
        console.error('Gmail SMTP küldési hiba:', error);
      }
    }

    // Priority 3: Fallback to Ethereal Email (development preview)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log("⚠️ Fallback: Ethereal Email preview (nem valós email)");
          console.log(`📧 Login Code Preview: ${previewUrl}`);
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    console.log("❌ Belépési kód email küldése sikertelen!");
    return { success: false, error: "Email service unavailable" };
  } catch (error) {
    console.error("Belépési kód email küldési hiba:", error);
    return { success: false, error: "Failed to send login code email" };
  }
}

// Welcome email for first-time users (after first login)
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    console.log("Üdvözlő email küldése első bejelentkezéskor...", {
      to: email,
      name,
      environment: process.env.NODE_ENV
    });

    const websiteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">
            🎉 Üdvözöljük!
          </h1>
          <p style="color: #f0f4f8; margin: 15px 0 0 0; font-size: 18px; font-weight: 300;">
            Köszönjük, hogy csatlakozott hozzánk!
          </p>
        </div>

        <!-- Main content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin-bottom: 20px; font-size: 24px;">Kedves ${name}!</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin-bottom: 25px;">
            Örömmel köszöntjük Önt platformunkon! Sikeresen létrehozta fiókját, és mostantól hozzáférhet minden
            funkcióhoz, amely segít abban, hogy aktívan részt vegyen demokratikus közéletünkben.
          </p>

          <!-- What you can do section -->
          <div style="background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
              🚀 Mit tehet platformunkon?
            </h3>
            <div style="space-y: 15px;">
              <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: start; margin-bottom: 12px;">
                  <span style="font-size: 24px; margin-right: 12px;">📰</span>
                  <div>
                    <strong style="color: #2d3748; font-size: 16px;">Hírek és Cikkek</strong>
                    <p style="color: #4a5568; font-size: 14px; margin: 5px 0 0 0; line-height: 1.6;">
                      Értesülj a legfrissebb politikai fejleményekről, helyi eseményekről és álláspontjaimról
                    </p>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: start; margin-bottom: 12px;">
                  <span style="font-size: 24px; margin-right: 12px;">📅</span>
                  <div>
                    <strong style="color: #2d3748; font-size: 16px;">Események és Programok</strong>
                    <p style="color: #4a5568; font-size: 14px; margin: 5px 0 0 0; line-height: 1.6;">
                      Jelentkezz rendezvényeinkre, találkozókra és közösségi eseményekre
                    </p>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: start; margin-bottom: 12px;">
                  <span style="font-size: 24px; margin-right: 12px;">🧠</span>
                  <div>
                    <strong style="color: #2d3748; font-size: 16px;">Kvízek és Tudástesztek</strong>
                    <p style="color: #4a5568; font-size: 14px; margin: 5px 0 0 0; line-height: 1.6;">
                      Teszteld tudásodat politikai, közéleti és EU-s témákban
                    </p>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: start; margin-bottom: 12px;">
                  <span style="font-size: 24px; margin-right: 12px;">✍️</span>
                  <div>
                    <strong style="color: #2d3748; font-size: 16px;">Petíciók és Szavazások</strong>
                    <p style="color: #4a5568; font-size: 14px; margin: 5px 0 0 0; line-height: 1.6;">
                      Támogass fontos ügyeket és mondd el véleményedet közösségi szavazásokon
                    </p>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 0;">
                <div style="display: flex; align-items: start;">
                  <span style="font-size: 24px; margin-right: 12px;">🏛️</span>
                  <div>
                    <strong style="color: #2d3748; font-size: 16px;">Programjaim</strong>
                    <p style="color: #4a5568; font-size: 14px; margin: 5px 0 0 0; line-height: 1.6;">
                      Ismerd meg politikai elképzeléseimet és jövőképemet Budapest V. kerületéért
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Our values -->
          <div style="background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 50%); padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 5px solid #38b2ac;">
            <h3 style="color: #234e52; margin: 0 0 20px 0; font-size: 20px;">
              💚 Értékeink
            </h3>
            <ul style="color: #2c7a7b; font-size: 15px; line-height: 2; margin: 0; padding-left: 25px;">
              <li><strong>Átláthatóság:</strong> Nyílt kommunikáció és számonkérhetőség</li>
              <li><strong>Közösség:</strong> Együtt dolgozunk egy jobb jövőért</li>
              <li><strong>Innováció:</strong> Modern megoldások hagyományos értékekkel</li>
              <li><strong>Fenntarthatóság:</strong> Környezettudatos fejlesztések és zöld jövő</li>
              <li><strong>Szolgálat:</strong> A közösség érdeke mindenek felett</li>
            </ul>
          </div>

          <!-- CTA Buttons -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${websiteUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px;
                      font-weight: 600; font-size: 16px; margin: 10px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
              🏠 Főoldal megtekintése
            </a>

            <a href="${websiteUrl}/program"
               style="display: inline-block; background: white;
                      color: #667eea; text-decoration: none; padding: 16px 40px; border-radius: 8px;
                      font-weight: 600; font-size: 16px; margin: 10px; border: 2px solid #667eea;">
              📋 Programjaim
            </a>
          </div>

          <!-- Contact info -->
          <div style="background-color: #f7fafc; padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px;">
              📧 Kérdése van?
            </h4>
            <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
              Ne habozzon kapcsolatba lépni velem! Minden visszajelzést és kérdést szívesen fogadok.
              Írjon nekünk a <a href="${websiteUrl}/kapcsolat" style="color: #667eea; text-decoration: none; font-weight: 600;">kapcsolat oldalon</a>,
              vagy válaszoljon erre az emailre.
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0 20px 0;">
            <p style="color: #718096; font-size: 15px; line-height: 1.8; margin: 0;">
              Köszönöm, hogy csatlakozott! Együtt dolgozunk egy jobb jövőért. 🌟
            </p>
            <p style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 20px 0 0 0;">
              Üdvözlettel,<br/>
              <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 18px;">
                Lovas Zoltán György
              </span>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2d3748; padding: 30px; text-align: center; color: #e2e8f0;">
          <p style="margin: 0 0 10px 0; font-size: 14px;">
            Ezt az emailt automatikusan küldte a Lovas Zoltán platformja
          </p>
          <p style="margin: 0; color: #a0aec0; font-size: 12px;">
            © ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform | Budapest V. kerület
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            <a href="${websiteUrl}" style="color: #81e6d9; text-decoration: none; margin: 0 10px;">Weboldal</a> |
            <a href="${websiteUrl}/kapcsolat" style="color: #81e6d9; text-decoration: none; margin: 0 10px;">Kapcsolat</a> |
            <a href="${websiteUrl}/program" style="color: #81e6d9; text-decoration: none; margin: 0 10px;">Programjaim</a>
          </p>
        </div>
      </div>
    `;

    const emailContent = {
      from: process.env.GMAIL_USER || "noreply@lovaszoltan.dev",
      to: email,
      replyTo: "lovas.zoltan1986@gmail.com",
      subject: "🎉 Üdvözöljük! Sikeres regisztráció - Lovas Zoltán",
      html: emailHtml,
      text: `
Kedves ${name}!

Örömmel köszöntjük Önt platformunkon!

Sikeresen létrehozta fiókját, és mostantól hozzáférhet minden funkcióhoz, amely segít abban, hogy aktívan részt vegyen demokratikus közéletünkben.

Mit tehet platformunkon?

📰 Hírek és Cikkek
Értesülj a legfrissebb politikai fejleményekről, helyi eseményekről és álláspontjaimról

📅 Események és Programok
Jelentkezz rendezvényeinkre, találkozókra és közösségi eseményekre

🧠 Kvízek és Tudástesztek
Teszteld tudásodat politikai, közéleti és EU-s témákban

✍️ Petíciók és Szavazások
Támogass fontos ügyeket és mondd el véleményedet közösségi szavazásokon

🏛️ Programjaim
Ismerd meg politikai elképzeléseimet és jövőképemet Budapest V. kerületéért

💚 Értékeink

• Átláthatóság: Nyílt kommunikáció és számonkérhetőség
• Közösség: Együtt dolgozunk egy jobb jövőért
• Innováció: Modern megoldások hagyományos értékekkel
• Fenntarthatóság: Környezettudatos fejlesztések és zöld jövő
• Szolgálat: A közösség érdeke mindenek felett

Látogasson el weboldalunkra: ${websiteUrl}
Nézze meg programjaimat: ${websiteUrl}/program

Kérdése van?
Ne habozzon kapcsolatba lépni velem! Minden visszajelzést és kérdést szívesen fogadok.

Köszönöm, hogy csatlakozott! Együtt dolgozunk egy jobb jövőért.

Üdvözlettel,
Lovas Zoltán György

© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform
      `,
    };

    // Priority 1: Try Gmail SMTP
    const gmailTransporter = createGmailTransporter();
    if (gmailTransporter) {
      try {
        await gmailTransporter.sendMail(emailContent);
        console.log("✅ Gmail SMTP - Üdvözlő email sikeresen elküldve!");
        return { success: true };
      } catch (error) {
        console.error('Gmail SMTP küldési hiba:', error);
      }
    }

    // Priority 2: Try Resend
    if (resend) {
      try {
        const emailResult = await resend.emails.send(emailContent);
        console.log("✅ Resend - Üdvözlő email sikeresen elküldve!");
        return { success: true };
      } catch (error) {
        console.error('Resend küldési hiba:', error);
      }
    }

    // Priority 3: Fallback to Ethereal Email (development preview)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log("⚠️ Fallback: Ethereal Email preview");
          console.log(`📧 Welcome Email Preview: ${previewUrl}`);
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    return { success: false, error: "Email service unavailable" };
  } catch (error) {
    console.error("Üdvözlő email küldési hiba:", error);
    return { success: false, error: "Failed to send welcome email" };
  }
}

// Report notification email for users
export async function sendReportNotificationEmail(data: {
  to: string;
  reportId: string;
  title: string;
  category: string;
  addressText: string;
  urgency: string;
  userName: string;
}): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    console.log("Bejelentés értesítő email küldése...", {
      to: data.to,
      reportId: data.reportId,
      environment: process.env.NODE_ENV
    });

    const reportDetailUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/bejelentes/${data.reportId}`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✅ Bejelentés Sikeresen Rögzítve</h1>
        </div>

        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #333;">Tisztelt ${data.userName}!</p>

          <p style="color: #666;">Köszönjük bejelentését! A rendszerben sikeresen rögzítettük az alábbi azonosítóval:</p>

          <div style="background-color: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #1976d2; font-size: 14px; text-transform: uppercase;">Azonosító</p>
            <p style="font-size: 20px; font-weight: bold; color: #1565c0; margin: 0; font-family: monospace; letter-spacing: 1px;">${data.reportId.slice(0, 12).toUpperCase()}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2d3748;">📋 Bejelentés részletei</h3>
            <div style="color: #333;">
              <p style="margin: 8px 0;"><strong>Cím:</strong> ${data.title}</p>
              <p style="margin: 8px 0;"><strong>Kategória:</strong> ${data.category}</p>
              <p style="margin: 8px 0;"><strong>Helyszín:</strong> ${data.addressText}</p>
              <p style="margin: 8px 0;"><strong>Sürgősség:</strong> ${data.urgency}</p>
              <p style="margin: 8px 0;"><strong>Státusz:</strong> Függőben</p>
            </div>
          </div>

          <div style="background-color: #e8f5e8; border: 1px solid #4caf50; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">🔄 Mi történik ezután?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #2e7d32; line-height: 1.8;">
              <li>A bejelentést továbbítjuk a megfelelő hivatali osztályhoz</li>
              <li>E-mailben értesítést kap a státusz változásokról</li>
              <li>A bejelentés állapotát bármikor ellenőrizheti a profiljában</li>
              <li>Válaszidő: általában 5-15 munkanap</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportDetailUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px;
                      font-weight: 600; font-size: 16px;">
              📄 Bejelentés Megtekintése
            </a>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>💡 Tipp:</strong> Mentse el a bejelentés azonosítóját, hogy később könnyen megtalálhassa!
            </p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Kérdés esetén vegye fel a kapcsolatot a képviselői irodával.
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">Ez egy automatikus értesítő email. Kérjük, ne válaszoljon rá.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform</p>
        </div>
      </div>
    `;

    const emailContent = {
      from: process.env.GMAIL_USER || "noreply@lovaszoltan.dev",
      to: data.to,
      replyTo: "lovas.zoltan1986@gmail.com",
      subject: `Bejelentés sikeresen rögzítve - #${data.reportId.slice(0, 12).toUpperCase()}`,
      html: emailHtml,
      text: `
Tisztelt ${data.userName}!

Köszönjük bejelentését! A rendszerben sikeresen rögzítettük az alábbi azonosítóval:

Azonosító: ${data.reportId}

Bejelentés részletei:
• Cím: ${data.title}
• Kategória: ${data.category}
• Helyszín: ${data.addressText}
• Sürgősség: ${data.urgency}
• Státusz: Függőben

Mi történik ezután?
• A bejelentést továbbítjuk a megfelelő hivatali osztályhoz
• E-mailben értesítést kap a státusz változásokról
• A bejelentés állapotát bármikor ellenőrizheti a profiljában
• Válaszidő: általában 5-15 munkanap

Bejelentés megtekintése: ${reportDetailUrl}

Kérdés esetén vegye fel a kapcsolatot a képviselői irodával.

© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform
      `,
    };

    // Priority 1: Try Gmail SMTP
    const gmailTransporter = createGmailTransporter();
    if (gmailTransporter) {
      try {
        await gmailTransporter.sendMail(emailContent);
        console.log("✅ Gmail SMTP - Bejelentés értesítő email sikeresen elküldve!");
        return { success: true };
      } catch (error) {
        console.error('Gmail SMTP küldési hiba:', error);
      }
    }

    // Priority 2: Try Resend
    if (resend) {
      try {
        const emailResult = await resend.emails.send(emailContent);
        console.log("✅ Resend - Bejelentés értesítő email sikeresen elküldve!");
        return { success: true };
      } catch (error) {
        console.error('Resend küldési hiba:', error);
      }
    }

    // Priority 3: Fallback to Ethereal Email (development preview)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log("⚠️ Fallback: Ethereal Email preview");
          console.log(`📧 Report Notification Preview: ${previewUrl}`);
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email küldési hiba:', error);
        }
      }
    }

    console.log("❌ Bejelentés értesítő email küldése sikertelen!");
    return { success: false };
  } catch (error) {
    console.error("Bejelentés értesítő email küldési hiba:", error);
    return { success: false };
  }
}

// Report status update email notification
export async function sendReportStatusUpdateEmail(data: {
  to: string;
  reportId: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  comment?: string | null;
  userName: string;
}): Promise<{ success: boolean; previewUrl?: string }> {

  const statusLabels: Record<string, string> = {
    PENDING: 'Függőben',
    IN_REVIEW: 'Vizsgálat alatt',
    IN_PROGRESS: 'Folyamatban',
    RESOLVED: 'Megoldva',
    REJECTED: 'Elutasítva',
    CLOSED: 'Lezárva',
  };

  const statusColors: Record<string, string> = {
    PENDING: '#F59E0B',
    IN_REVIEW: '#3B82F6',
    IN_PROGRESS: '#8B5CF6',
    RESOLVED: '#10B981',
    REJECTED: '#EF4444',
    CLOSED: '#6B7280',
  };

  const reportDetailUrl = `${process.env.NEXTAUTH_URL}/bejelentes/${data.reportId}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bejelentés státusz frissítés</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
            📢 Bejelentés frissítve
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
            Tisztelt <strong>${data.userName}</strong>!
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 30px 0;">
            Frissítés történt az Ön bejelentésével kapcsolatban:
          </p>

          <!-- Report ID Badge -->
          <div style="background-color: #e0e7ff; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6366f1; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              Azonosító
            </p>
            <p style="margin: 0; font-size: 20px; font-weight: 700; color: #4f46e5; font-family: 'Courier New', monospace; letter-spacing: 1px;">
              ${data.reportId.slice(0, 12).toUpperCase()}
            </p>
          </div>

          <!-- Report Title -->
          <div style="border-left: 4px solid #6366f1; padding-left: 20px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
              Bejelentés címe
            </p>
            <p style="margin: 10px 0 0 0; font-size: 18px; color: #111827; font-weight: 600;">
              ${data.title}
            </p>
          </div>

          <!-- Status Change -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; font-weight: 600;">
              Státusz változás:
            </p>

            <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
              <div style="text-align: center;">
                <div style="background-color: ${statusColors[data.oldStatus] || '#6B7280'}; color: #ffffff; padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-block;">
                  ${statusLabels[data.oldStatus] || data.oldStatus}
                </div>
              </div>

              <div style="font-size: 24px; color: #9ca3af;">→</div>

              <div style="text-align: center;">
                <div style="background-color: ${statusColors[data.newStatus] || '#6B7280'}; color: #ffffff; padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  ${statusLabels[data.newStatus] || data.newStatus}
                </div>
              </div>
            </div>
          </div>

          ${data.comment ? `
          <!-- Admin Comment -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: start; gap: 12px;">
              <div style="flex-shrink: 0; margin-top: 2px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div style="flex: 1;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Üzenet az adminisztrátortól
                </p>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #78350f; white-space: pre-wrap;">
                  ${data.comment}
                </p>
              </div>
            </div>
          </div>
          ` : ''}

          <!-- What's Next Section -->
          <div style="background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #4f46e5; font-weight: 700;">
              🔔 Mi történik ezután?
            </h3>
            ${data.newStatus === 'IN_REVIEW' ? `
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4c1d95;">
                Bejelentését jelenleg vizsgáljuk. Munkatársaink áttekintik az ügyet és hamarosan további lépéseket teszünk.
              </p>
            ` : ''}
            ${data.newStatus === 'IN_PROGRESS' ? `
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4c1d95;">
                Az ügy feldolgozása megkezdődött! Aktívan dolgozunk a bejelentése megoldásán. Értesítjük, amint újabb fejlemény történik.
              </p>
            ` : ''}
            ${data.newStatus === 'RESOLVED' ? `
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4c1d95;">
                ✅ Jó hírünk van! Az Ön bejelentését sikeresen megoldottuk. Köszönjük, hogy jelzéssel hozzájárult közösségünk jobbá tételéhez!
              </p>
            ` : ''}
            ${data.newStatus === 'REJECTED' ? `
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4c1d95;">
                Sajnos bejelentését nem tudtuk elfogadni. További információkért tekintse meg a részleteket a bejelentés oldalán.
              </p>
            ` : ''}
            ${data.newStatus === 'PENDING' ? `
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4c1d95;">
                Bejelentése várakozási listára került. Amint lehetőségünk van rá, foglalkozni fogunk az üggyel.
              </p>
            ` : ''}
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${reportDetailUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
              Bejelentés megtekintése →
            </a>
          </div>

          <!-- Help Section -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px;">
            <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
              <strong>Kérdése van?</strong> Válaszoljon erre az emailre vagy lépjen kapcsolatba velünk a <a href="${process.env.NEXTAUTH_URL}/kapcsolat" style="color: #6366f1; text-decoration: none; font-weight: 600;">kapcsolat oldalon</a>.
            </p>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
              Nyomon követheti bejelentésének állapotát az online rendszerünkben bármikor.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
            Köszönjük, hogy aktívan részt vesz közösségünk életében!
          </p>
          <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            Ez egy automatikus értesítés. Kérjük, ne válaszoljon közvetlenül erre az emailre.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  const textContent = `
Bejelentés státusz frissítés

Tisztelt ${data.userName}!

Frissítés történt az Ön bejelentésével kapcsolatban.

Azonosító: ${data.reportId.slice(0, 12).toUpperCase()}
Cím: ${data.title}

Státusz változás: ${statusLabels[data.oldStatus]} → ${statusLabels[data.newStatus]}

${data.comment ? `\nÜzenet az adminisztrátortól:\n${data.comment}\n` : ''}

Bejelentés megtekintése: ${reportDetailUrl}

Köszönjük, hogy aktívan részt vesz közösségünk életében!
  `.trim();

  const emailContent = {
    from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@example.com',
    to: data.to,
    subject: `🔔 Bejelentés frissítve: ${data.title}`,
    text: textContent,
    html: emailHtml,
  };

  // Priority 1: Try Gmail SMTP (most reliable for production)
  const gmailTransporter = createGmailTransporter();
  if (gmailTransporter) {
    try {
      await gmailTransporter.sendMail(emailContent);
      console.log('[EMAIL] ✅ Status update email sent via Gmail SMTP to:', data.to);
      return { success: true };
    } catch (gmailError) {
      console.error('[EMAIL] ❌ Gmail SMTP failed:', gmailError);
    }
  }

  // Priority 2: Try Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Bejelentések <onboarding@resend.dev>',
        to: data.to,
        subject: emailContent.subject,
        html: emailHtml,
        text: textContent,
      });
      console.log('[EMAIL] ✅ Status update email sent via Resend to:', data.to);
      return { success: true };
    } catch (resendError: any) {
      console.error('[EMAIL] ❌ Resend failed:', resendError);
    }
  }

  // Priority 3: Fallback to Ethereal (for testing)
  try {
    const etherealTransporter = await createEtherealTransporter();
    if (etherealTransporter) {
      const info = await etherealTransporter.sendMail(emailContent);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('[EMAIL] ℹ️  Status update email preview (Ethereal):', previewUrl);
      return { success: true, previewUrl: previewUrl || undefined };
    }
  } catch (etherealError) {
    console.error('[EMAIL] ❌ Ethereal failed:', etherealError);
  }

  return { success: false };
}

// Event registration cancellation email functionality
export async function sendEventCancellationEmail(
  email: string,
  name: string,
  eventTitle: string,
  eventLocation: string,
  eventStartDate: string,
  eventEndDate: string
): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    const eventDate = new Date(eventStartDate).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    const eventTime = new Date(eventStartDate).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const eventEndTime = new Date(eventEndDate).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log("Esemény lemondás email küldése...", {
      to: email,
      eventTitle,
      eventDate,
      environment: process.env.NODE_ENV
    });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f56565 0%, #c53030 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Esemény Jelentkezés Lemondva</h1>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #333;">Kedves ${name}!</p>
          
          <p style="color: #666;">Megerősítjük, hogy lemondta jelentkezését a következő eseményről:</p>
          
          <div style="background-color: #fed7d7; padding: 20px; border-left: 4px solid #f56565; margin: 20px 0;">
            <strong style="color: #333; font-size: 18px;">${eventTitle}</strong>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 15px 0; color: #4a5568;">📅 Esemény részletei</h3>
            <div style="color: #333;">
              <p style="margin: 5px 0;"><strong>📅 Dátum:</strong> ${eventDate}</p>
              <p style="margin: 5px 0;"><strong>🕐 Időpont:</strong> ${eventTime} - ${eventEndTime}</p>
              <p style="margin: 5px 0;"><strong>📍 Helyszín:</strong> ${eventLocation}</p>
            </div>
          </div>
          
          <div style="background-color: #fed7d7; border: 1px solid #f56565; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #c53030;"><strong>❌ Jelentkezése lemondva!</strong></p>
            <p style="margin: 5px 0 0 0; color: #c53030;">Nem vesz részt az eseményen. Helye felszabadult mások számára.</p>
          </div>
          
          <div style="background-color: #e6fffa; border: 1px solid #38b2ac; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #285e61;"><strong>💚 Újra jelentkezhet!</strong></p>
            <p style="margin: 5px 0 0 0; color: #285e61;">Ha meggondolja magát, bármikor újra jelentkezhet az eseményre a weboldalunkon, amíg van szabad hely.</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">Köszönjük, hogy figyelembe vette eseményünket. Reméljük, találkozunk egy következő alkalommal!</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">Ez egy automatikus email. Kérjük, ne válaszoljon rá.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform</p>
        </div>
      </div>
    `;

    // Email content for all services
    const emailContent = {
      from: '"Lovas Zoltán Események" <events@example.com>',
      to: email,
      subject: `Esemény lemondás megerősítve - ${eventTitle}`,
      html: emailHtml,
      text: `
Kedves ${name}!

Megerősítjük, hogy lemondta jelentkezését a következő eseményről:
${eventTitle}

Esemény részletei:
📅 Dátum: ${eventDate}
🕐 Időpont: ${eventTime} - ${eventEndTime}
📍 Helyszín: ${eventLocation}

❌ Jelentkezése lemondva!

💚 Újra jelentkezhet!
Ha meggondolja magát, bármikor újra jelentkezhet az eseményre a weboldalunkon, amíg van szabad hely.

Köszönjük, hogy figyelembe vette eseményünket. Reméljük, találkozunk egy következő alkalommal!

© ${new Date().getFullYear()} Lovas Zoltán György - Politikai Platform
      `,
    };

    // Priority 1: Try Gmail SMTP (for real email sending)
    const gmailTransporter = createGmailTransporter();
    if (gmailTransporter) {
      try {
        const info = await gmailTransporter.sendMail({
          ...emailContent,
          from: `"Lovas Zoltán Események" <${process.env.GMAIL_USER}>`,
        });
        
        console.log("✅ Gmail SMTP - Esemény lemondás email sikeresen elküldve!");
        console.log(`📬 Email ID: ${info.messageId}`);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('Gmail SMTP esemény lemondás email küldési hiba:', error);
        // Continue to next option
      }
    }

    // Priority 2: Try generic SMTP
    const smtpTransporter = createSMTPTransporter();
    if (smtpTransporter) {
      try {
        const info = await smtpTransporter.sendMail(emailContent);
        
        console.log("✅ SMTP - Esemény lemondás email sikeresen elküldve!");
        console.log(`📬 Email ID: ${info.messageId}`);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('SMTP esemény lemondás email küldési hiba:', error);
        // Continue to next option
      }
    }

    // Priority 3: Try Resend (production service)
    if (resend) {
      try {
        const emailResult = await resend?.emails.send({
          from: "Lovas Zoltán Események <onboarding@resend.dev>",
          to: email,
          subject: `Esemény lemondás megerősítve - ${eventTitle}`,
          html: emailHtml,
        });

        console.log("✅ Resend - Esemény lemondás email sikeresen elküldve!");
        console.log("Resend email eredménye:", emailResult);
        console.log(`📧 Valós email elküldve a következő címre: ${email}`);
        
        return { success: true };
      } catch (error) {
        console.error('Resend esemény lemondás email küldési hiba:', error);
        // Continue to fallback
      }
    }

    // Priority 4: Fallback to Ethereal Email (development preview only)
    if (process.env.NODE_ENV === 'development') {
      const transporter = await createEtherealTransporter();
      
      if (transporter) {
        try {
          const info = await transporter.sendMail(emailContent);
          const previewUrl = nodemailer.getTestMessageUrl(info);
          
          console.log("⚠️ Fallback: Ethereal Email preview (nem valós email)");
          console.log(`📧 Email Preview URL: ${previewUrl}`);
          console.log(`📬 Email ID: ${info.messageId}`);
          
          return { success: true, previewUrl: previewUrl || undefined };
        } catch (error) {
          console.error('Ethereal Email esemény lemondás küldési hiba:', error);
        }
      }
    }

    // Final fallback: Log email details
    console.log("❌ Egyetlen email szolgáltatás sem elérhető!");
    console.log(`📧 ESEMÉNY LEMONDÁS EMAIL PREVIEW (csak konzol):`);
    console.log(`To: ${email}`);
    console.log(`Subject: Esemény lemondás megerősítve - ${eventTitle}`);
    console.log(`Event: ${eventTitle} | ${eventDate} ${eventTime} | ${eventLocation}`);
    console.log(`---`);
    console.log(`🔧 Konfigurálja a Gmail SMTP-t vagy Resend API-t valós email küldéshez!`);
    
    return { success: true };

  } catch (error) {
    console.error("Esemény lemondás email küldési hiba:", {
      error: error instanceof Error ? error.message : String(error),
      email,
      eventTitle,
    });
    return { success: false };
  }
}
