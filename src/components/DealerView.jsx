import { useState, useEffect } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { usePlates } from '../contexts/PlateContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { PlateCard } from './PlateCard.jsx';
import { CategoryFilter } from './CategoryFilter.jsx';
import { Pagination } from './Pagination.jsx';

const ITEMS_PER_PAGE = 9;

export function DealerView() {
  const { searchPlates, plates, loading, error } = usePlates();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Carplates');
  const [currentPage, setCurrentPage] = useState(1);
  const [allResults, setAllResults] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [allCopied, setAllCopied] = useState(false);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load initial results
  useEffect(() => {
    if (isAuthenticated) {
      const loadInitialResults = async () => {
        const results = await searchPlates('', 'All Carplates');
        setAllResults(results);
      };
      loadInitialResults();
    }
  }, [isAuthenticated, searchPlates]);

  // Update results when search or category changes
  useEffect(() => {
    if (isAuthenticated) {
      const updateResults = async () => {
        const results = await searchPlates(searchQuery, activeCategory);
        setAllResults(results);
        setCurrentPage(1);
      };
      updateResults();
    }
  }, [searchQuery, activeCategory, isAuthenticated, searchPlates]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (plate, id) => {
    const textToCopy = plate.isReserved ? `${plate.plateNumber} - Reserved` : `${plate.plateNumber} - RM ${plate.price.toLocaleString()}`;
    
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {
          // Fallback to legacy method
          copyTextFallback(textToCopy, id);
        });
    } else {
      // Use fallback method directly
      copyTextFallback(textToCopy, id);
    }
  };

  const copyTextFallback = (text, id) => {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      
      // Select and copy the text
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        if (id) {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        } else {
          setAllCopied(true);
          setTimeout(() => setAllCopied(false), 2000);
        }
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleCopyAll = () => {
    const allPlateText = availableResults
      .map(plate => plate.isReserved ? `${plate.plateNumber} - Reserved` : `${plate.plateNumber} - RM ${plate.price.toLocaleString()}`)
      .join('\n');
    
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(allPlateText)
        .then(() => {
          setAllCopied(true);
          setTimeout(() => setAllCopied(false), 2000);
        })
        .catch(() => {
          // Fallback to legacy method
          copyTextFallback(allPlateText, null);
        });
    } else {
      // Use fallback method directly
      copyTextFallback(allPlateText, null);
    }
  };

  const availablePlatesCount = plates.filter(p => !p.isSold).length;
  
  // Ensure allResults is always an array; show only available plates in catalog
  const safeResults = Array.isArray(allResults) ? allResults : [];
  const availableResults = safeResults.filter(p => !p.isSold);
  
  // Pagination calculations (based on available plates only)
  const totalPages = Math.ceil(availableResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResults = availableResults.slice(startIndex, endIndex);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-sm sm:text-base text-gray-500">Loading plates...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-sm sm:text-base text-red-600 mb-2">Error loading plates: {error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Make sure the backend is running at http://localhost:5000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Dealer Portal
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          View and copy plate information for your customers
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl relative mb-6 sm:mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search available plates..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          totalCount={availablePlatesCount}
        />
      </div>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm sm:text-base text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, availableResults.length)} of {availableResults.length} {availableResults.length === 1 ? 'plate' : 'plates'}
          {activeCategory !== 'All Carplates' && ` in ${activeCategory}`}
        </p>
        {availableResults.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base"
            title="Copy all plate information"
          >
            {allCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copied All!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All Plates
              </>
            )}
          </button>
        )}
      </div>

      {/* Plate Grid */}
      {paginatedResults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedResults.map((plate) => (
              <div key={plate.id} className="relative">
                <PlateCard plate={plate} role="dealer" />
                <button
                  onClick={() => handleCopy(plate, plate.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                  title="Copy plate info"
                >
                  {copiedId === plate.id ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
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
