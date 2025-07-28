import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cartStore'
import { useNavigate } from '@tanstack/react-router'
import { getAllProducts } from '@/api/products'
import type { TProduct } from '@/api/products'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

// Simple placeholder for knowledge base search
const useKnowledgeBase = () => {
  return {
    search: (_query: string) => '',
    isLoaded: true,
    error: null,
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  kbContent?: string
}

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<TProduct[]>([])
  const { addToCart } = useCartStore()
  const navigate = useNavigate()
  const { search } = useKnowledgeBase()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // AI logic: parse user input for actions
  const handleAIAction = async (userInput: string) => {
    // Procedure for ordering items
    if (
      /how (do i|to) order|order items|place an order|buy from olive groceries|order from olive groceries/i.test(
        userInput,
      )
    ) {
      return (
        `Here's how to order items using Olive Groceries:\n\n` +
        `1. **Browse Products:** Go to the Products page to view available items.\n` +
        `2. **Add to Cart:** Click 'Add to Cart' on the products you want to buy.\n` +
        `3. **View Cart:** Click the cart icon or ask me to "show me the cart" to review your selected items.\n` +
        `4. **Proceed to Checkout:** Click 'Checkout' in your cart.\n` +
        `5. **Select Pick-Up Station:** Choose your preferred pick-up location and enter your shipping address.\n` +
        `6. **Make Payment:** Complete your order by paying securely on the payment page.\n` +
        `7. **Order Confirmation:** You will receive a confirmation and can track your order status.\n\n` +
        `If you need help at any step, just ask me!`
      )
    }
    // Add to cart: "add [product name] to cart"
    const addMatch = userInput.match(/add (.+) to cart/i)
    if (addMatch) {
      const name = addMatch[1].toLowerCase()
      const product = products.find((p) =>
        p.product_name.toLowerCase().includes(name),
      )
      if (product) {
        addToCart({
          id: product.id,
          product_name: product.product_name,
          price: product.price,
          imageUrl: product.imageUrl || product.image,
        })
        toast.success(`${product.product_name} added to cart!`)
        return `I have added **${product.product_name}** to your cart.`
      } else {
        return `Sorry, I couldn't find a product named "${name}".`
      }
    }
    // Navigation to any main page
    const pageRoutes: Record<string, string> = {
      products: '/products',
      cart: '/products/cart',
      dashboard: '/dashboard',
      testimonials: '/testimonials',
      signin: '/signin',
      login: '/login',
      contact: '/contact',
      about: '/about',
    }
    const navMatch = userInput.match(
      /(?:go to|open|show me|take me to) ([\w- ]+)/i,
    )
    if (navMatch) {
      const page = navMatch[1].trim().toLowerCase()
      const route = pageRoutes[page]
      if (route) {
        navigate({ to: route })
        return `Navigating you to the **${page}** page.`
      } else {
        return `Sorry, I couldn't find a page called "${page}".`
      }
    }
    // Check product availability: "do you have [product]", "is [product] available", "can I buy [product]"
    const availabilityMatch = userInput.match(
      /(?:do you have|is|can I buy)\s+([\w\s-]+)\??/i,
    )
    if (availabilityMatch) {
      const name = availabilityMatch[1].toLowerCase().trim()
      const product = products.find((p) =>
        p.product_name.toLowerCase().includes(name),
      )
      if (product) {
        if (product.quantity && product.quantity > 0) {
          return `Yes, we have **${product.product_name}** in stock!`
        } else {
          return `Sorry, **${product.product_name}** is currently out of stock.`
        }
      } else {
        return `Sorry, we do not have "${name}" in our store right now.`
      }
    }
    // Go to locations: "choose pick up station" or "go to locations"
    if (/pick\s*up station|go to locations?/i.test(userInput)) {
      navigate({ to: '/locations/locations' })
      return `Redirecting you to the pick-up station selection page.`
    }
    // Go to payment: "checkout" or "go to payment"
    if (/checkout|go to payment|pay now/i.test(userInput)) {
      navigate({ to: '/payment/paystack' })
      return `Taking you to the payment page.`
    }
    // Fallback: echo or use knowledge base
    const kbContent = search(userInput)
    if (kbContent) {
      return `Here's what I found: ${kbContent}`
    }
    return `I'm here to help! You can ask me to add products to your cart, check if a product is available, navigate to any page, choose a pick-up station, or proceed to payment.`
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    try {
      const aiContent = await handleAIAction(input)
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (e) {
      toast.error('AI error.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // THEME: orange/green/white, rounded, shadow, soft UI
  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 flex items-center justify-center z-50"
        aria-label="Open AI Chat"
      >
        <span className="text-2xl">🤖</span>
      </button>
      {/* Chat Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay with blur (no dark background) */}
          <div
            className="absolute inset-0 backdrop-blur-sm transition-all duration-300"
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent' }}
          />
          {/* Sidebar */}
          <div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white rounded-l-xl shadow-2xl flex flex-col border-l border-orange-200 animate-slideInSidebar"
            style={{ width: '100%', maxWidth: 400 }}
          >
            {/* Header */}
            <div className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between rounded-tl-xl">
              <span className="font-bold text-lg flex items-center gap-2">
                <span className="text-2xl">🤖</span> Olive AI Assistant
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-orange-200 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 bg-green-50"
              style={{ minHeight: 300 }}
            >
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <span className="text-4xl">👋</span>
                  <p className="mt-2">
                    Hi! I can help you shop, add items to your cart, and guide
                    you through checkout.
                  </p>
                  <p className="text-sm mt-2">
                    Try: <span className="italic">Add apples to cart</span> or{' '}
                    <span className="italic">Go to checkout</span>
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${
                      message.role === 'user'
                        ? 'bg-orange-100 text-right text-orange-900'
                        : 'bg-white text-left text-green-900 border border-green-200'
                    }`}
                  >
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {message.content}
                    </ReactMarkdown>
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-white border border-green-200 text-green-900 shadow-sm">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <div className="border-t bg-white px-4 py-3 flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
          {/* Sidebar slide-in animation */}
          <style>{`
            @keyframes slideInSidebar {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .animate-slideInSidebar {
              animation: slideInSidebar 0.35s cubic-bezier(0.4,0,0.2,1);
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default ChatInterface
