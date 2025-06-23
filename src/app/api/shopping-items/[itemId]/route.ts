import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { itemId } = params
    const { 
      name, 
      quantity, 
      unit, 
      notes, 
      isCompleted,
      priority,
      category,
      estimatedPrice,
      actualPrice 
    } = await request.json()

    // Check if user has access to the shopping item
    const existingItem = await prisma.shoppingItem.findFirst({
      where: {
        id: itemId,
        shoppingList: {
          group: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { message: 'Shopping item not found or you do not have access' },
        { status: 404 }
      )
    }

    // Update item
    const updatedItem = await prisma.shoppingItem.update({
      where: {
        id: itemId
      },
      data: {
        ...(name && { name }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) || 1 }),
        ...(unit !== undefined && { unit }),
        ...(notes !== undefined && { notes }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(priority && { priority }),
        ...(category !== undefined && { category }),
        ...(estimatedPrice !== undefined && { estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null }),
        ...(actualPrice !== undefined && { actualPrice: actualPrice ? parseFloat(actualPrice) : null })
      }
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Error updating shopping item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { itemId } = params

    // Check if user has access to the shopping item
    const existingItem = await prisma.shoppingItem.findFirst({
      where: {
        id: itemId,
        shoppingList: {
          group: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { message: 'Shopping item not found or you do not have access' },
        { status: 404 }
      )
    }

    // Delete item
    await prisma.shoppingItem.delete({
      where: {
        id: itemId
      }
    })

    return NextResponse.json({ 
      message: 'Shopping item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting shopping item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 