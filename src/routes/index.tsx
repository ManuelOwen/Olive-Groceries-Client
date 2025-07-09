import { createFileRoute, Link } from '@tanstack/react-router'
import bg from "@/images/family-father-mother-daughter-grocery-shopping-supermarket_iStock-1436468416.jpg"

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Content Layer */}
      <div className="relative z-10 text-white flex flex-col min-h-screen">
        
       

        {/* Hero Section */}
        <section className="flex-grow flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold italic text-purple-200 drop-shadow mb-4">
            We Grow, Store And Deliver To Your Door Step
          </h2>
          <p className="text-2xl md:text-3xl font-bold italic text-pink-300 drop-shadow mb-8">
            Enjoy The Best Fresh Groceries
          </p>

          <div className=" bg-opacity-90 p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-4">
            <button className="bg-white text-orange-500 px-6 py-3 rounded font-semibold italic hover:bg-gray-300">
              <Link to="/signin">Create an Account</Link>
            </button>
            <button className="bg-white text-orange-500 px-8 py-3 rounded font-semibold italic hover:bg-gray-300">
              <Link to="/products">Proceed To order with us</Link>
            </button>
          </div>

          {/* Why Choose Us Section - Centered */}
          <div className="flex justify-center mt-12 mb-8 px-4">
            <div className="bg-white/10 backdrop-blur-sm bg-opacity-90 p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-white">Why Choose Us?</h3>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Wide selection of fresh groceries
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Convenient online ordering
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Fast and reliable delivery
                </li>
              </ul>
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer className="text-center py-12 mt-auto text-sm text-white">
          <p className="italic mb-1">Safe and Efficient Way to get your Groceries</p>
          <p>Info@Olivegroceries.com</p>
          <p>+254712345678</p>
        </footer>
      </div>
    </div>
  )
}
