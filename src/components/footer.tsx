

export default function Footer() {
  return (
    <footer className="bg-green-50 text-gray-700 py-8 mt-12 border-t border-green-100">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Info Row: Category, Location, Contact */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">
          {/* Category Section */}
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-lg text-green-700 mb-4">Category</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="font-medium border-b border-green-100 pb-2 mb-2">Stay up to date</p>
                <p className="text-sm">info@olivegroceries.com</p>
              </div>
              <div>
                <p className="font-medium border-b border-green-100 pb-2 mb-2">Weekly Specials</p>
              </div>
              <div>
                <p className="font-medium border-b border-green-100 pb-2 mb-2">FAQ</p>
                <p className="text-sm">Terms of Service</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-lg text-green-700 mb-2">Location</h3>
            <p className="font-semibold">Olive Groceries - Fresh Market <span className="text-green-600"># New Open</span></p>
            <p className="text-sm">4th Street Plaza</p>
            <p className="text-sm">2nd floor (parking available)</p>
            <p className="text-sm">03/07/2023</p>
            {/* <p className="font-medium mt-2">Contact Us</p> */}
          </div>

          {/* Contact Info */}
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-lg text-green-700 mb-2">Contact Information</h3>
            <ul className="space-y-1 text-sm">
              <li><span className="font-semibold">Email:</span> info@olivegroceries.com</li>
              <li><span className="font-semibold">Phone:</span> +254712345678</li>
              <li><span className="font-semibold">Address:</span> 123 Street, Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        {/* Copyright and Note */}
        <div className="pt-4 border-t border-green-100 text-center text-xs text-gray-500">
          <p className="italic mb-1">Olive Groceries, the best for all your grocery needs</p>
          <p>&copy; {new Date().getFullYear()} Olive Groceries - Fresh Market Applications</p>
        </div>
      </div>
    </footer>
  );
}