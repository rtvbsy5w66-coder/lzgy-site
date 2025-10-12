import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.issueCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      categories: categories
    });
    
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a kategóriák betöltése során.' },
      { status: 500 }
    );
  }
}

// POST endpoint új kategória létrehozásához (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Admin jogosultság ellenőrzése
    
    const category = await prisma.issueCategory.create({
      data: {
        id: body.id,
        name: body.name,
        description: body.description,
        icon: body.icon,
        color: body.color,
        isActive: body.isActive ?? true,
        order: body.order || 999,
        formFields: body.formFields || []
      }
    });
    
    return NextResponse.json({
      success: true,
      category: category
    });
    
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a kategória létrehozása során.' },
      { status: 500 }
    );
  }
}