import { useState } from 'react';
import { Search } from 'lucide-react';
import { usePlates } from '../contexts/PlateContext';
import { PlateCard } from './PlateCard';
import { CategoryFilter } from './CategoryFilter';
import { Pagination } from './Pagination';
import { PlateCategory } from '../types/plate';

const ITEMS_PER_PAGE = 9;

export function UserView() {
  const { searchPlates, plates } = usePlates();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PlateCategory | 'All Carplates'>('All Carplates');
  const [currentPage, setCurrentPage] = useState(1);
  const [allResults, setAllResults] = useState(() => searchPlates('', 'All Carplates'));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = searchPlates(query, activeCategory);
    setAllResults(results);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: PlateCategory | 'All Carplates') => {
    setActiveCategory(category);
    const results = searchPlates(searchQuery, category);
    setAllResults(results);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availablePlatesCount = plates.filter(p => !p.isSold).length;
  
  // Pagination calculations
  const totalPages = Math.ceil(allResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResults = allResults.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Find Your Perfect Number Plate
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Browse our collection of premium Malaysian number plates
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-6 sm:mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plate number..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          totalCount={availablePlatesCount}
        />
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm sm:text-base text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, allResults.length)} of {allResults.length} {allResults.length === 1 ? 'plate' : 'plates'}
          {activeCategory !== 'All Carplates' && ` in ${activeCategory}`}
        </p>
      </div>

      {/* Plate Grid */}
      {paginatedResults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedResults.map((plate) => (
              <PlateCard key={plate.id} plate={plate} role="user" />
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm sm:text-base text-gray-500">No plates found matching your search.</p>
        </div>
      )}
    </div>
  );
}