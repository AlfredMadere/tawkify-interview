"use server";

import { prisma } from "@/lib/prisma";
import { Dog, User } from "@/generated/prisma";

/**
 * Gets the victim user for development purposes
 * This app doesn't use authentication, so we use this to simulate a logged-in user
 */
export async function getVictimUser(): Promise<User & { dog?: Dog | null }> {
  try {
    // Get the victim user ID from environment variables
    const victimUserId = process.env.VICTIM_USER_ID;
    
    if (!victimUserId) {
      throw new Error("VICTIM_USER_ID environment variable is not set"); 
    }
    
    // Try to find the user with the specified ID
    const user = await prisma.user.findUnique({
      where: {
        id: victimUserId
      },
      include: {
        dog: true
      }
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error getting victim user:", error instanceof Error ? error.message : error);
    throw error;
  }
}