import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { 
  createApiResponse, 
  createApiError, 
  createValidationError, 
  validateRequiredFields,
  API_MESSAGES 
} from "@/lib/api-helpers";
import { handleApiError, validateEmail } from "@/lib/error-handler";

// GET - Összes üzenet lekérése
export async function GET() {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = messages.length;
    const message = count > 0 
      ? `${count} üzenet betöltve`
      : 'Nincsenek üzenetek';

    return createApiResponse(messages, message);
  } catch (error) {
    return handleApiError(error, "MESSAGES_GET");
  }
}

// POST - Új üzenet létrehozása (ez a contact form által használt végpont)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Kötelező mezők validációja
    const validation = validateRequiredFields(data, [
      'name', 
      'email', 
      'subject', 
      'message'
    ]);
    if (!validation.isValid) {
      return createValidationError(validation.errors);
    }

    // Email validáció
    validateEmail(data.email);

    const message = await prisma.contact.create({
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

    return createApiResponse(message, "Üzenet sikeresen elküldve", 201);
  } catch (error) {
    return handleApiError(error, "MESSAGES_POST");
  }
}
