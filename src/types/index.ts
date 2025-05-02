export interface User {
  id: string;
  name: string;
  bio: string | null;
  age: number;
  gender: string;
  minAge: number;
  maxAge: number;
  minWeight: number;
  maxWeight: number;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  personFriendliness: number; // 1-10
  dogFriendliness: number; // 1-10
  weight: number;
  sex: string;
  description: string | null;
}

export interface Match {
  id: string;
  userId: string;
  matchedWithId: string;
  accepted: boolean;
}

export interface PotentialMatch {
  user: User;
  dog: Dog;
  match: Match;
}

export type ActionResult<T> = 
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };
