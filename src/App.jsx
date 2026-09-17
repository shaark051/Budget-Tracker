import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalyticsSummary } from './components/AnalyticsSummary';
import { ExpenseTable } from './components/ExpenseTable';
import {
  subscribeToEvents,
  subscribeToExpenses,
  addEvent,
  updateEvent,
  deleteEvent,
  addExpense,
  updateExpense,
  deleteExpense
} from './services/store';
import { Sparkles, Calendar } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Subscribe to Events
  useEffect(() => {
    const unsubscribe = subscribeToEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
      if (fetchedEvents.length > 0) {
        // Keep current selected event or default to first
        setCurrentEvent(prev => {
          if (!prev) return fetchedEvents[0];
          const match = fetchedEvents.find(e => e.id === prev.id);
          return match || fetchedEvents[0];
        });
      } else {
        setCurrentEvent(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Expenses for the selected event
  useEffect(() => {
    if (!currentEvent) {
      setExpenses([]);
      return;
    }

    const unsubscribe = subscribeToExpenses(currentEvent.id, (fetchedExpenses) => {
      setExpenses(fetchedExpenses);
    });

    return () => unsubscribe();
  }, [currentEvent?.id]);

  const handleAddEvent = async (eventData) => {
    const newId = await addEvent(eventData);
    // Find newly added event or construct temporary view item
    setCurrentEvent({ id: newId, ...eventData });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#D4D4D4] font-sans antialiased selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-200">

      {/* Header Bar */}
      <Header
        events={events}
        currentEvent={currentEvent}
        onSelectEvent={setCurrentEvent}
        onAddEvent={handleAddEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-mono">Loading event workspace...</p>
          </div>
        ) : !currentEvent ? (
          <div className="text-center py-20 max-w-md mx-auto space-y-4 bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-3xl p-8 shadow-apple">
            <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">No Events Found</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Create your first event budget sheet to track expenditure, category allocation, and real-time balance.
            </p>
            <button
              onClick={() => handleAddEvent({
                name: 'New Launch Event 2025',
                description: 'Product launch & reception',
                budget: 25000,
                currency: 'USD'
              })}
              className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Sample Event</span>
            </button>
          </div>
        ) : (
          <>
            {/* Event Header Card / Cover */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-6 sm:p-8 shadow-apple">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-gray-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Event Workspace</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {currentEvent.name}
                  </h1>
                  <p className="text-sm text-gray-300 max-w-xl">
                    {currentEvent.description || 'Budget & Expenditure Tracker'}
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics & Summary */}
            <AnalyticsSummary currentEvent={currentEvent} expenses={expenses} />

            {/* Itemized Expenses Table */}
            <ExpenseTable
              currentEvent={currentEvent}
              expenses={expenses}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
            />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#E3E2E0] dark:border-[#2F2F2F] text-center text-xs text-gray-400 space-y-1">
        <p>Designed by @shareararko. Powered by Firebase & Cloudflare Pages.</p>
      </footer>
    </div>
  );
}
