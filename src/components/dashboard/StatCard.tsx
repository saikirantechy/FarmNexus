'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  href?: string;
  badge?: string;
  badgeColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-emerald-100',
  iconColor = 'text-emerald-700',
  href,
  badge,
  badgeColor = 'bg-emerald-50 text-emerald-700',
}: StatCardProps) {
  const content = (
    <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 block leading-tight">{title}</span>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans">
          {value}
        </div>
        {subtitle && <p className="text-[11px] text-gray-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}
