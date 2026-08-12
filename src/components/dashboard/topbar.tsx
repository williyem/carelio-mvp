'use client';

import Image from 'next/image';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function TopBar() {
  return (
    <header className="flex items-center justify-between w-full h-20 px-8 bg-white dark:bg-card border-b border-gray-100 dark:border-border">
      {/* Greeting / Breadcrumbs */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 dark:text-foreground">
          Good Morning, <span className="text-brand-blue">Dr. Ibrahim</span>
        </h1>
        <p className="text-sm text-gray-500 font-normal">
          Have a nice day at work
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-10 h-10 rounded-full bg-gray-50 border-transparent focus:bg-white transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-50 transition-colors">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-100 ml-2">
          <div className="flex flex-col items-end text-sm">
            <span className="font-semibold text-gray-900">Dr. Ibrahim</span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-gray-50">
            <Image
              src="/images/doctor.jpg"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
