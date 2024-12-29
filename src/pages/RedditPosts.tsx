import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SavedPosts } from "@/components/SavedPosts";
import { initiateRedditAuth, handleRedditCallback } from "@/utils/reddit";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function RedditPosts() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("reddit_access_token");
    const hashToken = window.location.hash && handleRedditCallback(window.location.hash);
    
    if (hashToken || storedToken) {
      setAccessToken(hashToken || storedToken);
    }
  }, []);

  if (!accessToken) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-8">Connect Your Reddit Account</h2>
          <Button
            onClick={initiateRedditAuth}
            className="bg-reddit-primary hover:bg-reddit-hover text-white"
          >
            Connect with Reddit
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold mb-8">My Reddit Posts</h2>
        <SavedPosts accessToken={accessToken} />
      </div>
    </DashboardLayout>
  );
}