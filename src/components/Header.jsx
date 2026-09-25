import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  Plus,
  Calendar,
  DollarSign,
  Sun,
  Moon,
  Sparkles,
  Trash2,
  Edit3,
  X,
  Database
} from 'lucide-react';
import { formatCurrency } from './Badges';
import { isFirebaseConfigured } from '../firebase';

// Wrapped with React.memo to prevent re-rendering header bar, modals, and event dropdowns when expense state updates in App
export const Header = React.memo(function Header({
  events,
  currentEvent,
  onSelectEvent,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  darkMode,
  setDarkMode
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsNewEventModalOpen(false);
        setIsEditEventModalOpen(false);
      }
    };
    if (isDropdownOpen || isNewEventModalOpen || isEditEventModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDropdownOpen, isNewEventModalOpen, isEditEventModalOpen]);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');

  const openNewModal = () => {
    setName('');
    setDescription('');
    setBudget('10000');
    setCurrency('USD');
    setIsNewEventModalOpen(true);
    setIsDropdownOpen(false);
  };

  const openEditModal = () => {
    if (!currentEvent) return;
    setName(currentEvent.name || '');
    setDescription(currentEvent.description || '');
    setBudget(currentEvent.budget || '');
    setCurrency(currentEvent.currency || 'USD');
    setIsEditEventModalOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAddEvent({
      name: name.trim(),
      description: description.trim(),
      budget: parseFloat(budget) || 0,
      currency: currency || 'USD'
    });
    setIsNewEventModalOpen(false);
  };

  const handleSaveEditEvent = async (e) => {
    e.preventDefault();
    if (!currentEvent || !name.trim()) return;
    await onUpdateEvent(currentEvent.id, {
      name: name.trim(),
      description: description.trim(),
      budget: parseFloat(budget) || 0,
      currency: currency || 'USD'
    });
    setIsEditEventModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md border-b border-[#E3E2E0] dark:border-[#2F2F2F] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: Event Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-[#F7F6F3] dark:hover:bg-[#202020] transition-colors border border-transparent hover:border-[#E3E2E0] dark:hover:border-[#2F2F2F] group"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-semibold text-sm shadow-sm group-hover:scale-105 transition-transform">
              {currentEvent ? currentEvent.name.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-sm text-[#37352F] dark:text-[#D4D4D4]">
                  {currentEvent ? currentEvent.name : 'Select Event'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                {currentEvent?.description || 'Budget Tracker'}
              </p>
            </div>
          </button>

          {/* Event Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] shadow-apple dark:shadow-apple-dark py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Events
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      onSelectEvent(evt);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm hover:bg-[#F7F6F3] dark:hover:bg-[#2B2B2B] transition-colors ${
                      currentEvent?.id === evt.id ? 'bg-[#F7F6F3] dark:bg-[#252525] font-medium' : ''
                    }`}
                  >
                    <span className="truncate">{evt.name}</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {formatCurrency(evt.budget, evt.currency)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[#E3E2E0] dark:border-[#2F2F2F] mt-1 pt-1 px-1">
                <button
                  onClick={openNewModal}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center space-x-2 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Event</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center / Event Edit Actions */}
        {currentEvent && (
          <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] px-2.5 py-1 rounded-md font-mono">
              Budget: {formatCurrency(currentEvent.budget, currentEvent.currency)}
            </span>
            <button
              onClick={openEditModal}
              aria-label="Edit event details"
              className="p-1.5 hover:bg-[#F7F6F3] dark:hover:bg-[#202020] rounded-md transition-colors"
              title="Edit Event Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {events.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${currentEvent.name}"?`)) {
                    onDeleteEvent(currentEvent.id);
                  }
                }}
                aria-label="Delete event"
                className="p-1.5 hover:bg-red-50 text-red-500 dark:hover:bg-red-950/40 rounded-md transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Right Controls: Mode Badge & Theme Switcher */}
        <div className="flex items-center space-x-3">
          {/* Storage status badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F1EF] dark:bg-[#252525] text-gray-600 dark:text-gray-300 border border-[#E3E2E0] dark:border-[#2F2F2F]">
            <Database className="w-3.5 h-3.5" />
            <span>{isFirebaseConfigured ? 'Firebase Live Sync' : 'Local Sandbox Mode'}</span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] hover:bg-gray-200 dark:hover:bg-[#2B2B2B] transition-colors focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus:outline-none"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Modal: New Event */}
      {isNewEventModalOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-event-title"
          onClick={(e) => { if (e.target === e.currentTarget) setIsNewEventModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl shadow-apple max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E2E0] dark:border-[#2F2F2F]">
              <h3 id="new-event-title" className="text-lg font-semibold text-[#37352F] dark:text-[#D4D4D4]">Create New Event</h3>
              <button onClick={() => setIsNewEventModalOpen(false)} aria-label="Close modal" className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Annual Design Gala 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Keynote, networking dinner and workshops"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total Budget</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm border border-[#E3E2E0] dark:border-[#2F2F2F] hover:bg-[#F7F6F3] dark:hover:bg-[#2B2B2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 shadow-sm"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Edit Event */}
      {isEditEventModalOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-event-title"
          onClick={(e) => { if (e.target === e.currentTarget) setIsEditEventModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl shadow-apple max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E2E0] dark:border-[#2F2F2F]">
              <h3 id="edit-event-title" className="text-lg font-semibold text-[#37352F] dark:text-[#D4D4D4]">Edit Event</h3>
              <button onClick={() => setIsEditEventModalOpen(false)} aria-label="Close modal" className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total Budget</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F3] dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditEventModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm border border-[#E3E2E0] dark:border-[#2F2F2F] hover:bg-[#F7F6F3] dark:hover:bg-[#2B2B2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
});
