import { createFileRoute } from '@tanstack/react-router'
import {
  getCounties,
  county,
  search,
  getLocalitiesInCounty,
  getAreasInLocality,
} from 'kenya-locations'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/locations/locations')({
  component: RouteComponent,
})

function RouteComponent() {
  // State for selections
  const [selectedCounty, setSelectedCounty] = useState<string>('')
  const [selectedLocality, setSelectedLocality] = useState<string>('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [shippingAddress, setShippingAddress] = useState<string>('')
  // Removed error state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const navigate = useNavigate()

  // Get all counties
  const counties = getCounties()

  // Get localities for selected county
  let localities: { name: string }[] = []
  if (selectedCounty) {
    try {
      localities = getLocalitiesInCounty(selectedCounty)
    } catch (e: any) {
      localities = []
    }
  }

  // Get areas for selected locality
  let areas: { name: string }[] = []
  if (selectedCounty && selectedLocality) {
    try {
      areas = getAreasInLocality(selectedLocality)
    } catch (e: any) {
      areas = []
    }
  }

  // Handle selection changes
  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCounty(e.target.value)
    setSelectedLocality('')
    setSelectedArea('')
    // Clear validation errors when county changes
    setValidationErrors((prev) => ({
      ...prev,
      county: '',
      locality: '',
      area: '',
    }))
  }
  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocality(e.target.value)
    setSelectedArea('')
    // Clear validation errors when locality changes
    setValidationErrors((prev) => ({
      ...prev,
      locality: '',
      area: '',
    }))
  }
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArea(e.target.value)
    // Clear validation error when area changes
    setValidationErrors((prev) => ({
      ...prev,
      area: '',
    }))
  }

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!selectedCounty.trim()) {
      errors.county = 'Please select a county'
    }

    if (!selectedLocality.trim()) {
      errors.locality = 'Please select a locality'
    }

    if (!selectedArea.trim()) {
      errors.area = 'Please select an area (pick-up station)'
    }

    if (!shippingAddress.trim()) {
      errors.shippingAddress = 'Please enter your shipping address'
    } else if (shippingAddress.trim().length < 10) {
      errors.shippingAddress =
        'Shipping address must be at least 10 characters long'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (validateForm()) {
      // All validations passed
      const locationData = {
        county: selectedCounty,
        locality: selectedLocality,
        area: selectedArea,
        shippingAddress: shippingAddress.trim(),
      }

      // Store location data (you might want to use a global state management solution)
      localStorage.setItem('selectedLocation', JSON.stringify(locationData))

      // Navigate to payment page (not dashboard)
      // You can also use navigation state if you want
      navigate({ to: '/payment/paystack' })
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">
        Choose Your Pick-Up Station
      </h2>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          County
        </label>
        <select
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
            validationErrors.county ? 'border-red-500' : 'border-gray-300'
          }`}
          value={selectedCounty}
          onChange={handleCountyChange}
        >
          <option value="">Select a county</option>
          {counties.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        {validationErrors.county && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.county}</p>
        )}
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Locality
        </label>
        <select
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
            validationErrors.locality ? 'border-red-500' : 'border-gray-300'
          }`}
          value={selectedLocality}
          onChange={handleLocalityChange}
          disabled={!selectedCounty || localities.length === 0}
        >
          <option value="">
            {selectedCounty
              ? localities.length > 0
                ? 'Select a locality'
                : 'No localities found'
              : 'Select a county first'}
          </option>
          {localities.map((l) => (
            <option key={l.name} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        {validationErrors.locality && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.locality}
          </p>
        )}
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Area (Pick-Up Station)
        </label>
        {selectedLocality && areas.length === 0 ? (
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter area (no areas found, please enter manually)"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          />
        ) : (
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={selectedArea}
            onChange={handleAreaChange}
            disabled={!selectedLocality || areas.length === 0}
          >
            <option value="">
              {selectedLocality
                ? areas.length > 0
                  ? 'Select an area'
                  : 'No areas found'
                : 'Select a locality first'}
            </option>
            {areas.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {selectedCounty && selectedLocality && selectedArea && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Selected Pick-Up Station
          </h3>
          <p className="text-gray-700">
            County: <span className="font-bold">{selectedCounty}</span>
          </p>
          <p className="text-gray-700">
            Locality: <span className="font-bold">{selectedLocality}</span>
          </p>
          <p className="text-gray-700">
            Area: <span className="font-bold">{selectedArea}</span>
          </p>
        </div>
      )}
      {/* Shipping Address Input */}
      <div className="mt-8 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shipping Address
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
            validationErrors.shippingAddress
              ? 'border-red-500'
              : 'border-gray-300'
          }`}
          placeholder="Enter your shipping address (minimum 10 characters)"
          value={shippingAddress}
          onChange={(e) => {
            setShippingAddress(e.target.value)
            // Clear validation error when user starts typing
            if (validationErrors.shippingAddress) {
              setValidationErrors((prev) => ({
                ...prev,
                shippingAddress: '',
              }))
            }
          }}
        />
        {validationErrors.shippingAddress && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.shippingAddress}
          </p>
        )}
      </div>
     
     

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 gap-4">
        <button
          type="button"
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          onClick={() => window.history.back()}
        >
          Back
        </button>
        <button
          type="button"
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}
