'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Calendar, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react'
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
  group: {
    id: string
    name: string
  }
  itemsCount: number
  completedItemsCount: number
}

type FilterType = 'all' | 'active' | 'completed'

export default function AllShoppingListsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([])
  const [filteredLists, setFilteredLists] = useState<ShoppingList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchShoppingLists()
    }
  }, [session])

  useEffect(() => {
    filterLists()
  }, [shoppingLists, filter])

  const fetchShoppingLists = async () => {
    try {
      const response = await fetch('/api/shopping-lists/recent?limit=100')
      if (response.ok) {
        const data = await response.json()
        setShoppingLists(data.recentLists)
      } else {
        toast.error('Failed to fetch shopping lists')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const filterLists = () => {
    let filtered = shoppingLists
    
    switch (filter) {
      case 'active':
        filtered = shoppingLists.filter(list => !list.isCompleted)
        break
      case 'completed':
        filtered = shoppingLists.filter(list => list.isCompleted)
        break
      default:
        filtered = shoppingLists
    }
    
    setFilteredLists(filtered)
  }

  const getProgress = (list: ShoppingList) => {
    if (list.itemsCount === 0) return 0
    return Math.round((list.completedItemsCount / list.itemsCount) * 100)
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
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
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
            <h1 className="text-3xl font-bold text-gray-900">All Shopping Lists</h1>
            <p className="text-gray-600 mt-2">
              {filteredLists.length} lists across all your groups
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="input-field text-sm"
              >
                <option value="all">All Lists</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {filteredLists.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No shopping lists yet' : `No ${filter} lists`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Create your first shopping list to get started' 
                : `You don't have any ${filter} shopping lists`
              }
            </p>
            <button
              onClick={() => router.push('/groups')}
              className="btn-primary"
            >
              {filter === 'all' ? 'Create First List' : 'View All Lists'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => {
              const progress = getProgress(list)
              
              return (
                <div 
                  key={list.id} 
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/shopping-lists/${list.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{list.name}</h3>
                      {list.description && (
                        <p className="text-gray-600 text-sm mb-2">{list.description}</p>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Group: {list.group.name}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(list.isCompleted)}`}>
                      {list.isCompleted ? 'Completed' : 'Active'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Items</span>
                      <span className="font-medium">{list.itemsCount}</span>
                    </div>
                    
                    {list.itemsCount > 0 && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{list.completedItemsCount}/{list.itemsCount}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-center text-sm text-gray-600">
                          {progress}% complete
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {formatDate(list.updatedAt)}</span>
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
    </div>
  )
} 