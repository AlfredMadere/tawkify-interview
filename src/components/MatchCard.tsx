'use client';

import { PotentialMatch } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createMatch } from '@/app/feed/actions';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MatchCardProps {
  match: PotentialMatch;
  onAccept?: (matchId: string) => void;
}

export function MatchCard({ match, onAccept }: MatchCardProps) {
  const { user, dog } = match;

  const { mutate: handleCreateMatch, isPending } = useMutation({
    mutationFn: async () => {
      const result = await createMatch(user.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(`You've matched with ${user.name} and their dog ${dog.name}`, {
        description: 'Match created!'
      });
      if (onAccept) {
        onAccept(data.matchId);
      }
    },
    onError: (error) => {
      toast.error('Failed to create match', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
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
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Age preference:</span>
                <span className="ml-1">{user.minAge}-{user.maxAge} years</span>
              </div>
              <div>
                <span className="text-muted-foreground">Weight preference:</span>
                <span className="ml-1">{user.minWeight}-{user.maxWeight} lbs</span>
              </div>
            </div>
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
            
            <div className="mt-2">
              <p className="text-sm">{dog.description || 'No description provided'}</p>
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
          onClick={() => handleCreateMatch()} 
          disabled={isPending} 
          className="w-full"
        >
          {isPending ? 'Matching...' : 'Match with them!'}
        </Button>
      </CardFooter>
    </Card>
  );
}
