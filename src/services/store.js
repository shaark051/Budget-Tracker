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
const LOCAL_STORAGE_KEY_CATEGORIES = 'apple_notion_categories';

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
    advanceAmount: 5000,
    status: 'Pending',
    date: '2025-04-12',
    vendor: 'Grand City Center',
    notes: '50% initial non-refundable deposit paid ($5,000 paid, $7,500 due)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-2',
    eventId: 'demo-event-1',
    title: 'Gourmet Catering & Coffee Bar',
    category: 'Catering & Food',
    amount: 8200,
    advanceAmount: 2000,
    status: 'Pending',
    date: '2025-04-14',
    vendor: 'Artisan Eats Co.',
    notes: 'Breakfast pastries & plated lunch for 300 guests ($2,000 advance paid)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-3',
    eventId: 'demo-event-1',
    title: 'Keynote LED Wall & Sound Rigging',
    category: 'AV & Tech Support',
    amount: 6400,
    advanceAmount: 6400,
    status: 'Paid',
    date: '2025-04-10',
    vendor: 'ProLight & Audio',
    notes: 'Includes 2 on-site technicians (Paid in full)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-4',
    eventId: 'demo-event-1',
    title: 'Keynote Speaker Honorarium',
    category: 'Entertainment & Speakers',
    amount: 5000,
    advanceAmount: 1500,
    status: 'Approved',
    date: '2025-04-15',
    vendor: 'Dr. Sarah Jenkins',
    notes: 'Travel allowance included ($1,500 retainer paid)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-5',
    eventId: 'demo-event-1',
    title: 'Social Media & Billboard Campaign',
    category: 'Marketing & Media',
    amount: 3200,
    advanceAmount: 3200,
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
    advanceAmount: 1100,
    status: 'Paid',
    date: '2025-04-01',
    vendor: 'GreenPrint Promo',
    notes: 'Recycled bamboo lanyard straps with QR codes',
    createdAt: new Date().toISOString()
  }
];

// Specific custom event names for fine-grained store updates
const STORE_UPDATE_EVENTS = 'app_events_updated';
const STORE_UPDATE_EXPENSES = 'app_expenses_updated';
const STORE_UPDATE_CATEGORIES = 'app_categories_updated';

// Dispatch fine-grained custom event to notify current tab listeners for a specific entity type only.
// Native browser 'storage' events are automatically dispatched by the browser to other tabs on localStorage changes.
function notifyLocalChange(eventName) {
  window.dispatchEvent(new Event(eventName));
}

function getLocalEvents() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read local events:", err);
    return DEFAULT_EVENTS;
  }
}

function getLocalExpenses() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
      return DEFAULT_EXPENSES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read local expenses:", err);
    return DEFAULT_EXPENSES;
  }
}

function getLocalCategories() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read local categories:", err);
    return DEFAULT_CATEGORIES;
  }
}

// Hoisted Set of default category labels (lowercased) to prevent re-allocating a Set on every subscription snapshot
const DEFAULT_CATEGORY_LABELS_SET = new Set(DEFAULT_CATEGORIES.map(c => c.label.toLowerCase()));

/** Merge default categories with custom categories ensuring no duplicate labels */
function mergeCategories(customCategories) {
  const merged = [...DEFAULT_CATEGORIES];

  for (const cat of customCategories) {
    if (cat.label && !DEFAULT_CATEGORY_LABELS_SET.has(cat.label.toLowerCase())) {
      merged.push(cat);
    }
  }
  return merged;
}

/** Subscribe to Categories */
export function subscribeToCategories(callback) {
  if (isFirebaseConfigured && db) {
    const catRef = collection(db, "categories");
    return onSnapshot(catRef, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(mergeCategories(cats));
    }, (err) => {
      console.error("Firestore categories error:", err);
      callback(mergeCategories(getLocalCategories()));
    });
  } else {
    callback(mergeCategories(getLocalCategories()));
    const handleStorage = (e) => {
      if (!e || !e.key || e.key === LOCAL_STORAGE_KEY_CATEGORIES) {
        callback(mergeCategories(getLocalCategories()));
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(STORE_UPDATE_CATEGORIES, handleStorage);
    return () => {
      // Unbind storage and fine-grained custom event listener to prevent leaks
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STORE_UPDATE_CATEGORIES, handleStorage);
    };
  }
}

