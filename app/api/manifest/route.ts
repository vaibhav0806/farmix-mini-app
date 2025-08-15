import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "Farmix",
    url: process.env.NEXT_PUBLIC_URL || "https://farmix-mini-app.vercel.app",
    description: "Analyze Farcaster social compatibility",
    imageUrl: `${process.env.NEXT_PUBLIC_URL || "https://farmix-mini-app.vercel.app"}/icon.png`,
    version: "0.1.0"
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
