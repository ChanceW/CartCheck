'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Users, List, LogOut, ShoppingCart } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { formatDate } from '@/lib/utils'

interface Group {
  id: string
  name: string
  description?: string
  _count: {
    members: number
    shoppingLists: number
  }
  shoppingLists: Array<{
    id: string
    name: string
    isCompleted: boolean
  }>
}

interface RecentShoppingList {
  id: string
  name: string
  description?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  group: {
    id: string
    name: string
  }
  itemsCount: number
  completedItemsCount: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [recentLists, setRecentLists] = useState<RecentShoppingList[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [isLoadingRecentLists, setIsLoadingRecentLists] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups()
      fetchRecentLists()
    }
  }, [session])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setIsLoadingGroups(false)
    }
  }

  const fetchRecentLists = async () => {
    try {
      const response = await fetch('/api/shopping-lists/recent?limit=3')
      if (response.ok) {
        const data = await response.json()
        setRecentLists(data.recentLists)
      }
    } catch (error) {
      console.error('Error fetching recent lists:', error)
    } finally {
      setIsLoadingRecentLists(false)
    }
  }

  if (status === 'loading') {
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/dashboard" />
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your shopping lists and groups from here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/groups')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold">Create Shopping List</h3>
            </div>
            <p className="text-gray-600">
              Start a new shopping list for your next trip to the store.
            </p>
          </div>

          <div 
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/groups')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-accent" />
              <h3 className="text-xl font-semibold">Manage Groups</h3>
            </div>
            <p className="text-gray-600">
              View your groups, join new ones, or create a group with friends or family.
            </p>
          </div>

          <div 
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/shopping-lists')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <List className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold">View All Lists</h3>
            </div>
            <p className="text-gray-600">
              See all your shopping lists and check what needs to be done.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Shopping Lists</h2>
              <button
                onClick={() => router.push('/shopping-lists')}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View All
              </button>
            </div>
            {isLoadingRecentLists ? (
              <div className="text-center py-8">
                <div className="animate-pulse space-y-3">
                  <div className="bg-gray-200 h-16 rounded-lg"></div>
                  <div className="bg-gray-200 h-16 rounded-lg"></div>
                </div>
              </div>
            ) : recentLists.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No shopping lists yet</p>
                <button
                  onClick={() => router.push('/groups')}
                  className="btn-primary text-sm"
                >
                  Create Your First List
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLists.map((list) => (
                  <div 
                    key={list.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/shopping-lists/${list.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{list.name}</h4>
                        <span className="text-xs text-gray-500">• {list.group.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {list.itemsCount > 0 
                          ? `${list.completedItemsCount}/${list.itemsCount} items completed` 
                          : 'No items yet'
                        } • Updated {formatDate(list.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {list.itemsCount > 0 && (
                        <div className="w-8 h-8 relative">
                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="3"
                              strokeDasharray={`${(list.completedItemsCount / list.itemsCount) * 100}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600">
                            {Math.round((list.completedItemsCount / list.itemsCount) * 100)}%
                          </div>
                        </div>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        list.isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {list.isCompleted ? 'Completed' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Groups</h2>
              <button
                onClick={() => router.push('/groups')}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View All
              </button>
            </div>
            {isLoadingGroups ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No groups yet</p>
                <button
                  onClick={() => router.push('/groups')}
                  className="btn-primary text-sm"
                >
                  Join or Create Group
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 3).map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                      <p className="text-sm text-gray-600">
                        {group._count.members} members • {group._count.shoppingLists} lists
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/groups/${group.id}`)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                ))}
                {groups.length > 3 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => router.push('/groups')}
                      className="text-gray-500 hover:text-primary text-sm"
                    >
                      +{groups.length - 3} more groups
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