/** Add new Category */
export async function addCategory(categoryData) {
  const label = categoryData.label.trim();
  if (!label) return null;

  if (isFirebaseConfigured && db) {
    try {
      const catRef = collection(db, "categories");
      const docRef = await addDoc(catRef, {
        label,
        color: categoryData.color || 'blue',
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, label, color: categoryData.color || 'blue' };
    } catch (err) {
      console.warn("Firestore addCategory failed, falling back to local storage:", err);
    }
  }

  const categories = getLocalCategories();
  const existing = categories.find(c => c.label.toLowerCase() === label.toLowerCase());
  if (existing) return existing;

  const newCat = {
    id: 'cat-' + Date.now(),
    label,
    color: categoryData.color || 'blue',
    createdAt: new Date().toISOString()
  };
  categories.push(newCat);
  localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  notifyLocalChange(STORE_UPDATE_CATEGORIES);
  return newCat;
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
    const handleStorage = (e) => {
      if (!e || !e.key || e.key === LOCAL_STORAGE_KEY_EVENTS) {
        callback(getLocalEvents());
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(STORE_UPDATE_EVENTS, handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STORE_UPDATE_EVENTS, handleStorage);
    };
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
    const handleStorage = (e) => {
      if (!e || !e.key || e.key === LOCAL_STORAGE_KEY_EXPENSES) {
        filterAndSend();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(STORE_UPDATE_EXPENSES, handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STORE_UPDATE_EXPENSES, handleStorage);
    };
  }
}

/** Add new Event */
export async function addEvent(eventData) {
  if (isFirebaseConfigured && db) {
    try {
      const eventsRef = collection(db, "events");
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.warn("Firestore addEvent failed, falling back to local storage:", err);
    }
  }

  const events = getLocalEvents();
  const newEvent = {
    id: 'event-' + Date.now(),
    ...eventData,
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);
  localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
  notifyLocalChange(STORE_UPDATE_EVENTS);
  return newEvent.id;
}

/** Update Event */
export async function updateEvent(eventId, updateData) {
  if (isFirebaseConfigured && db) {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, updateData);
      return;
    } catch (err) {
      console.warn("Firestore updateEvent failed, falling back to local storage:", err);
    }
  }

  const events = getLocalEvents().map(e => e.id === eventId ? { ...e, ...updateData } : e);
  localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
  notifyLocalChange(STORE_UPDATE_EVENTS);
}

/** Delete Event */
export async function deleteEvent(eventId) {
  if (isFirebaseConfigured && db) {
    try {
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);
      return;
    } catch (err) {
      console.warn("Firestore deleteEvent failed, falling back to local storage:", err);
    }
  }

  const events = getLocalEvents().filter(e => e.id !== eventId);
  const expenses = getLocalExpenses().filter(e => e.eventId !== eventId);
  localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  notifyLocalChange(STORE_UPDATE_EVENTS);
  notifyLocalChange(STORE_UPDATE_EXPENSES);
}

/** Add Expense */
export async function addExpense(eventId, expenseData) {
  if (isFirebaseConfigured && db) {
    try {
      const expensesRef = collection(db, "events", eventId, "expenses");
      const docRef = await addDoc(expensesRef, {
        ...expenseData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.warn("Firestore addExpense failed, falling back to local storage:", err);
    }
  }

  const expenses = getLocalExpenses();
  const newExpense = {
    id: 'exp-' + Date.now(),
    eventId,
    ...expenseData,
    createdAt: new Date().toISOString()
  };
  expenses.push(newExpense);
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  notifyLocalChange(STORE_UPDATE_EXPENSES);
  return newExpense.id;
}

/** Update Expense */
export async function updateExpense(eventId, expenseId, updateData) {
  if (isFirebaseConfigured && db) {
    try {
      const expenseRef = doc(db, "events", eventId, "expenses", expenseId);
      await updateDoc(expenseRef, updateData);
      return;
    } catch (err) {
      console.warn("Firestore updateExpense failed, falling back to local storage:", err);
    }
  }

  const expenses = getLocalExpenses().map(exp =>
    exp.id === expenseId ? { ...exp, ...updateData } : exp
  );
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  notifyLocalChange(STORE_UPDATE_EXPENSES);
}

/** Delete Expense */
export async function deleteExpense(eventId, expenseId) {
  if (isFirebaseConfigured && db) {
    try {
      const expenseRef = doc(db, "events", eventId, "expenses", expenseId);
      await deleteDoc(expenseRef);
      return;
    } catch (err) {
      console.warn("Firestore deleteExpense failed, falling back to local storage:", err);
    }
  }

  const expenses = getLocalExpenses().filter(exp => exp.id !== expenseId);
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  notifyLocalChange(STORE_UPDATE_EXPENSES);
}
