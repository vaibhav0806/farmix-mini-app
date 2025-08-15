import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2/farcaster';

async function fetchAllFollowing(fid: number, maxLimit: number = 1000): Promise<any[]> {
  const allFollowing: any[] = [];
  let cursor: string | null = null;
  let fetchedCount = 0;
  
  while (fetchedCount < maxLimit) {
    const remainingLimit = Math.min(100, maxLimit - fetchedCount);
    let url = `${NEYNAR_BASE_URL}/following?fid=${fid}&limit=${remainingLimit}`;
    
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    
    console.log(`Fetching batch: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': NEYNAR_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Neynar API error: ${response.status} - ${errorText}`);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.users && data.users.length > 0) {
      allFollowing.push(...data.users);
      fetchedCount += data.users.length;
      console.log(`Fetched ${data.users.length} following, total: ${allFollowing.length}`);
    }
    
    // Check if there's more data
    if (data.next?.cursor && fetchedCount < maxLimit) {
      cursor = data.next.cursor;
    } else {
      break;
    }
    
    // Add a small delay between requests to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return allFollowing;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const limit = parseInt(searchParams.get('limit') || '1000');

  if (!fid) {
    return NextResponse.json({ error: 'FID is required' }, { status: 400 });
  }

  if (!NEYNAR_API_KEY) {
    return NextResponse.json({ error: 'Neynar API key not configured' }, { status: 500 });
  }

  try {
    console.log(`Fetching all following for FID: ${fid}, max limit: ${limit}`);
    
    const allFollowing = await fetchAllFollowing(parseInt(fid), limit);
    
    // Parse the response according to the structure
    const users = allFollowing.map((following: any) => ({
      fid: following.user.fid,
      username: following.user.username,
      displayName: following.user.display_name,
      pfpUrl: following.user.pfp_url,
      followerCount: following.user.follower_count,
      followingCount: following.user.following_count,
    }));

    console.log(`Successfully fetched ${users.length} total following`);
    return NextResponse.json(users);
    
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch following',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
