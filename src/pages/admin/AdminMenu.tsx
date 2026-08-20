import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, MenuItem } from '../../store/useStore';
import { formatCurrency } from '../../utils/helpers';
import {
  Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Search,
  Package, Leaf, Flame, Clock, Save, X
} from 'lucide-react';

const CATEGORIES = ['Beverages', 'Snacks', 'Meals', 'Fast Food', 'Desserts'];

interface MenuFormData {
  name: string;
  price: string;
  category: string;
  description: string;
  image: string;
  prepTime: string;
  veg: boolean;
  stock: string;
  popular: boolean;
}

const defaultForm: MenuFormData = {
  name: '', price: '', category: 'Snacks', description: '',
  image: '', prepTime: '5 min', veg: true, stock: '50', popular: false
};

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
  'https://images.unsplash.com/photo-1563379091339-03246963d651?w=400&q=80',
  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
];

export const AdminMenu: React.FC = () => {
  const { selectedInstitution, getInstitutionMenu, addMenuItem, updateMenuItem, deleteMenuItem } = useStore();
  const menuItems = getInstitutionMenu(selectedInstitution?.id || '');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuFormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  const openAddForm = () => {
    setEditingItem(null);
    setForm(defaultForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description,
      image: item.image,
      prepTime: item.prepTime,
      veg: item.veg,
      stock: item.stock.toString(),
      popular: item.popular,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errors.price = 'Valid price required';
    if (!form.description.trim()) errors.description = 'Description required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const itemData: Omit<MenuItem, 'id'> = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      image: form.image || SAMPLE_IMAGES[0],
      prepTime: form.prepTime,
      veg: form.veg,
      stock: Number(form.stock) || 50,
      popular: form.popular,
      institutionId: selectedInstitution?.id || '',
      available: true,
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem({ ...itemData, id: `${selectedInstitution?.id}_custom_${Date.now()}` });
    }
    setShowForm(false);
  };

  const handleToggleAvailable = (item: MenuItem) => {
    updateMenuItem(item.id, { available: !item.available });
  };

  const handleDelete = (id: string) => {
    deleteMenuItem(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Menu Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">{menuItems.length} items • {selectedInstitution?.name}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-violet-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </motion.button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${activeCategory === cat ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${item.available ? 'border-white/10 hover:border-violet-500/30' : 'border-white/5 opacity-60'}`}
          >
            <div className="relative aspect-video overflow-hidden">
              <img src={item.image} alt={item.name}
                className={`w-full h-full object-cover transition-all ${!item.available ? 'grayscale' : ''}`}
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${item.veg ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {item.veg ? '🟢' : '🔴'}
                </span>
                {item.popular && <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white text-xs font-bold">🔥 Hot</span>}
                {!item.available && <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-xs font-bold">Unavailable</span>}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-white font-black text-sm">{formatCurrency(item.price)}</span>
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  <p className="text-gray-400 text-xs">{item.category}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />{item.prepTime}
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-3 line-clamp-1">{item.description}</p>

              <div className="flex items-center gap-1 justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Stock: {item.stock}</span>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleToggleAvailable(item)}
                    className={`p-1.5 rounded-lg transition-all ${item.available ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {item.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEditForm(item)}
                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDeleteConfirm(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No items found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-8 bottom-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50 overflow-y-auto">
              <div className="bg-[#13102a] border border-white/15 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/8 text-gray-400 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Item Name *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Masala Tea"
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                      {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Price (₹) *</label>
                      <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" placeholder="0"
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                      {formErrors.price && <p className="text-red-400 text-xs mt-1">{formErrors.price}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">Description *</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the item"
                      rows={2} className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none" />
                    {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Food Image</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {SAMPLE_IMAGES.map((img, i) => (
                        <button key={i} type="button" onClick={() => setForm(f => ({ ...f, image: img }))}
                          className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${form.image === img ? 'border-violet-500' : 'border-transparent'}`}>
                          <img src={img} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                    <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Or paste image URL..."
                      className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Prep Time</label>
                      <select value={form.prepTime} onChange={e => setForm(f => ({ ...f, prepTime: e.target.value }))}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                        {['2 min', '3 min', '5 min', '7 min', '10 min', '15 min'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Stock</label>
                      <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} type="number" placeholder="50"
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.veg} onChange={e => setForm(f => ({ ...f, veg: e.target.checked }))} className="sr-only" />
                      <div className={`w-10 h-5 rounded-full transition-all ${form.veg ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.veg ? 'left-5' : 'left-0.5'}`} />
                      </div>
                      <span className="text-sm text-gray-300 flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-green-400" /> Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.popular} onChange={e => setForm(f => ({ ...f, popular: e.target.checked }))} className="sr-only" />
                      <div className={`w-10 h-5 rounded-full transition-all ${form.popular ? 'bg-orange-500' : 'bg-gray-600'} relative`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.popular ? 'left-5' : 'left-0.5'}`} />
                      </div>
                      <span className="text-sm text-gray-300 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" /> Popular</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 py-3 bg-white/8 border border-white/15 rounded-xl text-gray-300 font-semibold hover:bg-white/15 transition-all">
                      Cancel
                    </button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
                      className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-80 z-50">
              <div className="bg-[#13102a] border border-red-500/30 rounded-2xl p-6 text-center">
                <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Delete Item?</h3>
                <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 bg-white/8 border border-white/15 rounded-xl text-gray-300 font-semibold">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMenu;
