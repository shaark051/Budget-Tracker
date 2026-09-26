import React, { useMemo } from 'react';
import { Wallet, PieChart, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, CategoryBadge } from './Badges';

// Wrapped with React.memo to avoid re-calculating or re-rendering when parent state (e.g., dark mode toggle) changes
export const AnalyticsSummary = React.memo(function AnalyticsSummary({ currentEvent, expenses }) {
  if (!currentEvent) return null;

  const currency = currentEvent.currency || 'USD';
  const totalBudget = parseFloat(currentEvent.budget) || 0;

  // Single-pass computation of totalSpent, paidTotal, pendingTotal, totalAdvance, totalRemainingDue, and category breakdown.
  // Reduces array iterations from 4N to 1N and eliminates temporary array allocations.
  const { totalSpent, paidTotal, pendingTotal, totalAdvance, totalRemainingDue, categorySorted } = useMemo(() => {
    let spentSum = 0;
    let paidSum = 0;
    let pendingSum = 0;
    let advanceSum = 0;
    let remainingDueSum = 0;
    const catMap = {};

    for (let i = 0; i < expenses.length; i++) {
      const exp = expenses[i];
      const amount = parseFloat(exp.amount) || 0;
      const advance = Math.min(amount, Math.max(0, parseFloat(exp.advanceAmount) || 0));
      const remainingForExp = Math.max(0, amount - advance);

      spentSum += amount;
      advanceSum += advance;
      remainingDueSum += remainingForExp;

      if (exp.status === 'Paid') {
        paidSum += amount;
      } else if (exp.status === 'Pending') {
        pendingSum += amount;
      }

      const cat = exp.category || 'Miscellaneous';
      catMap[cat] = (catMap[cat] || 0) + amount;
    }

    const sortedCats = Object.entries(catMap)
      .map(([cat, amount]) => ({
        cat,
        amount,
        pct: spentSum > 0 ? (amount / spentSum) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSpent: spentSum,
      paidTotal: paidSum,
      pendingTotal: pendingSum,
      totalAdvance: advanceSum,
      totalRemainingDue: remainingDueSum,
      categorySorted: sortedCats,
    };
  }, [expenses]);

  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const isOverBudget = remaining < 0;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Budget Card */}
        <div className="bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl p-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-3">
            <span>TOTAL BUDGET</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#37352F] dark:text-[#D4D4D4]">
            {formatCurrency(totalBudget, currency)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Allocated event funds
          </p>
        </div>

        {/* Total Spent Card */}
        <div className="bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl p-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-3">
            <span>TOTAL EXPENSES</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#37352F] dark:text-[#D4D4D4]">
            {formatCurrency(totalSpent, currency)}
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-[#2F2F2F] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-black dark:bg-white'}`}
              style={{ width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Balance Card */}
        <div className="bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl p-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-3">
            <span>REMAINING BALANCE</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isOverBudget
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
            }`}>
              {isOverBudget ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-[#37352F] dark:text-[#D4D4D4]'}`}>
            {formatCurrency(remaining, currency)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isOverBudget ? 'Over budget limit!' : `${100 - spentPercent}% remaining`}
          </p>
        </div>

        {/* Payment Breakdown Card */}
        <div className="bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl p-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-3">
            <span>VENDOR ADVANCES & DUE</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Advance Paid</span>
              <span className="font-mono font-semibold text-[#37352F] dark:text-[#D4D4D4]">{formatCurrency(totalAdvance, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-700 dark:text-amber-400 font-medium">Remaining Due</span>
              <span className="font-mono font-semibold text-[#37352F] dark:text-[#D4D4D4]">{formatCurrency(totalRemainingDue, currency)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Category Spending Bar Visualizer */}
      {categorySorted.length > 0 && (
        <section
          aria-label="Category spending breakdown"
          className="bg-[#F7F6F3] dark:bg-[#202020] border border-[#E3E2E0] dark:border-[#2F2F2F] rounded-2xl p-5"
        >
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">
            Category Breakdown
          </h4>

          {/* Multi-segment progress bar */}
          <div
            role="region"
            aria-label="Category spending proportion bar"
            className="w-full h-3 bg-gray-200 dark:bg-[#2F2F2F] rounded-full overflow-hidden flex mb-4"
          >
            {categorySorted.map((item, idx) => (
              <div
                key={item.cat}
                role="progressbar"
                aria-valuenow={Math.round(item.pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${item.cat}: ${formatCurrency(item.amount, currency)}, ${Math.round(item.pct)}% of total expenses`}
                style={{ width: `${item.pct}%` }}
                title={`${item.cat}: ${formatCurrency(item.amount, currency)} (${Math.round(item.pct)}%)`}
                className={`h-full transition-all duration-300 ${
                  idx % 5 === 0 ? 'bg-blue-500' :
                  idx % 5 === 1 ? 'bg-emerald-500' :
                  idx % 5 === 2 ? 'bg-purple-500' :
                  idx % 5 === 3 ? 'bg-amber-500' : 'bg-pink-500'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categorySorted.map((item) => (
              <div
                key={item.cat}
                className="flex items-center space-x-2 bg-white dark:bg-[#191919] border border-[#E3E2E0] dark:border-[#2F2F2F] px-3 py-1.5 rounded-lg text-xs"
              >
                <CategoryBadge category={item.cat} />
                <span className="font-mono font-semibold text-[#37352F] dark:text-[#D4D4D4]">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="text-gray-400 text-[10px]">
                  ({Math.round(item.pct)}%)
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});
