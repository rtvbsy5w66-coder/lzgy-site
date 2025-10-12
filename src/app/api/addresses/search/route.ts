import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }

    // Search in addresses with related street and district data
    const addresses = await prisma.address.findMany({
      where: {
        OR: [
          // Search by street name
          {
            street: {
              name: {
                contains: query
              }
            }
          },
          // Search by house number
          {
            houseNumber: {
              contains: query
            }
          },
          // Search by postal code
          {
            postalCode: {
              contains: query
            }
          },
          // Combined search (e.g., "Váci utca 15")
          {
            AND: [
              {
                street: {
                  name: {
                    contains: query.split(' ')[0]
                  }
                }
              },
              query.split(' ').length > 1 ? {
                houseNumber: {
                  contains: query.split(' ').slice(-1)[0]
                }
              } : {}
            ]
          }
        ],
        isActive: true
      },
      include: {
        street: {
          include: {
            district: true
          }
        }
      },
      orderBy: [
        { street: { name: 'asc' } },
        { houseNumberInt: 'asc' }
      ],
      take: limit
    });

    // Transform the data for frontend consumption
    const formattedAddresses = addresses.map(address => ({
      id: address.id,
      fullAddress: `${address.street.name} ${address.houseNumber}`,
      street: address.street.name,
      streetType: address.street.streetType,
      houseNumber: address.houseNumber,
      building: address.building,
      entrance: address.entrance,
      postalCode: address.postalCode,
      district: address.street.district.name,
      coordinates: address.latitude && address.longitude ? {
        lat: address.latitude,
        lng: address.longitude
      } : undefined
    }));

    return NextResponse.json({
      success: true,
      addresses: formattedAddresses,
      count: formattedAddresses.length
    });

  } catch (error) {
    console.error('Address search error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validate a specific address
export async function POST(request: NextRequest) {
  try {
    const { addressId, fullAddress } = await request.json();
    
    let address;
    
    if (addressId) {
      // Validate by ID
      address = await prisma.address.findUnique({
        where: { 
          id: addressId,
          isActive: true 
        },
        include: {
          street: {
            include: {
              district: true
            }
          }
        }
      });
    } else if (fullAddress) {
      // Validate by parsing full address string
      const parts = fullAddress.trim().split(' ');
      if (parts.length < 2) {
        return NextResponse.json({
          success: false,
          error: 'Invalid address format'
        });
      }
      
      const houseNumber = parts.pop();
      const streetName = parts.join(' ');
      
      address = await prisma.address.findFirst({
        where: {
          houseNumber: houseNumber,
          street: {
            name: streetName,
            district: {
              number: 5 // V. kerület
            }
          },
          isActive: true
        },
        include: {
          street: {
            include: {
              district: true
            }
          }
        }
      });
    }
    
    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Address not found or invalid'
      });
    }

    return NextResponse.json({
      success: true,
      address: {
        id: address.id,
        fullAddress: `${address.street.name} ${address.houseNumber}`,
        street: address.street.name,
        streetType: address.street.streetType,
        houseNumber: address.houseNumber,
        building: address.building,
        entrance: address.entrance,
        postalCode: address.postalCode,
        district: address.street.district.name,
        coordinates: address.latitude && address.longitude ? {
          lat: address.latitude,
          lng: address.longitude
        } : undefined
      }
    });

  } catch (error) {
    console.error('Address validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}