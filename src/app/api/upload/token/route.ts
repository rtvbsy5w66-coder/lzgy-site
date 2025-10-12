// src/app/api/upload/token/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validálás: csak bizonyos fájltípusok
        const allowedExtensions = ['.mp4', '.webm', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasValidExtension = allowedExtensions.some(ext => pathname.toLowerCase().endsWith(ext));

        if (!hasValidExtension) {
          throw new Error('Nem támogatott fájltípus');
        }

        return {
          allowedContentTypes: [
            'video/mp4',
            'video/webm',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload token error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
