import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";

// Default initial categories with Notion-style tag colors
export const DEFAULT_CATEGORIES = [
  { id: 'venue', label: 'Venue & Location', color: 'blue' },
  { id: 'catering', label: 'Catering & Food', color: 'green' },
  { id: 'decor', label: 'Decor & Staging', color: 'pink' },
  { id: 'marketing', label: 'Marketing & Media', color: 'purple' },
  { id: 'tech', label: 'AV & Tech Support', color: 'orange' },
  { id: 'logistics', label: 'Travel & Logistics', color: 'yellow' },
  { id: 'entertainment', label: 'Entertainment & Speakers', color: 'brown' },
  { id: 'misc', label: 'Miscellaneous', color: 'gray' },
];

export const STATUS_OPTIONS = [
  { id: 'Paid', label: 'Paid', color: 'green' },
  { id: 'Pending', label: 'Pending', color: 'yellow' },
  { id: 'Approved', label: 'Approved', color: 'blue' },
  { id: 'Cancelled', label: 'Cancelled', color: 'red' },
];

const LOCAL_STORAGE_KEY_EVENTS = 'apple_notion_events';
const LOCAL_STORAGE_KEY_EXPENSES = 'apple_notion_expenses';

// Sample default data for local mode demo
const DEFAULT_EVENTS = [
  {
    id: 'demo-event-1',
    name: 'Tech Vision Summit 2025',
    description: 'Annual global developer & product conference',
    budget: 45000,
    currency: 'USD',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-event-2',
    name: 'Executive Leadership Retreat',
    description: 'Q3 Strategy & Networking Retreat',
    budget: 18000,
    currency: 'USD',
    createdAt: new Date().toISOString(),
  }
];

const DEFAULT_EXPENSES = [
  {
    id: 'exp-1',
    eventId: 'demo-event-1',
    title: 'Convention Center Main Hall Deposit',
    category: 'Venue & Location',
    amount: 12500,
    status: 'Paid',
    date: '2025-04-12',
    vendor: 'Grand City Center',
    notes: '50% initial non-refundable deposit',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-2',
    eventId: 'demo-event-1',
    title: 'Gourmet Catering & Coffee Bar',
    category: 'Catering & Food',
    amount: 8200,
    status: 'Pending',
    date: '2025-04-14',
    vendor: 'Artisan Eats Co.',
    notes: 'Breakfast pastries & plated lunch for 300 guests',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-3',
    eventId: 'demo-event-1',
    title: 'Keynote LED Wall & Sound Rigging',
    category: 'AV & Tech Support',
    amount: 6400,
    status: 'Paid',
    date: '2025-04-10',
    vendor: 'ProLight & Audio',
    notes: 'Includes 2 on-site technicians',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-4',
    eventId: 'demo-event-1',
    title: 'Keynote Speaker Honorarium',
    category: 'Entertainment & Speakers',
    amount: 5000,
    status: 'Approved',
    date: '2025-04-15',
    vendor: 'Dr. Sarah Jenkins',
    notes: 'Travel allowance included in total',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-5',
    eventId: 'demo-event-1',
    title: 'Social Media & Billboard Campaign',
    category: 'Marketing & Media',
    amount: 3200,
    status: 'Paid',
    date: '2025-03-28',
    vendor: 'Pulse Digital Agency',
    notes: 'Targeted campaign across LinkedIn & X',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-6',
    eventId: 'demo-event-1',
    title: 'Eco-friendly Lanyards & Badges',
    category: 'Decor & Staging',
    amount: 1100,
    status: 'Paid',
    date: '2025-04-01',
    vendor: 'GreenPrint Promo',
    notes: 'Recycled bamboo lanyard straps with QR codes',
    createdAt: new Date().toISOString()
  }
];

// Helper to load local storage
function getLocalEvents() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(DEFAULT_EVENTS));
    return DEFAULT_EVENTS;
  }
  return JSON.parse(data);
}

function getLocalExpenses() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
    return DEFAULT_EXPENSES;
  }
  return JSON.parse(data);
}

/** Subscribe to Events */
export function subscribeToEvents(callback) {
  if (isFirebaseConfigured && db) {
    const eventsRef = collection(db, "events");
    return onSnapshot(eventsRef, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (err) => {
      console.error("Firestore events error:", err);
      callback(getLocalEvents());
    });
  } else {
    callback(getLocalEvents());
    const handleStorage = () => callback(getLocalEvents());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }
}

/** Subscribe to Expenses for a specific Event */
export function subscribeToExpenses(eventId, callback) {
  if (!eventId) {
    callback([]);
    return () => {};
  }

  if (isFirebaseConfigured && db) {
    const expensesRef = collection(db, "events", eventId, "expenses");
    return onSnapshot(expensesRef, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(expenses);
    }, (err) => {
      console.error("Firestore expenses error:", err);
      const filtered = getLocalExpenses().filter(e => e.eventId === eventId);
      callback(filtered);
    });
  } else {
    const filterAndSend = () => {
      const filtered = getLocalExpenses().filter(e => e.eventId === eventId);
      callback(filtered);
    };
    filterAndSend();
    const handleStorage = () => filterAndSend();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }
}

/** Add new Event */
export async function addEvent(eventData) {
  if (isFirebaseConfigured && db) {
    const eventsRef = collection(db, "events");
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } else {
    const events = getLocalEvents();
    const newEvent = {
      id: 'event-' + Date.now(),
      ...eventData,
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
    window.dispatchEvent(new Event('storage'));
    return newEvent.id;
  }
}

/** Update Event */
export async function updateEvent(eventId, updateData) {
  if (isFirebaseConfigured && db) {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, updateData);
  } else {
    const events = getLocalEvents().map(e => e.id === eventId ? { ...e, ...updateData } : e);
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
    window.dispatchEvent(new Event('storage'));
  }
}

/** Delete Event */
export async function deleteEvent(eventId) {
  if (isFirebaseConfigured && db) {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
  } else {
    const events = getLocalEvents().filter(e => e.id !== eventId);
    const expenses = getLocalExpenses().filter(e => e.eventId !== eventId);
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    window.dispatchEvent(new Event('storage'));
  }
}

/** Add Expense */
export async function addExpense(eventId, expenseData) {
  if (isFirebaseConfigured && db) {
    const expensesRef = collection(db, "events", eventId, "expenses");
    const docRef = await addDoc(expensesRef, {
      ...expenseData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } else {
    const expenses = getLocalExpenses();
    const newExpense = {
      id: 'exp-' + Date.now(),
      eventId,
      ...expenseData,
      createdAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    window.dispatchEvent(new Event('storage'));
    return newExpense.id;
  }
}

/** Update Expense */
export async function updateExpense(eventId, expenseId, updateData) {
  if (isFirebaseConfigured && db) {
    const expenseRef = doc(db, "events", eventId, "expenses", expenseId);
    await updateDoc(expenseRef, updateData);
  } else {
    const expenses = getLocalExpenses().map(exp =>
      exp.id === expenseId ? { ...exp, ...updateData } : exp
    );
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    window.dispatchEvent(new Event('storage'));
  }
}

/** Delete Expense */
export async function deleteExpense(eventId, expenseId) {
  if (isFirebaseConfigured && db) {
    const expenseRef = doc(db, "events", eventId, "expenses", expenseId);
    await deleteDoc(expenseRef);
  } else {
    const expenses = getLocalExpenses().filter(exp => exp.id !== expenseId);
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    window.dispatchEvent(new Event('storage'));
  }
}
