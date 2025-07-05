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
    <div className="min-h-screen bg-white py-10 px-4 md:px-20 text-blue-900">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { icon: <FaMapMarkerAlt />, title: 'Address', value: '123 Street New York, USA' },
          { icon: <FaEnvelope />, title: 'Mail Us', value: 'info@example.com' },
          { icon: <FaPhone />, title: 'Telephone', value: '(+012) 3456 7890' },
          { icon: <FaGlobe />, title: 'Yoursite@ex.com', value: '(+012) 3456 7890' },
        ].map((item, index) => (
          <div key={index} className="bg-gray-100 p-6 rounded-lg text-center shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-600 text-white rounded-full flex items-center justify-center text-xl">
              {item.icon}
            </div>
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-sm mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Form */}
        <div className="bg-gray-300 text-white p-6 rounded-lg lg:col-span-2 shadow">
          <h2 className="text-2xl font-bold mb-6 text-blue-500">Send Your Message</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-3 rounded-md text-black bg-amber-50" placeholder="Your Name" />
            <input className="p-3 rounded-md text-black bg-amber-50" placeholder="Your Email" />
            <input className="p-3 rounded-md text-black bg-amber-50" placeholder="Your Phone" />
            <input className="p-3 rounded-md text-black bg-amber-50" placeholder="Your Project" />
            <input className="p-3 rounded-md text-black bg-amber-50 col-span-2" placeholder="Subject" />
            <textarea
              className="p-3 rounded-md text-black bg-amber-50   col-span-2"
              rows={4}
              placeholder="Message"
            ></textarea>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md mt-2 hover:bg-red-700 col-span-2 w-fit">
              Send Message
            </button>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Social Icons */}
          <div className="flex flex-col items-start space-y-4">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
              >
                <Icon />
              </div>
            ))}
          </div>

          {/* Branch Cards */}
          {['Our Branch 01', 'Our Branch 02'].map((branch, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-lg mb-2">{branch}</h4>
              <p className="text-sm mb-1">
                <span className="font-bold text-red-600">Address:</span>{' '}
                <span className="ml-1">123 Street New York, USA</span>
              </p>
              <p className="text-sm">
                <span className="font-bold text-red-600">Telephone:</span>{' '}
                <span className="ml-1">(+012) 3456 7890</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
