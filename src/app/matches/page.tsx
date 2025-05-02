'use client';

import { Suspense } from 'react';
import { getAcceptedMatches } from './actions';
import { MatchCard } from '@/components/MatchCard';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

function MatchesSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
      ))}
    </div>
  );
}

function MatchesContent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['acceptedMatches'],
    queryFn: async () => {
      const result = await getAcceptedMatches();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  if (isLoading) {
    return <MatchesSkeleton />;
  }

  if (error) {
    toast.error('Failed to load matches', {
      description: error instanceof Error ? error.message : 'Unknown error',
    });
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-semibold mb-2">Failed to load matches</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
        <p className="text-muted-foreground">When you and another user both match, they'll appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((match) => (
        <MatchCard key={match.user.id} match={match} />
      ))}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
      <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2">
        <Suspense fallback={<MatchesSkeleton />}>
          <MatchesContent />
        </Suspense>
      </div>
    </div>
  );
}