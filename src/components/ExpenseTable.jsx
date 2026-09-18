import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  ArrowUpDown,
  Download,
  Edit2,
  Trash2,
  Filter,
  X,
  FolderPlus,
  FileText,
  DollarSign,
  Calendar,
  Building,
  Tag
} from 'lucide-react';
import { CategoryBadge, StatusBadge, formatCurrency } from './Badges';
import { DEFAULT_CATEGORIES, STATUS_OPTIONS, subscribeToCategories, addCategory } from '../services/store';

export function ExpenseTable({
  currentEvent,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}) {
  const currency = currentEvent?.currency || 'USD';

  // Categories state from store
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToCategories((fetchedCats) => {
      setCategories(fetchedCats);
    });
    return () => unsubscribe();
  }, []);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.label || DEFAULT_CATEGORIES[0].label);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryLabel.trim()) return;
    const added = await addCategory({ label: newCategoryLabel.trim() });
    if (added) {
      setCategory(added.label);
    }
    setNewCategoryLabel('');
    setIsCategoryModalOpen(false);
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory(DEFAULT_CATEGORIES[0].label);
    setAmount('');
    setStatus('Paid');
    setDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setTitle(expense.title || '');
    setCategory(expense.category || DEFAULT_CATEGORIES[0].label);
    setAmount(expense.amount || '');
    setStatus(expense.status || 'Paid');
    setDate(expense.date || new Date().toISOString().split('T')[0]);
    setVendor(expense.vendor || '');
    setNotes(expense.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const payload = {
      title: title.trim(),
      category,
      amount: parseFloat(amount) || 0,
      status,
      date,
      vendor: vendor.trim(),
      notes: notes.trim(),
    };

    if (editingExpense) {
      await onUpdateExpense(currentEvent.id, editingExpense.id, payload);
    } else {
      await onAddExpense(currentEvent.id, payload);
    }

    setIsModalOpen(false);
  };

  // Sort & Filter logic
  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch =
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.vendor && exp.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'ALL' || exp.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || exp.status === selectedStatus;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'amount') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [expenses, searchQuery, selectedCategory, selectedStatus, sortField, sortDirection]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Title', 'Category', 'Amount', 'Status', 'Date', 'Vendor', 'Notes'];
    const rows = filteredAndSortedExpenses.map(e => [
      `"${e.title || ''}"`,
      `"${e.category || ''}"`,
      e.amount || 0,
      `"${e.status || ''}"`,
      `"${e.date || ''}"`,
      `"${e.vendor || ''}"`,
      `"${e.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,'
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentEvent?.name || 'event'}-expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">

      {/* Table Header & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E3E2E0] dark:border-[#2F2F2F]">
        <div>
          <h3 className="text-lg font-semibold text-[#37352F] dark:text-[#D4D4D4] flex items-center space-x-2">
            <span>Expenses</span>
            <span className="text-xs font-normal text-gray-500 bg-white dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] px-2 py-0.5 rounded-full font-mono">
              {filteredAndSortedExpenses.length} items
            </span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Inline itemized breakdown and status tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Expense Button */}
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Expense</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={exportToCSV}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] hover:bg-gray-100 dark:hover:bg-[#2B2B2B] transition-colors text-xs font-medium flex items-center space-x-1.5 text-gray-700 dark:text-gray-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            aria-label="Search expenses"
            placeholder="Search expense, vendor, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-[#37352F] dark:text-[#D4D4D4]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Clear search query" className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <select
            aria-label="Filter expenses by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#37352F] dark:text-[#D4D4D4]"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id || cat.label} value={cat.label}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            aria-label="Filter expenses by status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-[#37352F] text-xs bg-white dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-[#D4D4D4]"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map(st => (
              <option key={st.id} value={st.id}>{st.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Table View */}
      <div className="overflow-x-auto rounded-xl border border-[#E3E2E0] dark:border-[#2F2F2F] bg-white dark:bg-[#191919]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E3E2E0] dark:border-[#2F2F2F] bg-[#F7F6F3]/50 dark:bg-[#202020]/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('title')} className="flex items-center space-x-1 hover:text-black dark:hover:text-white">
                  <span>Expense</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('amount')} className="flex items-center space-x-1 hover:text-black dark:hover:text-white">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('date')} className="flex items-center space-x-1 hover:text-black dark:hover:text-white">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 hidden md:table-cell">Vendor</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E2E0] dark:divide-[#2F2F2F] text-xs">
            {filteredAndSortedExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400">
                  No expense items match your criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-[#F7F6F3] dark:hover:bg-[#202020] transition-colors group"
                >
                  <td className="py-3 px-4 font-medium text-[#37352F] dark:text-[#D4D4D4]">
                    <div>{exp.title}</div>
                    {exp.notes && (
                      <div className="text-[11px] text-gray-400 font-normal truncate max-w-xs mt-0.5">
                        {exp.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <CategoryBadge category={exp.category} />
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#37352F] dark:text-[#D4D4D4] whitespace-nowrap">
                    {formatCurrency(exp.amount, currency)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono text-[11px] whitespace-nowrap">
                    {exp.date}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 hidden md:table-cell whitespace-nowrap">
                    {exp.vendor || '-'}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(exp)}
                        aria-label={`Edit ${exp.title}`}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-[#2B2B2B] rounded text-gray-600 dark:text-gray-300 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${exp.title}"?`)) {
                            onDeleteExpense(currentEvent.id, exp.id);
                          }
                        }}
                        aria-label={`Delete ${exp.title}`}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-950/40 rounded text-red-500 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Create New Category */}
      {isCategoryModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl shadow-apple max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E2E0] dark:border-[#2F2F2F]">
              <h3 className="text-md font-semibold text-[#37352F] dark:text-[#D4D4D4] flex items-center space-x-2">
                <FolderPlus className="w-4 h-4" />
                <span>Create New Category</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} aria-label="Close modal" className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security & Staffing"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-[#E3E2E0] dark:border-[#2F2F2F] hover:bg-[#F7F6F3] dark:hover:bg-[#2B2B2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Add/Edit Expense */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl shadow-apple max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E2E0] dark:border-[#2F2F2F]">
              <h3 className="text-lg font-semibold text-[#37352F] dark:text-[#D4D4D4]">
                {editingExpense ? 'Edit Expense Item' : 'New Expense Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close modal" className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title / Item</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catering Deposit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-500">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.id || cat.label} value={cat.label}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Event Services"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea
                  rows="2"
                  placeholder="Additional invoice numbers, references..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm border border-[#E3E2E0] dark:border-[#2F2F2F] hover:bg-[#F7F6F3] dark:hover:bg-[#2B2B2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 shadow-sm"
                >
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
