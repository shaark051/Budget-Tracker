import React from 'react';

// Notion color mappings
export const CATEGORY_COLOR_MAP = {
  'Venue & Location': 'bg-[#E7F3F8] text-[#1D4ED8] dark:bg-[#183347] dark:text-[#60A5FA]',
  'Catering & Food': 'bg-[#EDF3EC] text-[#15803D] dark:bg-[#1C3829] dark:text-[#4ADE80]',
  'Decor & Staging': 'bg-[#F7EEF3] text-[#BE185D] dark:bg-[#3B1827] dark:text-[#F472B6]',
  'Marketing & Media': 'bg-[#F1F0F7] text-[#6B21A8] dark:bg-[#2B1E3A] dark:text-[#C084FC]',
  'AV & Tech Support': 'bg-[#FAEBDD] text-[#C2410C] dark:bg-[#49290E] dark:text-[#F97316]',
  'Travel & Logistics': 'bg-[#FBF3DB] text-[#854D0E] dark:bg-[#403512] dark:text-[#FACC15]',
  'Entertainment & Speakers': 'bg-[#F4EEEE] text-[#78350F] dark:bg-[#43291F] dark:text-[#D97706]',
  'Miscellaneous': 'bg-[#F1F1EF] text-[#5A5A5A] dark:bg-[#373737] dark:text-[#9B9B9B]',
  'blue': 'bg-[#E7F3F8] text-[#1D4ED8] dark:bg-[#183347] dark:text-[#60A5FA]',
  'green': 'bg-[#EDF3EC] text-[#15803D] dark:bg-[#1C3829] dark:text-[#4ADE80]',
  'pink': 'bg-[#F7EEF3] text-[#BE185D] dark:bg-[#3B1827] dark:text-[#F472B6]',
  'purple': 'bg-[#F1F0F7] text-[#6B21A8] dark:bg-[#2B1E3A] dark:text-[#C084FC]',
  'orange': 'bg-[#FAEBDD] text-[#C2410C] dark:bg-[#49290E] dark:text-[#F97316]',
  'yellow': 'bg-[#FBF3DB] text-[#854D0E] dark:bg-[#403512] dark:text-[#FACC15]',
  'brown': 'bg-[#F4EEEE] text-[#78350F] dark:bg-[#43291F] dark:text-[#D97706]',
  'gray': 'bg-[#F1F1EF] text-[#5A5A5A] dark:bg-[#373737] dark:text-[#9B9B9B]',
};

// Vibrant palette array for deterministic fallback hashing
const VIBRANT_COLOR_CLASSES = [
  CATEGORY_COLOR_MAP['blue'],
  CATEGORY_COLOR_MAP['green'],
  CATEGORY_COLOR_MAP['pink'],
  CATEGORY_COLOR_MAP['purple'],
  CATEGORY_COLOR_MAP['orange'],
  CATEGORY_COLOR_MAP['yellow'],
  CATEGORY_COLOR_MAP['brown'],
];

const STATUS_COLOR_MAP = {
  'Paid': 'bg-[#EDF3EC] text-[#15803D] dark:bg-[#1C3829] dark:text-[#4ADE80] border-[#C3E2C2] dark:border-[#27533B]',
  'Pending': 'bg-[#FBF3DB] text-[#854D0E] dark:bg-[#403512] dark:text-[#FACC15] border-[#F5E6B3] dark:border-[#5E4D1A]',
  'Approved': 'bg-[#E7F3F8] text-[#1D4ED8] dark:bg-[#183347] dark:text-[#60A5FA] border-[#C6E4F0] dark:border-[#254B68]',
  'Cancelled': 'bg-[#FDEBEC] text-[#B91C1C] dark:bg-[#3E1B18] dark:text-[#F87171] border-[#F8C9CB] dark:border-[#5C2B27]',
};

function hashStringToIndex(str, max) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export const CategoryBadge = React.memo(function CategoryBadge({ category, color }) {
  let colorClass = CATEGORY_COLOR_MAP[category] || (color && CATEGORY_COLOR_MAP[color]);

  if (!colorClass) {
    const idx = hashStringToIndex(category || 'default', VIBRANT_COLOR_CLASSES.length);
    colorClass = VIBRANT_COLOR_CLASSES[idx];
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} transition-colors`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" />
      {category}
    </span>
  );
});

export const StatusBadge = React.memo(function StatusBadge({ status }) {
  const colorClass = STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP['Pending'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${colorClass} transition-colors`}>
      {status}
    </span>
  );
});


}
