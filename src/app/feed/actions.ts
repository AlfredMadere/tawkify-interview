'use server';

import { PotentialMatch, ActionResult, Match } from '@/types';
import { success, failure } from '@/lib/utils';
import { getVictimUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


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

 
    // The code below would be used once we have the proper database schema set up
    // Fetch users with dogs that match the current user's preferences
    // Get existing matches where the current user is the initiator
  const existingMatches = await prisma.match.findMany({
    where: {
      userId: currentUser.id,
    },
    select: {
      matchedWithId: true,
    },
  });

  // Extract the IDs of users who already have matches with the current user
  const matchedUserIds = existingMatches.map(match => match.matchedWithId);

  const potentialMatches = await prisma.user.findMany({
      where: {
        // Exclude the current user and users who already have a match with the current user
        AND: [
          { id: { not: currentUser.id } },
          { id: { notIn: matchedUserIds } }
        ],
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

    // Get all matches for the current user
    const userMatches = await prisma.match.findMany({
      where: {
        OR: [
          { userId: currentUser.id },
          { matchedWithId: currentUser.id }
        ]
      }
    });

    // Transform to the expected format
    const formattedMatches: PotentialMatch[] = await Promise.all(filteredMatches.map(async user => {
      // Check if there's a match from current user to this user
      const existingMatch = userMatches.find(m => 
        m.userId === currentUser.id && m.matchedWithId === user.id
      );
      
      // Check if there's a match from this user to current user
      const reverseMatch = userMatches.find(m => 
        m.userId === user.id && m.matchedWithId === currentUser.id
      );
      
      // Create a match object for the response
      let match: Match = {
        id: existingMatch?.id || '',
        userId: currentUser.id,
        matchedWithId: user.id,
        accepted: false
      };
      
      // If there's an existing match, use its data
      if (existingMatch) {
        match = existingMatch;
      }
      
      // If there's a reverse match and it's accepted, mark this as accepted too
      if (reverseMatch && reverseMatch.accepted) {
        match.accepted = true;
      }
      
      return {
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
        match
      };
    }));

    return success(formattedMatches);
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    return failure('Failed to fetch potential matches');
  }
}

/**
 * Creates a match with another user
 * @param matchedWithId ID of the user to match with
 * @returns Promise<ActionResult<{ matchId: string, match: Match }>> Result of the match creation
 */
export async function createMatch(matchedWithId: string): Promise<ActionResult<{ matchId: string, match: Match }>> {
  try {
    const currentUser = await getVictimUser();
    
    if (!currentUser) {
      return failure('User not found');
    }

    // Check if the match already exists from current user to target user
    const existingMatch = await prisma.match.findFirst({
      where: {
        userId: currentUser.id,
        matchedWithId: matchedWithId,
      },
    });

    if (existingMatch) {
      return success({ 
        matchId: existingMatch.id,
        match: existingMatch
      });
    }

    // Check if there's a match from the target user to the current user
    const reverseMatch = await prisma.match.findFirst({
      where: {
        userId: matchedWithId,
        matchedWithId: currentUser.id,
      },
    });

    // Create the new match
    const newMatch = await prisma.match.create({
      data: {
        userId: currentUser.id,
        matchedWithId: matchedWithId,
        // If there's a reverse match, both matches are accepted (mutual match)
        accepted: reverseMatch ? true : false,
      },
    });

    // If there's a reverse match, update it to accepted as well
    if (reverseMatch) {
      await prisma.match.update({
        where: { id: reverseMatch.id },
        data: { accepted: true },
      });
    }

    return success({ 
      matchId: newMatch.id,
      match: newMatch
    });
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
