import React from 'react';
import { Skeleton, EmptyState } from './EmptyState';

export function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "No record entries found.",
  className = ''
}) {
  return (
    <div className={`sb-glass-card rounded-2xl border border-slate-800 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {isLoading ? (
              [...Array(4)].map((_, r) => (
                <tr key={r}>
                  {columns.map((_, c) => (
                    <td key={c} className="p-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <EmptyState title="No Records" description={emptyMessage} className="border-0 bg-transparent p-0" />
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/50 transition">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`p-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.render ? col.render(row, rIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = ''
}) {
  return (
    <div className={`flex items-center space-x-1 border-b border-slate-800 overflow-x-auto pb-1 ${className}`}>
      {tabs.map((tab) => {
        const id = tab.id || tab;
        const label = tab.label || tab;
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
