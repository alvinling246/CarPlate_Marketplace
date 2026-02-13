import { useState } from 'react';
import { Plus, Edit2, CheckCircle, X } from 'lucide-react';
import { usePlates } from '../contexts/PlateContext.jsx';

export function AdminView() {
  const { plates, addPlate, updatePrice, markSold } = usePlates();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  const [newPlate, setNewPlate] = useState({
    plateNumber: '',
    price: '',
    category: '2 DIGIT',
  });

  const handleAddPlate = (e) => {
    e.preventDefault();
    if (!newPlate.plateNumber || !newPlate.price) return;

    addPlate({
      plateNumber: newPlate.plateNumber.toUpperCase(),
      price: parseFloat(newPlate.price),
      isSold: false,
      category: newPlate.category,
    });

    setNewPlate({ plateNumber: '', price: '', category: '2 DIGIT' });
    setShowAddModal(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage number plates inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Plate
        </button>
      </div>

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
              {plates.map((plate) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add New Plate</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

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
                  onClick={() => setShowAddModal(false)}
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
    </div>
  );
}
