'use client';

import { useQuery } from '@tanstack/react-query';
import { getPotentialMatches } from './actions';
import { MatchCard } from '@/components/MatchCard';
import { toast } from 'sonner';
import { PotentialMatch } from '@/types';

export function FeedContent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['potentialMatches'],
    queryFn: async () => {
      const result = await getPotentialMatches();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  // Handle successful match
  const handleMatchAccepted = (matchId: string) => {
    toast.success(`Match created with ID: ${matchId}`);
  };

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-destructive text-4xl mb-4">😕</div>
        <h3 className="text-xl font-semibold mb-2">Failed to load matches</h3>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try again
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-4xl mb-4">🐕</div>
        <h3 className="text-xl font-semibold mb-2">No matches found</h3>
        <p className="text-muted-foreground">
          We couldn't find any potential matches for you at the moment.
          <br />
          Check back later or adjust your preferences.
        </p>
      </div>
    );
  }

  // Show matches
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((match: PotentialMatch) => (
        <MatchCard 
          key={`${match.user.id}-${match.dog.id}`} 
          match={match} 
          onAccept={handleMatchAccepted}
        />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-96 rounded-md bg-muted animate-pulse" />
      ))}
    </div>
  );
}
