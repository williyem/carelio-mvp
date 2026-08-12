import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <Card className="border border-gray-100 shadow-none rounded-2xl bg-white border-dashed">
      <CardContent className="h-[200px] flex flex-col items-center justify-center text-center space-y-4">
        {icon}
        <p className="text-gray-500 font-normal">{message}</p>
      </CardContent>
    </Card>
  );
}
export default EmptyState;
