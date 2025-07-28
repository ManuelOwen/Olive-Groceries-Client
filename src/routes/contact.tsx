import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(
        'https://groceries-api-m1sq.onrender.com/api/v1/nodemailer/contact',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      )
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen flex items-center justify-center">
      <div className="grid md:grid-cols-2 gap-8 w-full">
        {/* Contact Form Section - Now Larger */}
        <div className="bg-white p-8 rounded-lg shadow-xl w-full">
          <h2 className="text-3xl font-bold mb-6 text-orange-400">
            Contact Us
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Your Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                required
                className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-lg transition duration-200 text-lg font-semibold"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'sent' && (
              <div className="text-orange-500 mt-4 text-center text-lg">
                Message sent successfully!
              </div>
            )}
            {status === 'error' && (
              <div className="text-red-600 mt-4 text-center text-lg">
                Failed to send. Please try again.
              </div>
            )}
          </form>
        </div>

        {/* Contact Information Section - Now Larger */}
        <div className="bg-orange-50 p-8 rounded-lg shadow-xl w-full">
          <h3 className="text-3xl font-bold mb-6 text-orange-500">
            Our Information
          </h3>

          <div className="mb-8">
            <h4 className="font-bold text-2xl text-orange-500 mb-4">
              Location
            </h4>
            <p className="text-xl font-semibold mb-2">
              Olive Groceries - Fresh Market{' '}
              <span className="text-orange-500"># New Open</span>
            </p>
            <p className="text-lg">4th Street Plaza</p>
            <p className="text-lg">2nd floor (parking available)</p>
            <p className="text-lg mt-4">Mon-Sun: 8AM-9PM</p>
          </div>

          <div className="mb-8">
            <h4 className="font-bold text-2xl text-orange-500 mb-4">
              Contact Details
            </h4>
            <ul className="space-y-4 text-lg">
              <li className="flex items-start">
                <span className="font-semibold mr-3">Email:</span>
                <span>info@olivegroceries.com</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3">Phone:</span>
                <span>+254712345678</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3">Address:</span>
                <span>123 Street, Nairobi, Kenya</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t-2 border-orange-200">
            <h4 className="font-bold text-2xl text-orange-500 mb-4">
              Stay Connected
            </h4>
            <p className="text-lg mb-4">
              Follow us on social media for updates and special offers
            </p>
            <div className="flex space-x-6">
              {/* Social media icons would go here */}
              <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">f</span>
              </div>
              <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">t</span>
              </div>
              <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">i</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
