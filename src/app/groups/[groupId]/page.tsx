'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Users, ShoppingCart, Crown, User, Copy, Check, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'
import { formatDate } from '@/lib/utils'

interface Group {
  id: string
  name: string
  description?: string
  inviteCode: string
  createdAt: string
  updatedAt: string
  createdBy: string
  creator: {
    id: string
    name: string
    email: string
  }
  members: Array<{
    id: string
    role: 'ADMIN' | 'MEMBER'
    joinedAt: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  shoppingLists: Array<{
    id: string
    name: string
    isCompleted: boolean
    createdAt: string
    updatedAt: string
  }>
  _count: {
    members: number
    shoppingLists: number
  }
}

export default function GroupDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const groupId = params.groupId as string
  
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.id && groupId) {
      fetchGroup()
    }
  }, [session, groupId])

  const fetchGroup = async () => {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        const foundGroup = data.groups.find((g: Group) => g.id === groupId)
        if (foundGroup) {
          setGroup(foundGroup)
        } else {
          toast.error('Group not found')
          router.push('/groups')
        }
      } else {
        toast.error('Failed to fetch group')
        router.push('/groups')
      }
    } catch (error) {
      toast.error('Something went wrong')
      router.push('/groups')
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteCode = async () => {
    if (!group) return
    
    try {
      await navigator.clipboard.writeText(group.inviteCode)
      setCopiedCode(true)
      toast.success('Invite code copied!')
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (error) {
      toast.error('Failed to copy invite code')
    }
  }

  const getUserRole = () => {
    if (!group) return null
    return group.members.find(member => member.user.id === session?.user?.id)?.role
  }

  const isGroupCreator = () => {
    if (!group) return false
    return group.createdBy === session?.user?.id
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" showText={false} className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !group) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/groups')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Groups</span>
              </button>
              <Logo href="/dashboard" />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header */}
        <div className="card mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                {isGroupCreator() && (
                  <div title="Group Creator">
                    <Crown className="w-6 h-6 text-accent" />
                  </div>
                )}
                {getUserRole() === 'ADMIN' && !isGroupCreator() && (
                  <div title="Admin">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
              {group.description && (
                <p className="text-gray-600 mb-4">{group.description}</p>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(new Date(group.createdAt))}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{group._count.members} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{group._count.shoppingLists} lists</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invite Code Section */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Invite Others</h3>
              <button
                onClick={copyInviteCode}
                className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </span>
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Share this invite code with others to let them join the group:
              </p>
              <code className="block text-lg font-mono bg-white p-3 rounded border">
                {group.inviteCode}
              </code>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Members */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Members ({group.members.length})</h2>
            <div className="space-y-4">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user.name || member.user.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined {formatDate(new Date(member.joinedAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.user.id === group.createdBy && (
                      <div title="Group Creator">
                        <Crown className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      member.role === 'ADMIN' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shopping Lists */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Shopping Lists ({group.shoppingLists.length})</h2>
              <button 
                onClick={() => router.push(`/groups/${groupId}/shopping-lists`)}
                className="btn-primary text-sm"
              >
                Create List
              </button>
            </div>
            {group.shoppingLists.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No shopping lists yet</p>
                <button 
                  onClick={() => router.push(`/groups/${groupId}/shopping-lists`)}
                  className="btn-primary text-sm"
                >
                  Create First List
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {group.shoppingLists.map((list) => (
                  <div key={list.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{list.name}</h4>
                      <p className="text-sm text-gray-600">
                        Updated {formatDate(new Date(list.updatedAt))}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        list.isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {list.isCompleted ? 'Completed' : 'Active'}
                      </span>
                      <button 
                        onClick={() => router.push(`/shopping-lists/${list.id}`)}
                        className="text-primary hover:text-primary-dark text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
                {group.shoppingLists.length > 0 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => router.push(`/groups/${groupId}/shopping-lists`)}
                      className="btn-secondary text-sm"
                    >
                      View All Lists
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 