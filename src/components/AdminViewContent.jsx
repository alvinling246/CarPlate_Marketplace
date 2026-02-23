import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, CheckCircle, X, Search, ChevronLeft, ChevronRight, LogOut, Users, Trash2 } from 'lucide-react';
import { usePlates } from '../contexts/PlateContext.jsx';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { dealerService } from '../services/dealerService.js';
import { useLocation } from 'react-router';

const PLATES_PER_PAGE = 10;
const CATEGORY_OPTIONS = ['All Categories', '2 DIGIT', '3 DIGIT', '4 DIGIT', 'CLASSIC', 'GOLDEN NUMBER', 'OFFER'];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
];
const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'date_asc', label: 'Date: Oldest first' },
  { value: 'date_desc', label: 'Date: Newest first' },
];

const DEALERS_PER_PAGE = 10;
const DEALER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const DEALER_SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
  { value: 'date_asc', label: 'Date: Oldest first' },
  { value: 'date_desc', label: 'Date: Newest first' },
];

export function AdminViewContent() {
  const { plates, addPlate, updatePrice, markSold } = usePlates();
  const { logout } = useAdminAuth();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDealerModal, setShowAddDealerModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [addDealerError, setAddDealerError] = useState('');
  const [addDealerLoading, setAddDealerLoading] = useState(false);

  // Edit dealer modal state
  const [editingDealer, setEditingDealer] = useState(null);
  const [editDealerForm, setEditDealerForm] = useState({ fullName: '', phoneNumber: '', email: '', username: '', password: '', isActive: true });
  const [editDealerError, setEditDealerError] = useState('');
  const [editDealerLoading, setEditDealerLoading] = useState(false);

  // Dealers page state
  const [dealers, setDealers] = useState([]);
  const [dealersLoading, setDealersLoading] = useState(false);
  const [dealerSearchQuery, setDealerSearchQuery] = useState('');
  const [dealerFilterStatus, setDealerFilterStatus] = useState('all');
  const [dealerSortBy, setDealerSortBy] = useState('date_desc');
  const [dealersCurrentPage, setDealersCurrentPage] = useState(1);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus, filterDate, sortBy]);

  useEffect(() => {
    setDealersCurrentPage(1);
  }, [dealerSearchQuery, dealerFilterStatus, dealerSortBy]);

  const normalizeDealer = (d) => ({
    id: d?.id ?? d?.Id,
    fullName: d?.fullName ?? d?.FullName ?? '',
    phoneNumber: d?.phoneNumber ?? d?.PhoneNumber ?? '',
    email: d?.email ?? d?.Email ?? '',
    username: d?.username ?? d?.Username ?? '',
    isActive: d?.isActive ?? d?.IsActive ?? true,
    createdDate: d?.createdDate ?? d?.CreatedDate ?? '',
    lastLoginDate: d?.lastLoginDate ?? d?.LastLoginDate ?? null,
  });

  // Fetch dealers when on Dealers page
  useEffect(() => {
    if (location.pathname !== '/admin/dealers') return;
    let cancelled = false;
    setDealersLoading(true);
    dealerService
      .getDealers()
      .then((data) => {
        if (!cancelled) {
          const raw = Array.isArray(data) ? data : (data?.dealers ?? []);
          setDealers(raw.map(normalizeDealer));
        }
      })
      .catch(() => {
        if (!cancelled) setDealers([]);
      })
      .finally(() => {
        if (!cancelled) setDealersLoading(false);
      });
    return () => { cancelled = true; };
  }, [location.pathname]);

  const [newPlate, setNewPlate] = useState({
    plateNumber: '',
    price: '',
    category: '2 DIGIT',
  });

  const [newDealer, setNewDealer] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    username: '',
    password: '',
  });
  const [addError, setAddError] = useState('');

  const handleAddPlate = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newPlate.plateNumber || !newPlate.price) return;

    try {
      await addPlate({
        plateNumber: newPlate.plateNumber.toUpperCase(),
        price: parseFloat(newPlate.price),
        isSold: false,
        category: newPlate.category,
      });
      setNewPlate({ plateNumber: '', price: '', category: '2 DIGIT' });
      setShowAddModal(false);
    } catch (err) {
      setAddError(err.message || 'Failed to add plate. Please try again.');
    }
  };

  const handleAddDealer = async (e) => {
    e.preventDefault();
    setAddDealerError('');
    setAddDealerLoading(true);

    if (!newDealer.fullName || !newDealer.phoneNumber || !newDealer.email || !newDealer.username || !newDealer.password) {
      setAddDealerError('All fields are required');
      setAddDealerLoading(false);
      return;
    }

    try {
      await dealerService.addDealer(newDealer);
      setNewDealer({ fullName: '', phoneNumber: '', email: '', username: '', password: '' });
      setShowAddDealerModal(false);
      setAddDealerLoading(false);
      // Refetch dealers when on Dealers page
      if (location.pathname === '/admin/dealers') {
        const data = await dealerService.getDealers();
        const raw = Array.isArray(data) ? data : (data?.dealers ?? []);
        setDealers(raw.map((d) => normalizeDealer(d)));
      }
    } catch (err) {
      setAddDealerError(err.message || 'Failed to add dealer. Please try again.');
      setAddDealerLoading(false);
    }
  };

  const openEditDealerModal = (dealer) => {
    setEditingDealer(dealer);
    setEditDealerForm({
      fullName: dealer.fullName ?? '',
      phoneNumber: dealer.phoneNumber ?? '',
      email: dealer.email ?? '',
      username: dealer.username ?? '',
      password: '',
      isActive: dealer.isActive !== false,
    });
    setEditDealerError('');
  };

  const handleEditDealer = async (e) => {
    e.preventDefault();
    if (!editingDealer) return;
    setEditDealerError('');
    setEditDealerLoading(true);
    const payload = {
      fullName: editDealerForm.fullName.trim(),
      phoneNumber: editDealerForm.phoneNumber.trim(),
      email: editDealerForm.email.trim(),
      username: editDealerForm.username.trim(),
      isActive: editDealerForm.isActive,
    };
    if (editDealerForm.password.trim()) {
      payload.password = editDealerForm.password;
    }
    try {
      await dealerService.updateDealer(editingDealer.id, payload);
      setDealers((prev) =>
        prev.map((d) =>
          d.id === editingDealer.id
            ? { ...d, ...payload, password: undefined }
            : d
        )
      );
      setEditingDealer(null);
      setEditDealerForm({ fullName: '', phoneNumber: '', email: '', username: '', password: '', isActive: true });
    } catch (err) {
      setEditDealerError(err.message || 'Failed to update dealer.');
    } finally {
      setEditDealerLoading(false);
    }
  };

  const handleEditPrice = (plate) => {
    setEditingId(plate.id);
    setEditPrice(plate.price.toString());
  };

  const handleSavePrice = (id) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0) {
      updatePrice(id, price);
    }
    setEditingId(null);
    setEditPrice('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice('');
  };

  // Filtered and sorted plates for table (search + category + status + date, then sort)
  const filteredPlates = useMemo(() => {
    let result = [...(plates || [])];
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      result = result.filter((p) => (p.plateNumber || '').toLowerCase().includes(q));
    }
    if (filterCategory && filterCategory !== 'All Categories') {
      result = result.filter((p) => p.category === filterCategory);
    }
    if (filterStatus === 'available') {
      result = result.filter((p) => !p.isSold);
    } else if (filterStatus === 'sold') {
      result = result.filter((p) => p.isSold);
    }
    if (filterDate) {
      const targetDate = filterDate.trim();
      result = result.filter((p) => {
        const d = (p.addedDate || '').toString().slice(0, 10);
        return d === targetDate;
      });
    }
    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'date_asc') {
      result.sort((a, b) => ((a.addedDate || '') < (b.addedDate || '') ? -1 : (a.addedDate || '') > (b.addedDate || '') ? 1 : 0));
    } else {
      // date_desc (newest first)
      result.sort((a, b) => ((b.addedDate || '') < (a.addedDate || '') ? -1 : (b.addedDate || '') > (a.addedDate || '') ? 1 : 0));
    }
    return result;
  }, [plates, searchQuery, filterCategory, filterStatus, filterDate, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPlates.length / PLATES_PER_PAGE));
  const startIndex = (currentPage - 1) * PLATES_PER_PAGE;
  const paginatedPlates = filteredPlates.slice(startIndex, startIndex + PLATES_PER_PAGE);

  // Filtered and sorted dealers for Dealers page
  const filteredDealers = useMemo(() => {
    let result = [...(dealers || [])];
    const q = (dealerSearchQuery || '').trim().toLowerCase();
    if (q) {
      result = result.filter(
        (d) =>
          (d.fullName || '').toLowerCase().includes(q) ||
          (d.email || '').toLowerCase().includes(q) ||
          (d.username || '').toLowerCase().includes(q) ||
          (d.phoneNumber || '').toLowerCase().includes(q)
      );
    }
    if (dealerFilterStatus === 'active') {
      result = result.filter((d) => d.isActive !== false);
    } else if (dealerFilterStatus === 'inactive') {
      result = result.filter((d) => d.isActive === false);
    }
    if (dealerSortBy === 'name_asc') {
      result.sort((a, b) => ((a.fullName || '').toLowerCase() < (b.fullName || '').toLowerCase() ? -1 : 1));
    } else if (dealerSortBy === 'name_desc') {
      result.sort((a, b) => ((b.fullName || '').toLowerCase() < (a.fullName || '').toLowerCase() ? -1 : 1));
    } else if (dealerSortBy === 'date_asc') {
      result.sort((a, b) => ((a.createdDate || '') < (b.createdDate || '') ? -1 : (a.createdDate || '') > (b.createdDate || '') ? 1 : 0));
    } else {
      result.sort((a, b) => ((b.createdDate || '') < (a.createdDate || '') ? -1 : (b.createdDate || '') > (a.createdDate || '') ? 1 : 0));
    }
    return result;
  }, [dealers, dealerSearchQuery, dealerFilterStatus, dealerSortBy]);

  const dealersTotalPages = Math.max(1, Math.ceil(filteredDealers.length / DEALERS_PER_PAGE));
  const dealersStartIndex = (dealersCurrentPage - 1) * DEALERS_PER_PAGE;
  const paginatedDealers = filteredDealers.slice(dealersStartIndex, dealersStartIndex + DEALERS_PER_PAGE);

  const formatDate = (d) => (d ? (typeof d === 'string' ? d.slice(0, 10) : d) : '—');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage number plates and dealers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {location.pathname === '/admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Plate
            </button>
          )}
          {location.pathname === '/admin/dealers' && (
            <button
              onClick={() => setShowAddDealerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              Add New Dealer
            </button>
          )}
        </div>
      </div>

      {/* Plates Content */}
      {location.pathname === '/admin' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-1">Total Plates</p>
              <p className="text-3xl font-bold text-gray-900">{plates.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">
                {plates.filter(p => !p.isSold).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-1">Sold</p>
              <p className="text-3xl font-bold text-gray-400">
                {plates.filter(p => p.isSold).length}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by plate number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <label htmlFor="filter-date" className="text-sm text-gray-600 whitespace-nowrap">Added date:</label>
                <input
                  id="filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Showing {filteredPlates.length} of {plates.length} plates
              {filteredPlates.length > PLATES_PER_PAGE && (
                <span className="ml-2">· Page {currentPage} of {totalPages}</span>
              )}
            </p>
          </div>

          {/* Plates Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-700 font-semibold">
                      Plate Number
                    </th>
                    <th className="text-left px-6 py-3 text-gray-700 font-semibold">
                      Category
                    </th>
                    <th className="text-left px-6 py-3 text-gray-700 font-semibold">
                      Price (RM)
                    </th>
                    <th className="text-left px-6 py-3 text-gray-700 font-semibold">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-gray-700 font-semibold">
                      Added Date
                    </th>
                    <th className="text-right px-6 py-3 text-gray-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedPlates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No plates match your search or filters. Try adjusting the criteria.
                      </td>
                    </tr>
                  ) : (
                  paginatedPlates.map((plate) => (
                    <tr key={plate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-gray-900">
                          {plate.plateNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{plate.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === plate.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePrice(plate.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-900">
                            {plate.price.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {plate.isSold ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-gray-100 text-gray-600">
                            Sold
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-green-100 text-green-700">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {plate.addedDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!plate.isSold && editingId !== plate.id && (
                            <>
                              <button
                                onClick={() => handleEditPrice(plate)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Price"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => markSold(plate.id)}
                                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                title="Mark as Sold"
                              >
                                Mark Sold
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {filteredPlates.length > PLATES_PER_PAGE && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}–{Math.min(startIndex + PLATES_PER_PAGE, filteredPlates.length)} of {filteredPlates.length} plates
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Plate Modal */}
          {showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200 pointer-events-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Plate</h2>
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setAddError(''); }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {addError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{addError}</p>
                  </div>
                )}

                <form onSubmit={handleAddPlate} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      value={newPlate.plateNumber}
                      onChange={(e) => setNewPlate({ ...newPlate, plateNumber: e.target.value })}
                      placeholder="e.g., WWW 1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Price (RM)
                    </label>
                    <input
                      type="number"
                      value={newPlate.price}
                      onChange={(e) => setNewPlate({ ...newPlate, price: e.target.value })}
                      placeholder="e.g., 128000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newPlate.category}
                      onChange={(e) => setNewPlate({ ...newPlate, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="2 DIGIT">2 DIGIT</option>
                      <option value="3 DIGIT">3 DIGIT</option>
                      <option value="4 DIGIT">4 DIGIT</option>
                      <option value="CLASSIC">CLASSIC</option>
                      <option value="GOLDEN NUMBER">GOLDEN NUMBER</option>
                      <option value="OFFER">OFFER</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); setAddError(''); }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Plate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dealers Content */}
      {location.pathname === '/admin/dealers' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-1">Total Dealers</p>
              <p className="text-3xl font-bold text-gray-900">{dealers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {dealers.filter((d) => d.isActive !== false).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-400">
                {dealers.filter((d) => d.isActive === false).length}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, username..."
                  value={dealerSearchQuery}
                  onChange={(e) => setDealerSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={dealerFilterStatus}
                onChange={(e) => setDealerFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
              >
                {DEALER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <label htmlFor="dealer-sort" className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select
                  id="dealer-sort"
                  value={dealerSortBy}
                  onChange={(e) => setDealerSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
                >
                  {DEALER_SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Showing {filteredDealers.length} of {dealers.length} dealers
              {filteredDealers.length > DEALERS_PER_PAGE && (
                <span className="ml-2">· Page {dealersCurrentPage} of {dealersTotalPages}</span>
              )}
            </p>
          </div>

          {/* Dealers Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {dealersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading dealers...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-700 font-semibold">Full Name</th>
                      <th className="text-left px-6 py-3 text-gray-700 font-semibold">Phone</th>
                      <th className="text-left px-6 py-3 text-gray-700 font-semibold">Email</th>
                      <th className="text-left px-6 py-3 text-gray-700 font-semibold">Username</th>
                      <th className="text-left px-6 py-3 text-gray-700 font-semibold">Status</th>
                      <th className="text-left px-6 py-3 text-gray-700 font-semibold">Created</th>
                      <th className="text-left px-6 py-3 text-gray-700 font-semibold">Last Login</th>
                      <th className="text-right px-6 py-3 text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedDealers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          No dealers match your search or filters. Try adjusting the criteria or add a new dealer.
                        </td>
                      </tr>
                    ) : (
                      paginatedDealers.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{d.fullName ?? '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{d.phoneNumber ?? '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{d.email ?? '—'}</td>
                          <td className="px-6 py-4 font-mono text-gray-700">{d.username ?? '—'}</td>
                          <td className="px-6 py-4">
                            {d.isActive !== false ? (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm bg-green-100 text-green-700">Active</span>
                            ) : (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm bg-gray-100 text-gray-600">Inactive</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(d.createdDate)}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(d.lastLoginDate)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditDealerModal(d)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit dealer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete dealer "${d.fullName}"? This cannot be undone.`)) {
                                    dealerService.deleteDealer(d.id).then(() => {
                                      setDealers((prev) => prev.filter((x) => x.id !== d.id));
                                    }).catch((err) => alert(err.message || 'Failed to delete dealer'));
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete dealer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination */}
            {!dealersLoading && filteredDealers.length > DEALERS_PER_PAGE && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {dealersStartIndex + 1}–{Math.min(dealersStartIndex + DEALERS_PER_PAGE, filteredDealers.length)} of {filteredDealers.length} dealers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDealersCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={dealersCurrentPage <= 1}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {dealersCurrentPage} of {dealersTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDealersCurrentPage((p) => Math.min(dealersTotalPages, p + 1))}
                    disabled={dealersCurrentPage >= dealersTotalPages}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Dealer Modal - same pattern as Add New Plate */}
      {showAddDealerModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add New Dealer</h2>
              <button
                type="button"
                onClick={() => { setShowAddDealerModal(false); setAddDealerError(''); }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {addDealerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{addDealerError}</p>
              </div>
            )}

            <form onSubmit={handleAddDealer} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newDealer.fullName}
                  onChange={(e) => setNewDealer({ ...newDealer, fullName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newDealer.phoneNumber}
                  onChange={(e) => setNewDealer({ ...newDealer, phoneNumber: e.target.value })}
                  placeholder="e.g., 012-3456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newDealer.email}
                  onChange={(e) => setNewDealer({ ...newDealer, email: e.target.value })}
                  placeholder="e.g., john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newDealer.username}
                  onChange={(e) => setNewDealer({ ...newDealer, username: e.target.value })}
                  placeholder="e.g., johndoe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newDealer.password}
                  onChange={(e) => setNewDealer({ ...newDealer, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddDealerModal(false); setAddDealerError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addDealerLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addDealerLoading ? 'Adding...' : 'Add Dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dealer Modal */}
      {editingDealer && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200 pointer-events-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Dealer</h2>
              <button
                type="button"
                onClick={() => { setEditingDealer(null); setEditDealerError(''); }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {editDealerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{editDealerError}</p>
              </div>
            )}

            <form onSubmit={handleEditDealer} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editDealerForm.fullName}
                  onChange={(e) => setEditDealerForm({ ...editDealerForm, fullName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editDealerForm.phoneNumber}
                  onChange={(e) => setEditDealerForm({ ...editDealerForm, phoneNumber: e.target.value })}
                  placeholder="e.g., 012-3456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editDealerForm.email}
                  onChange={(e) => setEditDealerForm({ ...editDealerForm, email: e.target.value })}
                  placeholder="e.g., john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={editDealerForm.username}
                  onChange={(e) => setEditDealerForm({ ...editDealerForm, username: e.target.value })}
                  placeholder="e.g., johndoe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={editDealerForm.password}
                  onChange={(e) => setEditDealerForm({ ...editDealerForm, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-dealer-active"
                  checked={editDealerForm.isActive}
                  onChange={(e) => setEditDealerForm({ ...editDealerForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="edit-dealer-active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setEditingDealer(null); setEditDealerError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editDealerLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editDealerLoading ? 'Updating...' : 'Update Dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
