import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
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
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id
        }
      },
      include: {
        group: {
          include: {
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { message: 'You are not a member of this group' },
        { status: 404 }
      )
    }

    // Check if user is the creator and the only member
    const isCreator = membership.group.createdBy === session.user.id
    const isOnlyMember = membership.group._count.members === 1

    if (isCreator && isOnlyMember) {
      // Delete the entire group if creator is the only member
      await prisma.group.delete({
        where: {
          id: groupId
        }
      })
    } else if (isCreator && !isOnlyMember) {
      // Transfer ownership to another admin or the oldest member
      const newOwner = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: {
            not: session.user.id
          },
          OR: [
            { role: 'ADMIN' },
            { role: 'MEMBER' }
          ]
        },
        orderBy: [
          { role: 'desc' }, // ADMIN first
          { joinedAt: 'asc' } // Oldest member
        ]
      })

      if (newOwner) {
        // Update group ownership and make new owner admin
        await prisma.$transaction([
          prisma.group.update({
            where: { id: groupId },
            data: { createdBy: newOwner.userId }
          }),
          prisma.groupMember.update({
            where: { id: newOwner.id },
            data: { role: 'ADMIN' }
          }),
          prisma.groupMember.delete({
            where: {
              groupId_userId: {
                groupId,
                userId: session.user.id
              }
            }
          })
        ])
      }
    } else {
      // Just remove the member
      await prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId: session.user.id
          }
        }
      })
    }

    return NextResponse.json({ 
      message: 'Successfully left group'
    })
  } catch (error) {
    console.error('Error leaving group:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 