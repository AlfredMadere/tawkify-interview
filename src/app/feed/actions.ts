'use server';

import { PotentialMatch, ActionResult } from '@/types';
import { success, failure } from '@/lib/utils';
import { getVictimUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock data for development until we have real data
const MOCK_POTENTIAL_MATCHES: PotentialMatch[] = [
  {
    user: {
      id: '1',
      name: 'John Doe',
      bio: 'Dog lover and outdoor enthusiast',
      age: 28,
      gender: 'Male',
      minAge: 25,
      maxAge: 35,
      minWeight: 10,
      maxWeight: 50,
    },
    dog: {
      id: '101',
      name: 'Max',
      breed: 'Golden Retriever',
      age: 3,
      personFriendliness: 9,
      dogFriendliness: 8,
      weight: 30,
      sex: 'Male',
      description: 'Friendly and energetic dog who loves to play fetch',
    },
  },
  {
    user: {
      id: '2',
      name: 'Jane Smith',
      bio: 'Professional dog trainer',
      age: 32,
      gender: 'Female',
      minAge: 28,
      maxAge: 40,
      minWeight: 15,
      maxWeight: 60,
    },
    dog: {
      id: '102',
      name: 'Bella',
      breed: 'Border Collie',
      age: 4,
      personFriendliness: 7,
      dogFriendliness: 6,
      weight: 20,
      sex: 'Female',
      description: 'Intelligent and active dog who loves agility training',
    },
  },
  {
    user: {
      id: '3',
      name: 'Mike Johnson',
      bio: 'Hiking enthusiast with a playful pup',
      age: 35,
      gender: 'Male',
      minAge: 30,
      maxAge: 45,
      minWeight: 20,
      maxWeight: 70,
    },
    dog: {
      id: '103',
      name: 'Rocky',
      breed: 'German Shepherd',
      age: 5,
      personFriendliness: 8,
      dogFriendliness: 7,
      weight: 40,
      sex: 'Male',
      description: 'Loyal and protective dog who loves long walks',
    },
  },
];

/**
 * Fetches potential matches for the current user
 * @returns Promise<ActionResult<PotentialMatch[]>> List of potential matches
 */
export async function getPotentialMatches(): Promise<ActionResult<PotentialMatch[]>> {
  try {
    // Get the current user
    const currentUser = await getVictimUser();
    
    if (!currentUser) {
      return failure('User not found');
    }

    // For MVP, we'll use mock data instead of actual database queries
    // In a real implementation, we would query the database based on user preferences
    
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return success(MOCK_POTENTIAL_MATCHES);
    
    // The code below would be used once we have the proper database schema set up
    /*
    // Fetch users with dogs that match the current user's preferences
    const potentialMatches = await prisma.user.findMany({
      where: {
        // Exclude the current user
        id: { not: currentUser.id },
        // Match age preferences
        age: {
          gte: currentUser.minAge,
          lte: currentUser.maxAge,
        },
        // Must have a dog
        dog: {
          isNot: null,
        },
      },
      include: {
        dog: true,
      },
    });

    // Filter matches based on dog weight preferences
    const filteredMatches = potentialMatches.filter(user => {
      if (!user.dog) return false;
      
      return (
        user.dog.weight >= currentUser.minWeight &&
        user.dog.weight <= currentUser.maxWeight
      );
    });

    // Transform to the expected format
    const formattedMatches: PotentialMatch[] = filteredMatches.map(user => ({
      user: {
        id: user.id,
        name: user.name,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        minAge: user.minAge,
        maxAge: user.maxAge,
        minWeight: user.minWeight,
        maxWeight: user.maxWeight,
      },
      dog: user.dog!,
    }));

    return success(formattedMatches);
    */
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    return failure('Failed to fetch potential matches');
  }
}

/**
 * Creates a match with another user
 * @param matchedWithId ID of the user to match with
 * @returns Promise<ActionResult<{ matchId: string }>> Result of the match creation
 */
export async function createMatch(matchedWithId: string): Promise<ActionResult<{ matchId: string }>> {
  try {
    const currentUser = await getVictimUser();
    
    if (!currentUser) {
      return failure('User not found');
    }

    // For MVP, we'll simulate a successful match creation
    // In a real implementation, we would check for existing matches and create a new one
    
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a fake match ID
    const matchId = `match_${Date.now()}`;
    
    return success({ matchId });
    
    // The code below would be used once we have the proper database schema set up
    /*
    // Check if the match already exists
    const existingMatch = await prisma.match.findUnique({
      where: {
        userId_matchedWithId: {
          userId: currentUser.id,
          matchedWithId,
        },
      },
    });

    if (existingMatch) {
      return failure('Match already exists');
    }

    // Create the match
    const match = await prisma.match.create({
      data: {
        userId: currentUser.id,
        matchedWithId,
        accepted: false,
      },
    });

    return success({ matchId: match.id });
    */
  } catch (error) {
    console.error('Error creating match:', error);
    return failure('Failed to create match');
  }
}

/**
 * Accepts a match request
 * @param matchId ID of the match to accept
 * @returns Promise<ActionResult<{ matchId: string }>> Result of the match acceptance
 */
export async function acceptMatch(matchId: string): Promise<ActionResult<{ matchId: string }>> {
  try {
    const currentUser = await getVictimUser();
    
    if (!currentUser) {
      return failure('User not found');
    }

    // For MVP, we'll simulate a successful match acceptance
    // In a real implementation, we would find the match and update its status
    
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return success({ matchId });
    
    // The code below would be used once we have the proper database schema set up
    /*
    // Find the match
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
        matchedWithId: currentUser.id, // Ensure the current user is the one being matched with
      },
    });

    if (!match) {
      return failure('Match not found');
    }

    // Update the match
    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        accepted: true,
      },
    });

    return success({ matchId: updatedMatch.id });
    */
  } catch (error) {
    console.error('Error accepting match:', error);
    return failure('Failed to accept match');
  }
}
