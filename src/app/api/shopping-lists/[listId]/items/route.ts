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

    // Check if user has access to the shopping list
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
      }
    })

    if (!shoppingList) {
      return NextResponse.json(
        { message: 'Shopping list not found or you do not have access' },
        { status: 404 }
      )
    }

    // Get items
    const items = await prisma.shoppingItem.findMany({
      where: {
        shoppingListId: listId
      },
      orderBy: [
        { isCompleted: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching shopping items:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { 
      name, 
      quantity = 1, 
      unit, 
      notes, 
      priority = 'MEDIUM',
      category,
      estimatedPrice 
    } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: 'Item name is required' },
        { status: 400 }
      )
    }

    // Check if user has access to the shopping list
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
      }
    })

    if (!shoppingList) {
      return NextResponse.json(
        { message: 'Shopping list not found or you do not have access' },
        { status: 404 }
      )
    }

    // Create item
    const item = await prisma.shoppingItem.create({
      data: {
        name,
        quantity: parseInt(quantity) || 1,
        unit,
        notes,
        priority,
        category,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        shoppingListId: listId
      }
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating shopping item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 