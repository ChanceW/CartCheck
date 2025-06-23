import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { groupId } = params

    // Check if user is a member of the group
    const groupMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id
        }
      }
    })

    if (!groupMember) {
      return NextResponse.json(
        { message: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Get shopping lists for the group
    const shoppingLists = await prisma.shoppingList.findMany({
      where: {
        groupId
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            isCompleted: true,
            priority: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: [
        { isCompleted: 'asc' },
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json({ shoppingLists })
  } catch (error) {
    console.error('Error fetching shopping lists:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { groupId } = params
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: 'Shopping list name is required' },
        { status: 400 }
      )
    }

    // Check if user is a member of the group
    const groupMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id
        }
      }
    })

    if (!groupMember) {
      return NextResponse.json(
        { message: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Create shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name,
        description,
        groupId
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            isCompleted: true,
            priority: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return NextResponse.json({ shoppingList }, { status: 201 })
  } catch (error) {
    console.error('Error creating shopping list:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 