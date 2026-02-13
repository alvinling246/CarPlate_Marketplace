const categories = [
  'All Carplates',
  '2 DIGIT',
  '3 DIGIT',
  '4 DIGIT',
  'CLASSIC',
  'GOLDEN NUMBER',
  'OFFER',
];

const getCategoryColor = (category, isActive) => {
  if (!isActive) {
    return 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200';
  }
  
  switch (category) {
    case 'All Carplates':
      return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-red-600';
    case '2 DIGIT':
      return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-purple-600';
    case '3 DIGIT':
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-blue-600';
    case '4 DIGIT':
      return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg border-cyan-600';
    case 'CLASSIC':
      return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg border-amber-600';
    case 'GOLDEN NUMBER':
      return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg border-yellow-500';
    case 'OFFER':
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-green-600';
    default:
      return 'bg-white text-gray-700 border border-gray-200';
  }
};

export function CategoryFilter({ activeCategory, onCategoryChange, totalCount }) {
  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-lg whitespace-nowrap transition-all text-sm sm:text-base font-semibold border ${getCategoryColor(category, activeCategory === category)}`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Total Count */}
      <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-red-500 to-red-600 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs">📋</span>
        </div>
        <span>
          <span className="font-bold text-base sm:text-lg">{totalCount}</span> carplates in the system
        </span>
      </div>
    </div>
  );
}
