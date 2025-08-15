"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Users, Heart, Loader2, Network, ArrowRight, CheckCircle2 } from "lucide-react";
import WalletConnector from "./wallet-connector";
import {
  getUserByUsername,
  getUserFollowers,
  getUserFollowing,
  calculateCompatibility,
  type FarcasterUser,
} from "@/lib/neynar";

interface CompatibilityResult {
  score: number;
  commonFollowers: FarcasterUser[];
  commonFollowing: FarcasterUser[];
  details: {
    followerOverlap: number;
    followingOverlap: number;
    totalUserConnections: number;
    totalTargetConnections: number;
  };
  targetUser: FarcasterUser;
}

export default function Farmix() {
  const { user, authenticated } = usePrivy();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the logged-in user's Farcaster info
  const farcasterAccount = user?.linkedAccounts?.find(
    (account) => account.type === "farcaster"
  ) as any;

  const analyzeCompatibility = async () => {
    if (!farcasterAccount || !username.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep("Finding user...");

    try {
      const targetUser = await getUserByUsername(username.trim());
      if (!targetUser) {
        setError("User not found. Please check the username and try again.");
        setLoading(false);
        return;
      }

      const loggedInUserFid = farcasterAccount.fid;
      setLoadingStep("Analyzing connections...");

      const [
        userFollowers,
        userFollowing,
        targetFollowers,
        targetFollowing,
      ] = await Promise.all([
        getUserFollowers(loggedInUserFid, 1000),
        getUserFollowing(loggedInUserFid, 1000),
        getUserFollowers(targetUser.fid, 1000),
        getUserFollowing(targetUser.fid, 1000),
      ]);

      setLoadingStep("Calculating compatibility...");

      const compatibility = calculateCompatibility(
        userFollowers,
        userFollowing,
        targetFollowers,
        targetFollowing
      );

      setResult({
        ...compatibility,
        targetUser,
      });
    } catch (err) {
      setError("Failed to analyze compatibility. Please try again.");
      console.error("Compatibility analysis error:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const getCompatibilityMessage = (score: number) => {
    if (score >= 80) return "Perfect Match!";
    if (score >= 60) return "Great Compatibility";
    if (score >= 40) return "Good Connection";
    if (score >= 20) return "Some Overlap";
    return "Different Circles";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-purple-600";
    if (score >= 40) return "text-blue-600";
    if (score >= 20) return "text-orange-600";
    return "text-gray-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-purple-50";
    if (score >= 40) return "bg-blue-50";
    if (score >= 20) return "bg-orange-50";
    return "bg-gray-50";
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Network className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Farmix</h1>
            <p className="text-gray-600">Connect your Farcaster account to discover social compatibility</p>
          </div>
          {/* Add the login button here */}
          <WalletConnector />
        </div>
      </div>
    );
  }

  if (!farcasterAccount) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Network className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Farmix</h1>
            <p className="text-gray-600">Please link your Farcaster account to continue</p>
          </div>
          {/* Keep the logout button here too in case user is authenticated but needs to reconnect */}
          <WalletConnector />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Keep the wallet connector at the top for authenticated users */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farmix</h1>
          <WalletConnector />
        </div>
        
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Network className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Farmix</h1>
          </div>
          <p className="text-purple-100">Social Compatibility</p>
        </div>

        {/* User Status */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src={farcasterAccount.pfp || "/default-avatar.png"} 
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">@{farcasterAccount.username}</p>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Enter Farcaster username
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                <Input
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && analyzeCompatibility()}
                  disabled={loading}
                  className="pl-8 h-12 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button 
                onClick={analyzeCompatibility} 
                disabled={loading || !username.trim()}
                className="h-12 w-12 bg-purple-600 hover:bg-purple-700 text-white p-0"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {loading && loadingStep && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                <span className="text-purple-700 font-medium">{loadingStep}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pb-6">
            {/* User Profile & Score */}
            <div className="mx-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <img 
                      src={result.targetUser.pfpUrl || "/default-avatar.png"} 
                      alt={result.targetUser.displayName}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{result.targetUser.displayName}</h3>
                      <p className="text-purple-600 font-medium">@{result.targetUser.username}</p>
                    </div>
                    
                    {/* Compatibility Score */}
                    <div className={`${getScoreBgColor(result.score)} rounded-2xl p-6`}>
                      <div className={`text-5xl font-bold ${getScoreColor(result.score)} mb-2`}>
                        {result.score}%
                      </div>
                      <div className={`font-semibold ${getScoreColor(result.score)} mb-3`}>
                        {getCompatibilityMessage(result.score)}
                      </div>
                      <Progress value={result.score} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connection Stats */}
            <div className="mx-6 grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{result.commonFollowing.length}</div>
                  <div className="text-sm text-gray-600">Mutual Following</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{result.commonFollowers.length}</div>
                  <div className="text-sm text-gray-600">Mutual Followers</div>
                </CardContent>
              </Card>
            </div>

            {/* Common Connections */}
            {(result.commonFollowing.length > 0 || result.commonFollowers.length > 0) && (
              <div className="mx-6">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Network className="h-5 w-5 mr-2 text-purple-600" />
                      Shared Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {result.commonFollowing.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-gray-900">You both follow</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {result.commonFollowing.length}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.commonFollowing.slice(0, 6).map((user) => (
                            <div key={user.fid} className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2">
                              <img 
                                src={user.pfpUrl || "/default-avatar.png"} 
                                alt={user.username}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-sm font-medium text-blue-800">@{user.username}</span>
                            </div>
                          ))}
                          {result.commonFollowing.length > 6 && (
                            <div className="bg-blue-50 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium text-blue-600">
                                +{result.commonFollowing.length - 6} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {result.commonFollowers.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-gray-900">Mutual followers</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {result.commonFollowers.length}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.commonFollowers.slice(0, 6).map((user) => (
                            <div key={user.fid} className="flex items-center space-x-2 bg-green-50 rounded-lg px-3 py-2">
                              <img 
                                src={user.pfpUrl || "/default-avatar.png"} 
                                alt={user.username}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-sm font-medium text-green-800">@{user.username}</span>
                            </div>
                          ))}
                          {result.commonFollowers.length > 6 && (
                            <div className="bg-green-50 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium text-green-600">
                                +{result.commonFollowers.length - 6} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analysis Info */}
            <div className="mx-6 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center">
                Analysis based on {(result.details.totalUserConnections + result.details.totalTargetConnections).toLocaleString()} total connections
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
