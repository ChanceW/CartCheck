import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { listId } = params

    // Get shopping list with items and check user access
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
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
        items: {
          orderBy: [
            { isCompleted: 'asc' },
            { priority: 'desc' },
            { createdAt: 'desc' }
          ]
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!shoppingList) {
      return NextResponse.json(
        { message: 'Shopping list not found or you do not have access' },
        { status: 404 }
      )
    }

    return NextResponse.json({ shoppingList })
  } catch (error) {
    console.error('Error fetching shopping list:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { listId } = params
    const { name, description, isCompleted } = await request.json()

    // Check if user has access to the shopping list
    const existingList = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    if (!existingList) {
      return NextResponse.json(
        { message: 'Shopping list not found or you do not have access' },
        { status: 404 }
      )
    }

    // Update shopping list
    const updatedList = await prisma.shoppingList.update({
      where: {
        id: listId
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isCompleted !== undefined && { isCompleted })
      },
      include: {
        items: {
          orderBy: [
            { isCompleted: 'asc' },
            { priority: 'desc' },
            { createdAt: 'desc' }
          ]
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return NextResponse.json({ shoppingList: updatedList })
  } catch (error) {
    console.error('Error updating shopping list:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { listId } = params

    // Check if user has access to the shopping list
    const existingList = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    if (!existingList) {
      return NextResponse.json(
        { message: 'Shopping list not found or you do not have access' },
        { status: 404 }
      )
    }

    // Delete shopping list (items will be deleted due to cascade)
    await prisma.shoppingList.delete({
      where: {
        id: listId
      }
    })

    return NextResponse.json({ 
      message: 'Shopping list deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting shopping list:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 