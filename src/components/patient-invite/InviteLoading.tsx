import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function InviteLoading() {
  return (
    <Card className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) ">
      <CardHeader>
        <div className="relative w-full h-72">
          <Skeleton className="absolute w-full h-full rounded-20" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-7 w-2/3 rounded mb-2" />
        <Skeleton className="h-4 w-full max-w-lg rounded mb-4" />
        <Skeleton className="h-4 w-5/6 max-w-lg rounded mb-2" />
        <Skeleton className="h-4 w-3/4 max-w-lg rounded mb-2" />
        <Skeleton className="h-11 w-full rounded-10 mt-4" />
      </CardContent>
    </Card>
  );
}
