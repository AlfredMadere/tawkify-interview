'use client';

import { useQuery } from '@tanstack/react-query';
import { getPotentialMatches } from './actions';
import { MatchCard } from '@/components/MatchCard';
import { toast } from 'sonner';
import { PotentialMatch, User } from '@/types';
import { getVictimUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FeedContent() {
  // Fetch the current user to display their preferences
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await getVictimUser();
      return user;
    },
  });

  // Fetch potential matches
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



  // Render user preferences card
  const renderUserPreferences = () => {
    if (isLoadingUser || !currentUser) {
      return null;
    }

    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Dog Age Range</h4>
              <p className="text-muted-foreground">{currentUser.minAge} - {currentUser.maxAge} years</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Dog Weight Range</h4>
              <p className="text-muted-foreground">{currentUser.minWeight} - {currentUser.maxWeight} lbs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
    <div>
      {renderUserPreferences()}
      <div className="space-y-6">
        {data.map((match: PotentialMatch) => (
          <MatchCard 
            key={`${match.user.id}-${match.dog.id}`} 
            match={match} 
            onAccept={() => { }}
          />
        ))}
      </div>
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
