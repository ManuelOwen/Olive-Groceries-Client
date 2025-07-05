import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/')({
  component: App,
})



function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-orange-400 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
           
          </div>
        </div>
      </header>
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Content goes here */}
          <h1 className="text-3xl font-bold mb-6">Welcome to Olive Groceries</h1>
          <div className='bg-orange-400 .h-3/5 rounded-lg p-6 shadow-md'>
          
          </div>
        </div>
      </main>
    </div>
  )
}
