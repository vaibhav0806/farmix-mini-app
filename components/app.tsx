"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { usePrivy } from "@privy-io/react-auth";

import WalletConnector from "./wallet-connector";
import Farmix from "./farmix";

export default function App() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [farcasterUserContext, setFarcasterUserContext] = useState<any>();
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    const load = async () => {
      try {
        const context = await sdk.context;
        setFarcasterUserContext(context);
        
        // Call ready when the component has loaded
        if (ready) {
          sdk.actions.ready({});
        }
      } catch (error) {
        console.log("Frame SDK not available, running in browser mode");
        setFarcasterUserContext(null);
        
        // Still call ready even if not in frame
        if (ready) {
          sdk.actions.ready({});
        }
      }
    };
    
    if (!isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded, ready]);

  // Call ready again when authentication state changes
  useEffect(() => {
    if (ready && authenticated) {
      sdk.actions.ready({});
    }
  }, [ready, authenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">F</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Farmix
              </h1>
            </div>
            <WalletConnector />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <Farmix />
    </div>
  );
}
