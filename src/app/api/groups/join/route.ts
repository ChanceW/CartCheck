import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { inviteCode } = await request.json()

    if (!inviteCode) {
      return NextResponse.json(
        { message: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Find group by invite code
    const group = await prisma.group.findUnique({
      where: {
        inviteCode: inviteCode.trim()
      },
      include: {
        members: {
          where: {
            userId: session.user.id
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { message: 'Invalid invite code' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    if (group.members.length > 0) {
      return NextResponse.json(
        { message: 'You are already a member of this group' },
        { status: 400 }
      )
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: 'MEMBER'
      }
    })

    // Return updated group info
    const updatedGroup = await prisma.group.findUnique({
      where: {
        id: group.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            shoppingLists: true
          }
        }
      }
    })

    return NextResponse.json({ 
      group: updatedGroup,
      message: 'Successfully joined group!'
    })
  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 