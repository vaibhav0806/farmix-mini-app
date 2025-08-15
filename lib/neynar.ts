export interface FarcasterUser {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl?: string;
    followerCount: number;
    followingCount: number;
  }
  
  // Get user by username
  export async function getUserByUsername(username: string): Promise<FarcasterUser | null> {
    try {
      const response = await fetch(`/api/neynar/search?username=${encodeURIComponent(username)}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
  
  // Get followers for a user with batch fetching
  export async function getUserFollowers(fid: number, limit: number = 1000): Promise<FarcasterUser[]> {
    try {
      console.log(`Fetching up to ${limit} followers for FID ${fid}...`);
      const response = await fetch(`/api/neynar/followers?fid=${fid}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }
      const users = await response.json();
      console.log(`Retrieved ${users.length} followers`);
      return users;
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  }
  
  // Get following for a user with batch fetching
  export async function getUserFollowing(fid: number, limit: number = 1000): Promise<FarcasterUser[]> {
    try {
      console.log(`Fetching up to ${limit} following for FID ${fid}...`);
      const response = await fetch(`/api/neynar/following?fid=${fid}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch following');
      }
      const users = await response.json();
      console.log(`Retrieved ${users.length} following`);
      return users;
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  }
  
  // Calculate compatibility score
  export function calculateCompatibility(
    userFollowers: FarcasterUser[],
    userFollowing: FarcasterUser[],
    targetFollowers: FarcasterUser[],
    targetFollowing: FarcasterUser[]
  ): {
    score: number;
    commonFollowers: FarcasterUser[];
    commonFollowing: FarcasterUser[];
    details: {
      followerOverlap: number;
      followingOverlap: number;
      totalUserConnections: number;
      totalTargetConnections: number;
    };
  } {
    console.log('Calculating compatibility with full datasets:', {
      userFollowers: userFollowers.length,
      userFollowing: userFollowing.length,
      targetFollowers: targetFollowers.length,
      targetFollowing: targetFollowing.length
    });

    // Find common followers
    const commonFollowers = userFollowers.filter(userFollower =>
      targetFollowers.some(targetFollower => targetFollower.fid === userFollower.fid)
    );
  
    // Find common following
    const commonFollowing = userFollowing.filter(userFollow =>
      targetFollowing.some(targetFollow => targetFollow.fid === userFollow.fid)
    );

    console.log('Found common connections:', {
      commonFollowers: commonFollowers.length,
      commonFollowing: commonFollowing.length
    });

    // Calculate overlaps
    const followerOverlap = userFollowers.length > 0 ? (commonFollowers.length / userFollowers.length) * 100 : 0;
    const followingOverlap = userFollowing.length > 0 ? (commonFollowing.length / userFollowing.length) * 100 : 0;
  
    // Weighted score (following overlap is weighted more heavily as it represents active choices)
    const score = Math.round((followingOverlap * 0.7 + followerOverlap * 0.3));
  
    return {
      score: Math.min(score, 100),
      commonFollowers,
      commonFollowing,
      details: {
        followerOverlap: Math.round(followerOverlap),
        followingOverlap: Math.round(followingOverlap),
        totalUserConnections: userFollowers.length + userFollowing.length,
        totalTargetConnections: targetFollowers.length + targetFollowing.length,
      },
    };
  }
  