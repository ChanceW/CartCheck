import Link from 'next/link'
import { Users, CheckCircle, Star } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/10">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo href="/" />
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/signin" 
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Shopping Lists for
            <span className="text-primary"> Groups</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Organize your shopping needs with friends and family. Create shared lists, 
            track prices, and never forget an item again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
              Start Shopping Smart
            </Link>
            <Link href="/auth/signin" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Group Collaboration</h3>
            <p className="text-gray-600">
              Share shopping lists with family and friends. Everyone can add items and check them off in real-time.
            </p>
          </div>
          <div className="card text-center">
            <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
            <p className="text-gray-600">
              Categorize items, set priorities, and track estimated vs actual prices for better budgeting.
            </p>
          </div>
          <div className="card text-center">
            <Star className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Feature Rich</h3>
            <p className="text-gray-600">
              Add notes, quantities, units, and more. Get insights into your shopping patterns.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of families making shopping easier together.
          </p>
          <Link href="/auth/signup" className="bg-accent hover:bg-accent-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Create Your First List
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 CartCheck. Making shopping lists smarter.</p>
        </div>
      </footer>
    </div>
  )
} 