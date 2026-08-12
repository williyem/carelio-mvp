'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronRight,
  User as UserIcon,
  X,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSearchPatients } from '@/integration/patient';
import { useDebounce } from '@/hooks/use-debounce';

export function PatientSearch() {
  const [query, setQuery] = React.useState('');

  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useSearchPatients(
    debouncedQuery ? { search: debouncedQuery, limit: 10 } : undefined,
    !!debouncedQuery
  );

  const results = debouncedQuery ? data?.docs || [] : [];

  return (
    <div className="relative w-full space-y-4">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-500 transition-colors" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient by name or ID"
          className="h-14 pl-12 pr-12 rounded-[100px] bg-(--bg-input) border-(--border-input) text-sm transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-blue"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border border-gray-100/50 rounded-2xl overflow-hidden p-0 bg-white animate-in fade-in slide-in-from-top-2 duration-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
                <p className="text-gray-500 font-medium">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {results.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/dashboard/patient/${patient.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border border-blue-50">
                          <AvatarFallback className="bg-blue-50 text-brand-blue">
                            <UserIcon className="h-7 w-7" strokeWidth={1.5} />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">
                          {patient.fullName || patient.patientId}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {patient?.email || patient?.phoneNumber}
                        </p>
                        {patient?.isRegistrationComplete ? null : (
                          <p className="text-xs text-red-500 mt-1">
                            Registration Incomplete
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <Search className="h-6 w-6" />
                </div>
                <p className="text-gray-900 font-medium">No patients found</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
