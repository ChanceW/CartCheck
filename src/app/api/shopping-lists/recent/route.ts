import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get recent shopping lists from groups where user is a member
    const recentLists = await prisma.shoppingList.findMany({
      where: {
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            items: true
          }
        },
        items: {
          select: {
            isCompleted: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      take: limit
    })

    // Transform the data to include completion info
    const transformedLists = recentLists.map(list => ({
      id: list.id,
      name: list.name,
      description: list.description,
      isCompleted: list.isCompleted,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      group: list.group,
      itemsCount: list._count.items,
      completedItemsCount: list.items.filter(item => item.isCompleted).length
    }))

    return NextResponse.json({ 
      recentLists: transformedLists 
    })
  } catch (error) {
    console.error('Error fetching recent shopping lists:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 