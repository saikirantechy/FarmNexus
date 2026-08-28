'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee } from '@/lib/calculations';
import { Package, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface RecentHarvestTableProps {
  onOpenAdd?: () => void;
  limit?: number;
}

export function RecentHarvestTable({ onOpenAdd, limit = 5 }: RecentHarvestTableProps) {
  const { t } = useLanguage();
  const { harvests, deleteHarvest, financialSummary } = useFarmStore();

  const displayHarvests = harvests.slice(0, limit);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">{t.recentHarvest}</h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Total: {financialSummary.totalHarvestBoxes} {t.boxes} ({financialSummary.totalHarvestBatches} batches)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenAdd && (
            <button
              onClick={onOpenAdd}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addHarvest}</span>
            </button>
          )}
          <Link
            href="/harvest"
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 p-1 flex items-center gap-0.5"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Table / List */}
      {displayHarvests.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-gray-500">{t.noHarvestYet}</p>
          {onOpenAdd && (
            <button
              onClick={onOpenAdd}
              className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg"
            >
              + {t.addHarvest}
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px]">
                <th className="pb-2 pl-1">Date</th>
                <th className="pb-2 text-right">Boxes</th>
                <th className="pb-2 text-right">Est. Price</th>
                <th className="pb-2 text-right">Est. Gross</th>
                <th className="pb-2 text-center">Grade</th>
                <th className="pb-2 pr-1 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayHarvests.map((h, idx) => {
                const estGross = h.estimatedGross || (h.boxes * (h.estimatedPricePerBox || 240));
                return (
                  <tr key={h.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-2.5 pl-1 font-medium text-gray-900 whitespace-nowrap">
                      {h.date}
                    </td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-800 text-sm">
                      {h.boxes}
                    </td>
                    <td className="py-2.5 text-right text-gray-600">
                      ₹{h.estimatedPricePerBox || 240}
                    </td>
                    <td className="py-2.5 text-right font-bold text-gray-900">
                      {formatRupee(estGross)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          h.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : h.grade === 'B'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {h.grade}
                      </span>
                    </td>
                    <td className="py-2.5 pr-1 text-right">
                      <button
                        onClick={() => deleteHarvest(h.id)}
                        className="text-gray-300 hover:text-rose-600 p-1 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {displayHarvests.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
          <span>Total Harvest Volume:</span>
          <span className="font-extrabold text-emerald-900 text-sm">
            {financialSummary.totalHarvestBoxes} {t.boxes} ({financialSummary.totalHarvestKg.toLocaleString('en-IN')} kg)
          </span>
        </div>
      )}
    </div>
  );
}
