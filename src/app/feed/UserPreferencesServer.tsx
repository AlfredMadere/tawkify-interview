'use server';

import { getVictimUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function UserPreferencesServer() {
  // Get the current user directly using the server function
  const currentUser = await getVictimUser();
  
  if (!currentUser) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      <Card>
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
      
      {currentUser.dog && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Dog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Name & Breed</h4>
                <p className="text-muted-foreground">{currentUser.dog.name}, {currentUser.dog.breed}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Age & Weight</h4>
                <p className="text-muted-foreground">{currentUser.dog.age} years, {currentUser.dog.weight} lbs</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Friendliness</h4>
                <p className="text-muted-foreground">People: {currentUser.dog.personFriendliness}/10, Dogs: {currentUser.dog.dogFriendliness}/10</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Sex</h4>
                <p className="text-muted-foreground">{currentUser.dog.sex}</p>
              </div>
            </div>
            {currentUser.dog.description && (
              <div className="mt-3">
                <h4 className="font-medium mb-1">About</h4>
                <p className="text-muted-foreground">{currentUser.dog.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
