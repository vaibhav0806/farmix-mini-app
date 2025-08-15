"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

import Farmix from "./farmix";

export default function App() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await sdk.context;
        sdk.actions.ready({});
      } catch (error) {
        console.log("Frame SDK not available, running in browser mode");
      }
    };
    
    if (!isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return <Farmix />;
}
