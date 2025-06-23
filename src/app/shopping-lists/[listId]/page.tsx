'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Edit3, 
  Trash2, 
  DollarSign,
  Hash,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'
import { formatDate } from '@/lib/utils'

interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit?: string
  notes?: string
  isCompleted: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  estimatedPrice?: number
  actualPrice?: number
  createdAt: string
  updatedAt: string
}

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
  items: ShoppingItem[]
  _count: {
    items: number
  }
}

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'text-gray-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-blue-500' },
  { value: 'HIGH', label: 'High', color: 'text-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-500' }
]

const CATEGORIES = [
  'Groceries', 'Dairy', 'Meat', 'Produce', 'Bakery', 'Frozen', 
  'Household', 'Personal Care', 'Electronics', 'Clothing', 'Other'
]

export default function ShoppingListDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const listId = params.listId as string
  
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    notes: '',
    priority: 'MEDIUM' as const,
    category: '',
    estimatedPrice: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.id && listId) {
      fetchShoppingList()
    }
  }, [session, listId])

  const fetchShoppingList = async () => {
    try {
      const response = await fetch(`/api/shopping-lists/${listId}`)
      if (response.ok) {
        const data = await response.json()
        setShoppingList(data.shoppingList)
      } else {
        const error = await response.json()
        toast.error(error.message)
        if (response.status === 404) {
          router.push('/groups')
        }
      }
    } catch (error) {
      toast.error('Failed to fetch shopping list')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.name.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/shopping-lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          estimatedPrice: newItem.estimatedPrice ? parseFloat(newItem.estimatedPrice) : null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Item added successfully!')
        setShowAddModal(false)
        setNewItem({
          name: '',
          quantity: 1,
          unit: '',
          notes: '',
          priority: 'MEDIUM',
          category: '',
          estimatedPrice: ''
        })
        fetchShoppingList()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleComplete = async (item: ShoppingItem) => {
    try {
      const response = await fetch(`/api/shopping-items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !item.isCompleted
        }),
      })

      if (response.ok) {
        fetchShoppingList()
      } else {
        toast.error('Failed to update item')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/shopping-items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Item deleted successfully!')
        fetchShoppingList()
      } else {
        const error = await response.json()
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'HIGH':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'MEDIUM':
        return <Circle className="w-4 h-4 text-blue-500" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getProgress = () => {
    if (!shoppingList || shoppingList.items.length === 0) {
      return { completed: 0, total: 0, percentage: 0 }
    }
    
    const completed = shoppingList.items.filter(item => item.isCompleted).length
    const total = shoppingList.items.length
    const percentage = Math.round((completed / total) * 100)
    
    return { completed, total, percentage }
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

  if (!session || !shoppingList) return null

  const progress = getProgress()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/groups/${shoppingList.group.id}/shopping-lists`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Lists</span>
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
        <div className="card mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{shoppingList.name}</h1>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  shoppingList.isCompleted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {shoppingList.isCompleted ? 'Completed' : 'Active'}
                </span>
              </div>
              {shoppingList.description && (
                <p className="text-gray-600 mb-4">{shoppingList.description}</p>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Group: {shoppingList.group.name}</span>
                <span>Updated {formatDate(new Date(shoppingList.updatedAt))}</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Progress</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {progress.completed}/{progress.total}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress.percentage}% complete</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Items ({shoppingList.items.length})</h2>
          
          {shoppingList.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-600 mb-6">Add your first item to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {shoppingList.items.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center space-x-4 p-4 border rounded-lg transition-all ${
                    item.isCompleted 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-300 hover:border-primary'
                  }`}
                >
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                      item.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {item.isCompleted && <Check className="w-3 h-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className={`font-medium ${
                        item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </h4>
                      {getPriorityIcon(item.priority)}
                      {item.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>Qty: {item.quantity}{item.unit && ` ${item.unit}`}</span>
                      {item.estimatedPrice && (
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${item.estimatedPrice.toFixed(2)}</span>
                        </span>
                      )}
                    </div>
                    
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                  className="input-field"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="lbs, oz, etc."
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="input-field"
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.estimatedPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, estimatedPrice: e.target.value }))}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewItem({
                      name: '',
                      quantity: 1,
                      unit: '',
                      notes: '',
                      priority: 'MEDIUM',
                      category: '',
                      estimatedPrice: ''
                    })
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newItem.name.trim()}
                  className="flex-1 btn-primary"
                >
                  {isSubmitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 