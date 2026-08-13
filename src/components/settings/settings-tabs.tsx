'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SettingsTabItem {
  name: string;
  href: string;
}

export default function SettingsTabs({ tabs }: { tabs: SettingsTabItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="w-full mb-8">
      <ul className="flex flex-wrap gap-1 border-b border-(--border-stroke)">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== tabs[0]?.href && pathname.startsWith(tab.href));
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  '-mb-px inline-flex items-center border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
                )}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
