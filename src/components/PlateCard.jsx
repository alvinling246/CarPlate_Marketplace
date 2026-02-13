export function PlateCard({ plate, role }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      {/* Plate Visual */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 sm:p-6">
        <div className="bg-white rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-center">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">MALAYSIA</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono tracking-wider">
            {plate.plateNumber}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 sm:p-4">
        {plate.category && (
          <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-full mb-2 sm:mb-3">
            {plate.category}
          </span>
        )}

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Price</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              RM {plate.price.toLocaleString()}
            </p>
          </div>
        </div>

        {role === 'dealer' && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <p className="text-xs sm:text-sm text-gray-600">
              Added: {plate.addedDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
