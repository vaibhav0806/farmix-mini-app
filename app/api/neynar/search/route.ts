import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2/farcaster';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  if (!NEYNAR_API_KEY) {
    return NextResponse.json({ error: 'Neynar API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/user/by_username?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Much simpler structure - direct access to user object
    const user = data.user;
    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
    });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
