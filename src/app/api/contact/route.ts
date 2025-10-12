import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { sendContactNotification, sendNewsletterConfirmation } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// Validációs függvény
const validateContactForm = (data: any) => {
  const errors = [];

  if (!data.name || typeof data.name !== "string" || data.name.length < 2) {
    errors.push("Érvénytelen név");
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Érvénytelen email cím");
  }

  if (
    !data.subject ||
    typeof data.subject !== "string" ||
    data.subject.length < 3
  ) {
    errors.push("Érvénytelen tárgy");
  }

  if (
    !data.message ||
    typeof data.message !== "string" ||
    data.message.length < 10
  ) {
    errors.push("Az üzenetnek legalább 10 karakter hosszúnak kell lennie");
  }

  // Telefonszám validáció - NEMZETKÖZI TÁMOGATÁS
  const validatePhoneNumber = (phone: string): boolean => {
    // Nemzetközi telefonszám formátumok támogatása
    const phoneRegexes = [
      // Nemzetközi formátum: +[országkód][szám]
      /^\+[1-9]\d{1,14}$/,
      // Európai formátumok szóközökkel/kötőjelekkel
      /^\+[1-9]\d{1,3}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/,
      // Magyar formátumok
      /^(\+36|06)[\s\-]?[1-9]\d[\s\-]?\d{3}[\s\-]?\d{3,4}$/,
      // Zárójelekkel (pl: +36 (30) 123 4567)
      /^\+[1-9]\d{1,3}[\s\-]?\([1-9]\d*\)[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{0,4}$/,
      // Amerikai formátum
      /^\+1[\s\-]?\([2-9]\d{2}\)[\s\-]?\d{3}[\s\-]?\d{4}$/,
      // Egyesült Királyság
      /^\+44[\s\-]?[1-9]\d{8,9}$/,
      // Németország 
      /^\+49[\s\-]?[1-9]\d{1,4}[\s\-]?\d{1,8}$/,
      // Általános nemzetközi (ITU-T E.164)
      /^\+[1-9]\d{4,14}$/
    ];
    
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
    
    // Ha + jellel kezdődik, ellenőrizzük hogy érvényes nemzetközi formátum
    if (phone.trim().startsWith('+')) {
      return phoneRegexes.some(regex => regex.test(phone.trim()));
    }
    
    // Ha nem + jellel kezdődik, csak magyar számokat fogadunk el
    return /^06[1-9]\d{8}$/.test(cleanPhone) || /^[1-9]\d{8}$/.test(cleanPhone);
  };

  if (data.preferredContact === "phone") {
    // Ha telefonos kapcsolatartást kér, telefonszám KÖTELEZŐ
    if (!data.phone || typeof data.phone !== "string" || data.phone.trim().length === 0) {
      errors.push("Telefonos kapcsolatartás esetén telefonszám megadása kötelező");
    } else if (!validatePhoneNumber(data.phone)) {
      errors.push("Érvénytelen telefonszám formátum. Nemzetközi formátum: +[országkód] [szám] (pl: +36 30 123 4567, +1 555 123 4567)");
    }
  } else if (data.phone && !validatePhoneNumber(data.phone)) {
    // Ha nem kötelező, de megadták, akkor is validáljuk
    errors.push("Érvénytelen telefonszám formátum. Nemzetközi formátum: +[országkód] [szám] (pl: +36 30 123 4567, +1 555 123 4567)");
  }

  // Rate limiting - SPAM védelem
  // TODO: Implementálni rate limiting middleware-t

  return errors;
};

export async function POST(request: Request) {
  try {
    console.log("Kontakt form kérés érkezett");
    
    // BIZTONSÁGI VÉDELEM: Rate limiting ellenőrzés 
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log(`Rate limit check for IP: ${clientIP}`);
    
    const isAllowed = await checkRateLimit({
      limit: 3, // Maximum 3 üzenet
      windowMs: 15 * 60 * 1000, // 15 percenként
      currentTimestamp: Date.now()
    });

    if (!isAllowed) {
      console.warn(`Rate limit túllépve a contact formnál. IP: ${clientIP}`);
      return NextResponse.json(
        { 
          error: "Túl sok kérés. Kérjük, várjon 15 percet a következő üzenet küldése előtt.",
          retryAfter: 900 // 15 perc másodpercben
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + 900000).toString()
          }
        }
      );
    }
    
    const data = await request.json();

    // Validáljuk a beérkező adatokat
    console.log("Validálás kezdése...");
    const validationErrors = validateContactForm(data);
    if (validationErrors.length > 0) {
      console.log("Validációs hibák:", validationErrors);
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // Mentsük az adatbázisba
    console.log("Adatbázis mentés kezdése...");
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        district: data.district || null,
        preferredContact: data.preferredContact || "email",
        newsletter: data.newsletter || false,
        status: "NEW",
      },
    });
    console.log("Adatbázis mentés sikeres:", contact.id);

    // Email küldés
    console.log("Email küldés kezdése...");
    try {
      // Admin értesítő email (mint eddig)
      await sendContactNotification(data);
      console.log("Admin értesítő email küldés sikeres");
      
      // GDPR compliant: Ha hírlevél feliratkozás, megerősítő email a feliratkozónak
      if (data.newsletter) {
        console.log("Hírlevél feliratkozás észlelve, megerősítő email küldése...");
        const confirmationResult = await sendNewsletterConfirmation({
          name: data.name,
          email: data.email
        });
        
        if (confirmationResult.success) {
          console.log("✅ Hírlevél megerősítő email sikeresen elküldve a feliratkozónak");
        } else {
          console.error("❌ Hírlevél megerősítő email küldése sikertelen:", confirmationResult.error);
        }
      }
    } catch (emailError) {
      console.error("Email küldési hiba:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Üzenet sikeresen elküldve",
      id: contact.id,
      timestamp: contact.createdAt,
    });
  } catch (error) {
    console.error("Általános hiba:", error);
    return NextResponse.json(
      {
        error:
          "Hiba történt az üzenet feldolgozása során. Kérjük, próbálja újra később.",
      },
      { status: 500 }
    );
  }
}

// GET kérések tiltása
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
