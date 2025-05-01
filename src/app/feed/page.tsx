import { Suspense } from 'react';
import { FeedContent } from './FeedContent';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FeedPage() {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Doggy date suggestions</h1>
      
      <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border">
        <div className="p-4">
          <Suspense fallback={<FeedSkeleton />}>
            <FeedContent />
          </Suspense>
        </div>
      </ScrollArea>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-96 rounded-md bg-muted animate-pulse" />
      ))}
    </div>
  );
}