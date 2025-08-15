import { Metadata } from "next";
import App from "@/components/app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch Farmix",
    action: {
      type: "launch_frame",
      name: "Farmix - Social Compatibility",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#7c3aed", // Farcaster purple
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farmix - Farcaster Social Compatibility",
    description: "Discover your Farcaster compatibility with others based on social connections",
    openGraph: {
      title: "Farmix - Farcaster Social Compatibility",
      description: "Analyze social compatibility on Farcaster",
      images: [
        {
          url: `${appUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Farmix - Social Compatibility Analyzer",
        },
      ],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
