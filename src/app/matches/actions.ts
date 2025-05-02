'use server';

import { PotentialMatch, ActionResult, Match } from '@/types';
import { success, failure } from '@/lib/utils';
import { getVictimUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Fetches all accepted matches for the current user
 * @returns Promise<ActionResult<PotentialMatch[]>> List of accepted matches
 */
export async function getAcceptedMatches(): Promise<ActionResult<PotentialMatch[]>> {
  try {
    // Get the current user
    const currentUser = await getVictimUser();
    
    if (!currentUser) {
      return failure('User not found');
    }

    // Find all matches where the current user is involved and the match is accepted
    const acceptedMatches = await prisma.match.findMany({
      where: {
        OR: [
          // Current user initiated the match
          { userId: currentUser.id, accepted: true },
          // Current user received the match
          { matchedWithId: currentUser.id, accepted: true },
        ],
      },
    });

    // Get the IDs of all users who matched with the current user
    const matchedUserIds = acceptedMatches.map(match => 
      match.userId === currentUser.id ? match.matchedWithId : match.userId
    );

    // Fetch the matched users with their dogs
    const matchedUsers = await prisma.user.findMany({
      where: {
        id: { in: matchedUserIds },
      },
      include: {
        dog: true,
      },
    });

    // Transform to the expected format
    const formattedMatches: PotentialMatch[] = matchedUsers.map(user => {
      // Find the corresponding match
      const match = acceptedMatches.find(m => 
        (m.userId === currentUser.id && m.matchedWithId === user.id) ||
        (m.userId === user.id && m.matchedWithId === currentUser.id)
      ) as Match;

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
        match,
      };
    });

    return success(formattedMatches);
  } catch (error) {
    console.error('Error fetching accepted matches:', error);
    return failure('Failed to fetch accepted matches');
  }
}
