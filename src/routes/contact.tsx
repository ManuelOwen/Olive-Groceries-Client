import { createFileRoute } from '@tanstack/react-router'
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa'

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-10 px-4 md:px-20 text-gray-900 flex flex-col">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { icon: <FaMapMarkerAlt />, title: 'Address', value: '123 Street, Nairobi, Kenya' },
          { icon: <FaEnvelope />, title: 'Mail Us', value: 'info@olivegroceries.com' },
          { icon: <FaPhone />, title: 'Telephone', value: '+254712345678' },
          { icon: <FaGlobe />, title: 'Website', value: 'www.olivegroceries.com' },
        ].map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl text-center shadow-lg border border-orange-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl shadow">
              {item.icon}
            </div>
            <h3 className="font-semibold text-lg text-orange-700">{item.title}</h3>
            <p className="text-sm mt-1 text-gray-600">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Form */}
        <div className="bg-white/90 text-gray-900 p-8 rounded-2xl lg:col-span-2 shadow-xl border border-orange-100">
          <h2 className="text-2xl font-bold mb-6 text-orange-600">Send Your Message</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-3 rounded-lg border border-gray-200 bg-orange-50 focus:ring-2 focus:ring-orange-400" placeholder="Your Name" />
            <input className="p-3 rounded-lg border border-gray-200 bg-orange-50 focus:ring-2 focus:ring-orange-400" placeholder="Your Email" />
            <input className="p-3 rounded-lg border border-gray-200 bg-orange-50 focus:ring-2 focus:ring-orange-400" placeholder="Your Phone" />
            <input className="p-3 rounded-lg border border-gray-200 bg-orange-50 focus:ring-2 focus:ring-orange-400 col-span-2" placeholder="Subject" />
            <textarea
              className="p-3 rounded-lg border border-gray-200 bg-orange-50 focus:ring-2 focus:ring-orange-400 col-span-2"
              rows={4}
              placeholder="Message"
            ></textarea>
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg mt-2 hover:bg-orange-600 col-span-2 w-fit font-semibold shadow transition">
              Send Message
            </button>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-8">
          {/* Social Icons */}
          <div className="flex flex-row lg:flex-col items-center lg:items-start space-x-4 lg:space-x-0 lg:space-y-4 mb-6">
            {[
              { Icon: FaFacebookF, color: 'bg-blue-600' },
              { Icon: FaTwitter, color: 'bg-blue-400' },
              { Icon: FaInstagram, color: 'bg-pink-500' },
              { Icon: FaLinkedinIn, color: 'bg-blue-700' },
            ].map(({ Icon, color }, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
              >
                <Icon />
              </div>
            ))}
          </div>

          {/* Branch Cards */}
          {[
            {
              name: 'Our Branch - Nairobi',
              address: '123 Street, Nairobi, Kenya',
              phone: '+254712345678',
            },
            {
              name: 'Our Branch - Mombasa',
              address: '456 Avenue, Mombasa, Kenya',
              phone: '+254798765432',
            },
          ].map((branch, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-lg border border-green-100">
              <h4 className="font-semibold text-lg mb-2 text-green-700">{branch.name}</h4>
              <p className="text-sm mb-1">
                <span className="font-bold text-orange-500">Address:</span>{' '}
                <span className="ml-1 text-gray-700">{branch.address}</span>
              </p>
              <p className="text-sm">
                <span className="font-bold text-orange-500">Telephone:</span>{' '}
                <span className="ml-1 text-gray-700">{branch.phone}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm mt-16">
        <p className="italic mb-1">Safe and Efficient Way to get your Groceries</p>
        <p>Info@Olivegroceries.com</p>
        <p>+254712345678</p>
      </footer>
    </div>
  )
}
