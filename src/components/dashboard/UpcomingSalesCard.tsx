'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee } from '@/lib/calculations';
import { BadgeIndianRupee, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpcomingSalesCardProps {
  onOpenAddSale?: () => void;
}

export function UpcomingSalesCard({ onOpenAddSale }: UpcomingSalesCardProps) {
  const { t } = useLanguage();
  const { sales, markSaleReceived } = useFarmStore();

  const pendingSales = sales.filter((s) => s.paymentStatus === 'pending' || s.amountPending > 0);

  const totalPendingBoxes = pendingSales.reduce((acc, s) => acc + (s.boxes || 0), 0);
  const totalPendingAmount = pendingSales.reduce((acc, s) => acc + (s.amountPending || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
            <BadgeIndianRupee className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">{t.upcomingSales}</h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Receivables due from buyers & merchants
            </p>
          </div>
        </div>

        {onOpenAddSale && (
          <button
            onClick={onOpenAddSale}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addSale}</span>
          </button>
        )}
      </div>

      {/* List */}
      {pendingSales.length === 0 ? (
        <div className="py-6 text-center bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium flex flex-col items-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mb-1" />
          <span>All crop sales collected! No pending receivables.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {pendingSales.map((s, idx) => (
            <div
              key={s.id}
              className="p-3 bg-gray-50/80 hover:bg-blue-50/40 rounded-xl border border-gray-100 transition flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-gray-900">
                    {s.boxes} boxes × ₹{s.pricePerUnit}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    Pending
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {s.buyerName} • {s.marketName || 'Mandi'} ({s.saleDate})
                </p>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-sm font-black text-blue-900 block leading-tight">
                    {formatRupee(s.amountPending)}
                  </span>
                  <span className="text-[10px] text-gray-400">Gross: {formatRupee(s.grossAmount)}</span>
                </div>

                <button
                  onClick={() => markSaleReceived(s.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm transition whitespace-nowrap"
                  title="Click when money is received in bank/cash"
                >
                  ✓ Received
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {pendingSales.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-600">
            Total Expected ({totalPendingBoxes} boxes):
          </span>
          <span className="font-black text-base text-blue-900">
            {formatRupee(totalPendingAmount)}
          </span>
        </div>
      )}
    </div>
  );
}
