import { createFileRoute } from '@tanstack/react-router'
import { getCounties, county, search } from 'kenya-locations'

export const Route = createFileRoute('/locations/locations')({
  component: RouteComponent,
})

function RouteComponent() {
  //  get all counties
  const counties = getCounties()
  //  get a specific county by name
  const specificCounty = county('Nairobi')
  //  search for counties by name
  const searchResults = search('Nairobi')

  console.log('Counties:', counties)
  console.log('Specific County:', specificCounty)
  console.log('Search Results:', searchResults)

  return (
    <div>
      {counties.map((county, index) => (
        <div key={index} className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{county.name}</h3>
          <p>Code: {county.code}</p>
          <select>
            <option value={county.code}>{county.name}</option>
          </select>
          <p>Latitude: {county.name}</p>
        </div>
      ))}
    </div>
  )
}
