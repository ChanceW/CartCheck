'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, ShoppingCart, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'
import { formatDate } from '@/lib/utils'

interface ShoppingList {
  id: string
  name: string
  description?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    name: string
    isCompleted: boolean
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }>
  _count: {
    items: number
  }
}

interface Group {
  id: string
  name: string
}

export default function GroupShoppingListsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const groupId = params.groupId as string
  
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([])
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newList, setNewList] = useState({ name: '', description: '' })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.id && groupId) {
      fetchShoppingLists()
      fetchGroupInfo()
    }
  }, [session, groupId])

  const fetchShoppingLists = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/shopping-lists`)
      if (response.ok) {
        const data = await response.json()
        setShoppingLists(data.shoppingLists)
      } else {
        const error = await response.json()
        toast.error(error.message)
        if (response.status === 403) {
          router.push('/groups')
        }
      }
    } catch (error) {
      toast.error('Failed to fetch shopping lists')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGroupInfo = async () => {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        const foundGroup = data.groups.find((g: any) => g.id === groupId)
        if (foundGroup) {
          setGroup({ id: foundGroup.id, name: foundGroup.name })
        }
      }
    } catch (error) {
      console.error('Error fetching group info:', error)
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newList.name.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/shopping-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newList),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Shopping list created successfully!')
        setShowCreateModal(false)
        setNewList({ name: '', description: '' })
        fetchShoppingLists()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  const getItemsProgress = (list: ShoppingList) => {
    if (list._count.items === 0) return { completed: 0, total: 0, percentage: 0 }
    const completed = list.items.filter(item => item.isCompleted).length
    const total = list._count.items
    const percentage = Math.round((completed / total) * 100)
    return { completed, total, percentage }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertTriangle className="w-3 h-3 text-red-500" />
      case 'HIGH':
        return <Clock className="w-3 h-3 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusColor = (isCompleted: boolean) => {
    return isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/groups/${groupId}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Group</span>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shopping Lists
            </h1>
            {group && (
              <p className="text-gray-600 mt-2">
                {group.name} • {shoppingLists.length} lists
              </p>
            )}
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create List</span>
          </button>
        </div>

        {shoppingLists.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shopping lists yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first shopping list to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create First List
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoppingLists.map((list) => {
              const progress = getItemsProgress(list)
              const hasHighPriority = list.items.some(item => 
                !item.isCompleted && (item.priority === 'HIGH' || item.priority === 'URGENT')
              )
              
              return (
                <div 
                  key={list.id} 
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/shopping-lists/${list.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900">{list.name}</h3>
                        {hasHighPriority && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      {list.description && (
                        <p className="text-gray-600 text-sm mb-3">{list.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(list.isCompleted)}`}>
                      {list.isCompleted ? 'Completed' : 'Active'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Items</span>
                      <span className="font-medium">{progress.total}</span>
                    </div>
                    
                    {progress.total > 0 && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progress.completed}/{progress.total}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-center text-sm text-gray-600">
                          {progress.percentage}% complete
                        </div>
                      </>
                    )}
                  </div>

                  {/* Recent High Priority Items */}
                  {list.items.some(item => !item.isCompleted && (item.priority === 'HIGH' || item.priority === 'URGENT')) && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-2">High Priority Items:</p>
                      <div className="space-y-1">
                        {list.items
                          .filter(item => !item.isCompleted && (item.priority === 'HIGH' || item.priority === 'URGENT'))
                          .slice(0, 2)
                          .map((item) => (
                            <div key={item.id} className="flex items-center space-x-2 text-sm">
                              {getPriorityIcon(item.priority)}
                              <span className="text-gray-700 truncate">{item.name}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {formatDate(new Date(list.updatedAt))}</span>
                    </div>
                    {list.isCompleted && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Complete</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Shopping List</h2>
            <form onSubmit={handleCreateList}>
              <div className="mb-4">
                <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  id="listName"
                  value={newList.name}
                  onChange={(e) => setNewList(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter list name"
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="listDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="listDescription"
                  value={newList.description}
                  onChange={(e) => setNewList(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this shopping list (optional)"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewList({ name: '', description: '' })
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newList.name.trim()}
                  className="flex-1 btn-primary"
                >
                  {isCreating ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 