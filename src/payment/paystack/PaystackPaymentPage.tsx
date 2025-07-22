import React, { useEffect, useState } from 'react'
import PaystackDemoButton from './PaystackDemoButton'

// You can replace this with your actual user context/store
const dummyUser = {
  email: 'owenmannuu9@gmail.com',
}

const dummyAmount = 1000 // Replace with actual cart/checkout amount

const PaystackPaymentPage: React.FC = () => {
  const [location, setLocation] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('selectedLocation')
    if (stored) {
      setLocation(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">Payment</h2>
      {location && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Delivery Details</h3>
          <p className="text-gray-700">County: <span className="font-bold">{location.county}</span></p>
          <p className="text-gray-700">Locality: <span className="font-bold">{location.locality}</span></p>
          <p className="text-gray-700">Area: <span className="font-bold">{location.area}</span></p>
          <p className="text-gray-700">Shipping Address: <span className="font-bold">{location.shippingAddress}</span></p>
        </div>
      )}
      <div className="mb-8 text-center">
        <p className="text-lg font-semibold text-gray-800 mb-2">Amount to Pay:</p>
        <p className="text-2xl font-bold text-green-600 mb-4">KSH {dummyAmount}</p>
        {/* Replace dummyUser.email and dummyAmount with real data as needed */}
        <PaystackDemoButton email={dummyUser.email} amount={dummyAmount} />
      </div>
    </div>
  )
}

export default PaystackPaymentPage 