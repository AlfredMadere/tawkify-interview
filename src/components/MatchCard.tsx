'use client';

import { PotentialMatch, User, Dog } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createMatch } from '@/app/feed/actions';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getVictimUser } from '@/lib/auth';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface MatchCardProps {
  match: PotentialMatch;
  onAccept?: (matchId: string) => void;
}

export function MatchCard({ match, onAccept }: MatchCardProps) {
  const { user, dog } = match;
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Fetch the current user to compare preferences
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await getVictimUser();
      return user;
    },
  });
  
  // Helper functions to generate mismatch messages
  const getAgeMismatchMessage = (currentUser: User, currentUserDog: Dog | null, otherUser: User, otherDog: Dog) => {
    // Check if your dog's age is outside their preferences
    if (currentUserDog && (currentUserDog.age < otherUser.minAge || currentUserDog.age > otherUser.maxAge)) {
      const ageDiff = currentUserDog.age < otherUser.minAge 
        ? otherUser.minAge - currentUserDog.age
        : currentUserDog.age - otherUser.maxAge;
      
      const direction = currentUserDog.age < otherUser.minAge ? 'younger' : 'older';
      return `Your dog ${currentUserDog.name} is ${ageDiff} ${ageDiff === 1 ? 'year' : 'years'} ${direction} than ${otherUser.name} prefers.`;
    }
    
    // Check if their dog's age is outside your preferences
    if (otherDog.age < currentUser.minAge || otherDog.age > currentUser.maxAge) {
      const ageDiff = otherDog.age < currentUser.minAge 
        ? currentUser.minAge - otherDog.age
        : otherDog.age - currentUser.maxAge;
      
      const direction = otherDog.age < currentUser.minAge ? 'younger' : 'older';
      return `${otherDog.name} is ${ageDiff} ${ageDiff === 1 ? 'year' : 'years'} ${direction} than your preferred age range.`;
    }
    
    return null;
  };
  
  const getWeightMismatchMessage = (currentUser: User, currentUserDog: Dog | null, otherUser: User, otherDog: Dog) => {
    // Check if your dog's weight is outside their preferences
    if (currentUserDog && (currentUserDog.weight < otherUser.minWeight || currentUserDog.weight > otherUser.maxWeight)) {
      const weightDiff = currentUserDog.weight < otherUser.minWeight 
        ? otherUser.minWeight - currentUserDog.weight
        : currentUserDog.weight - otherUser.maxWeight;
      
      const direction = currentUserDog.weight < otherUser.minWeight ? 'lighter' : 'heavier';
      return `Your dog ${currentUserDog.name} is ${weightDiff} lbs ${direction} than ${otherUser.name} prefers.`;
    }
    
    // Check if their dog's weight is outside your preferences
    if (otherDog.weight < currentUser.minWeight || otherDog.weight > currentUser.maxWeight) {
      const weightDiff = otherDog.weight < currentUser.minWeight 
        ? currentUser.minWeight - otherDog.weight
        : otherDog.weight - currentUser.maxWeight;
      
      const direction = otherDog.weight < currentUser.minWeight ? 'lighter' : 'heavier';
      return `${otherDog.name} is ${weightDiff} lbs ${direction} than your preferred weight range.`;
    }
    
    return null;
  };

  // Get the current user's dog from the user object
  const currentUserDog = currentUser?.dog || null;

  // Calculate compatibility if current user is available
  const compatibility = currentUser && currentUserDog ? {
    // Age compatibility
    ageMatch: {
      // Your dog's age matches their preferences
      yourDogMatchesTheirPrefs: currentUserDog.age >= user.minAge && currentUserDog.age <= user.maxAge,
      // Their dog's age matches your preferences
      theirDogMatchesYourPrefs: dog.age >= currentUser.minAge && dog.age <= currentUser.maxAge,
      // Get mismatch message if any
      mismatchMessage: getAgeMismatchMessage(currentUser, currentUserDog, user, dog),
    },
    // Weight compatibility
    weightMatch: {
      // Your dog's weight matches their preferences
      yourDogMatchesTheirPrefs: currentUserDog.weight >= user.minWeight && currentUserDog.weight <= user.maxWeight,
      // Their dog's weight matches your preferences
      theirDogMatchesYourPrefs: dog.weight >= currentUser.minWeight && dog.weight <= currentUser.maxWeight,
      // Get mismatch message if any
      mismatchMessage: getWeightMismatchMessage(currentUser, currentUserDog, user, dog),
    },
    // Overall compatibility
    isPerfectMatch: function() {
      return this.ageMatch.yourDogMatchesTheirPrefs && 
             this.ageMatch.theirDogMatchesYourPrefs && 
             this.weightMatch.yourDogMatchesTheirPrefs && 
             this.weightMatch.theirDogMatchesYourPrefs;
    }
  } : null;

  // Determine the match state
  const hasMatch = match.match && match.match.id !== '';
  const isAccepted = hasMatch && match.match.accepted;
  
  // Handle setup date click
  const handleSetupDate = () => {
    router.push(`/matches/${match.match.id}/setup-date`);
  };

  const { mutate: handleCreateMatch, isPending } = useMutation({
    mutationFn: async () => {
      const result = await createMatch(user.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    // Optimistic update - immediately update the UI before server confirmation
    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['potentialMatches'] });
      
      // Snapshot the previous value
      const previousMatches = queryClient.getQueryData(['potentialMatches']);
      
      // Optimistically update the match in the UI
      queryClient.setQueryData(['potentialMatches'], (old: any) => {
        if (!old) return old;
        
        return old.map((potentialMatch: PotentialMatch) => {
          if (potentialMatch.user.id === user.id) {
            return {
              ...potentialMatch,
              match: {
                ...potentialMatch.match,
                id: 'temp-id-' + Date.now(), // Temporary ID until we get the real one
                userId: match.match.userId,
                matchedWithId: user.id,
                accepted: false
              }
            };
          }
          return potentialMatch;
        });
      });
      
      // Return the snapshot so we can rollback if something goes wrong
      return { previousMatches };
    },
    onSuccess: (data) => {
      // Update the cache with the actual data from the server
      queryClient.setQueryData(['potentialMatches'], (old: any) => {
        if (!old) return old;
        
        return old.map((potentialMatch: PotentialMatch) => {
          if (potentialMatch.user.id === user.id) {
            return {
              ...potentialMatch,
              match: data.match
            };
          }
          return potentialMatch;
        });
      });
      
      // Show different toast messages based on match status
      if (data.match.accepted) {
        toast.success(`It's a match with ${user.name} and ${dog.name}!`, {
          description: 'You both matched with each other!'
        });
      } else {
        toast.success(`You've sent a match request to ${user.name} and ${dog.name}`, {
          description: 'Match request sent!'
        });
      }
      
      if (onAccept) {               
        onAccept(data.matchId);
      }
    },
    onError: (error, _, context) => {
      // Rollback to the previous state if the mutation fails
      if (context?.previousMatches) {
        queryClient.setQueryData(['potentialMatches'], context.previousMatches);
      }
      
      toast.error('Failed to create match', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    },
    // Always refetch after error or success to make sure our local data is in sync with the server
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ['potentialMatches'] });
    },
  });

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.age} years old • {user.gender}</p>
          </div>
          <div className="flex justify-end">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {/* User Info */}
          <div>
            <h4 className="text-sm font-medium">About {user.name}</h4>
            <p className="text-sm mt-1">{user.bio || 'No bio provided'}</p>
            {/* Age and weight preferences moved to dog info section */}
          </div>
          
          
          {/* Divider */}
          <div className="border-t border-border" />
          
          {/* Dog Info */}
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium">{dog.name}</h4>
                <p className="text-xs text-muted-foreground">{dog.breed} • {dog.age} years old • {dog.sex}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xl">🐶</span>
              </div>
            </div>
            
            <div className="mt-2 space-y-2">
              <p className="text-sm">{dog.description || 'No description provided'}</p>
              <p className="text-sm text-muted-foreground">
                {dog.name} is most comfortable around dogs between {user.minAge} and {user.maxAge} years old, weighing between {user.minWeight} and {user.maxWeight} lbs.
              </p>
              {/* Compatibility Information */}
              {compatibility && (
                <div className="rounded-md bg-muted/50 p-3 mt-3">
                  <h4 className="text-sm font-medium mb-2">Match Compatibility</h4>
                  <div className="space-y-2 text-xs">
                    {/* Age compatibility */}
                    <div className="flex items-center justify-between">
                      <span>Age compatibility</span>
                      {compatibility.ageMatch.yourDogMatchesTheirPrefs && compatibility.ageMatch.theirDogMatchesYourPrefs ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    
                    {/* Weight compatibility */}
                    <div className="flex items-center justify-between">
                      <span>Weight compatibility</span>
                      {compatibility.weightMatch.yourDogMatchesTheirPrefs && compatibility.weightMatch.theirDogMatchesYourPrefs ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    
                    {/* Mismatch messages */}
                    {(!compatibility.ageMatch.yourDogMatchesTheirPrefs || 
                      !compatibility.ageMatch.theirDogMatchesYourPrefs || 
                      !compatibility.weightMatch.yourDogMatchesTheirPrefs || 
                      !compatibility.weightMatch.theirDogMatchesYourPrefs) && (
                      <div className="text-muted-foreground mt-3 space-y-1 bg-background/50 p-2 rounded">
                        <h5 className="font-medium text-foreground">Compatibility Notes:</h5>
                        {compatibility.ageMatch.mismatchMessage && (
                          <div className="text-amber-600 dark:text-amber-400">{compatibility.ageMatch.mismatchMessage}</div>
                        )}
                        {compatibility.weightMatch.mismatchMessage && (
                          <div className="text-amber-600 dark:text-amber-400">{compatibility.weightMatch.mismatchMessage}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
            
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Person Friendliness</p>
                <div className="flex items-center">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${dog.personFriendliness * 10}%` }}></div>
                  <span className="ml-2 text-xs">{dog.personFriendliness}/10</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Dog Friendliness</p>
                <div className="flex items-center">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${dog.dogFriendliness * 10}%` }}></div>
                  <span className="ml-2 text-xs">{dog.dogFriendliness}/10</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="mr-2">
                {dog.weight} lbs
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => isAccepted ? handleSetupDate() : handleCreateMatch()} 
          disabled={isPending || (hasMatch && !isAccepted && !isPending)} 
          className="w-full cursor-pointer"
          variant={isAccepted ? "secondary" : "default"}
        >
          {isPending ? 'Matching...' : 
           isAccepted ? "Setup a doggy date" : 
           hasMatch ? "Match sent" : 
           "Match with them!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
