'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Users, Share2, LogOut, Calendar, ShoppingCart, Crown, User, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'

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
  }>
  _count: {
    members: number
    shoppingLists: number
  }
}

export default function GroupsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups()
    }
  }, [session])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
      } else {
        toast.error('Failed to fetch groups')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setIsJoining(true)
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setShowJoinModal(false)
        setInviteCode('')
        fetchGroups()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroup.name.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Group created successfully!')
        setShowCreateModal(false)
        setNewGroup({ name: '', description: '' })
        fetchGroups()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to leave "${groupName}"?`)) return

    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        fetchGroups()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const copyInviteCode = async (inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopiedCode(inviteCode)
      toast.success('Invite code copied!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy invite code')
    }
  }

  const getUserRole = (group: Group) => {
    return group.members.find(member => member.user.id === session?.user?.id)?.role
  }

  const isGroupCreator = (group: Group) => {
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

  if (!session) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/dashboard" />
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user.name}</span>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Groups</h1>
            <p className="text-gray-600 mt-2">
              Manage your shopping groups and collaborate with others
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Join Group</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first group or join an existing one to get started
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary"
              >
                Join Group
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                      {isGroupCreator(group) && (
                        <div title="Group Creator">
                          <Crown className="w-4 h-4 text-accent" />
                        </div>
                      )}
                      {getUserRole(group) === 'ADMIN' && !isGroupCreator(group) && (
                        <div title="Admin">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Members</span>
                    <span className="font-medium">{group._count.members}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shopping Lists</span>
                    <span className="font-medium">{group._count.shoppingLists}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created by</span>
                    <span className="font-medium">{group.creator.name}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Invite Code</span>
                    <button
                      onClick={() => copyInviteCode(group.inviteCode)}
                      className="flex items-center space-x-1 text-primary hover:text-primary-dark transition-colors"
                    >
                      {copiedCode === group.inviteCode ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {copiedCode === group.inviteCode ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <code className="block text-xs bg-gray-100 p-2 rounded font-mono">
                    {group.inviteCode}
                  </code>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/groups/${group.id}`)}
                    className="text-primary hover:text-primary-dark font-medium text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleLeaveGroup(group.id, group.name)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors text-sm"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Leave</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Join a Group</h2>
            <form onSubmit={handleJoinGroup}>
              <div className="mb-4">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter the group invite code"
                  className="input-field"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false)
                    setInviteCode('')
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !inviteCode.trim()}
                  className="flex-1 btn-primary"
                >
                  {isJoining ? 'Joining...' : 'Join Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="groupDescription"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your group (optional)"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewGroup({ name: '', description: '' })
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newGroup.name.trim()}
                  className="flex-1 btn-primary"
                >
                  {isCreating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 