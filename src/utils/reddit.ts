import { toast } from "sonner";

const CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPES = ["history", "identity"];

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  score: number;
  url: string;
  created_utc: number;
  permalink: string;
  thumbnail: string;
}

export const generateRandomString = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0].toString(36);
};

export const initiateRedditAuth = () => {
  const state = generateRandomString();
  localStorage.setItem("reddit_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "token",
    state: state,
    redirect_uri: REDIRECT_URI,
    duration: "temporary",
    scope: SCOPES.join(" ")
  });

  window.location.href = `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
};

export const handleRedditCallback = (hash: string) => {
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get("access_token");
  const state = params.get("state");
  const storedState = localStorage.getItem("reddit_state");
  const error = params.get("error");

  if (error) {
    console.error('Reddit OAuth error:', error);
    toast.error(`Authentication failed: ${error}`);
    return null;
  }
  
  // Validate state parameter first
  if (!state || state !== storedState) {
    console.error('State parameter validation failed');
    toast.error("Authentication failed - Invalid state parameter");
    return null;
  }

  // Validate access token
  if (!accessToken) {
    console.error('Access token missing from response');
    toast.error("Authentication failed - Missing access token");
    return null;
  }

  // Clear state from storage
  localStorage.removeItem("reddit_state");
  
  // Store the token
  localStorage.setItem("reddit_access_token", accessToken);
  toast.success("Successfully connected to Reddit!");
  
  return accessToken;
};

export const fetchSavedPosts = async (accessToken: string): Promise<RedditPost[]> => {
  try {
    console.log("Starting API request with token:", accessToken.substring(0, 5) + "...");
    
    // First, get the username
    const userResponse = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "web:saved-posts-fetcher:v1.0.0 (by /u/lovable_dev)",
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const username = userData.name;

    // Then fetch saved posts using the correct endpoint format
    const response = await fetch(`https://oauth.reddit.com/user/${username}/saved?limit=100&raw_json=1`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "web:saved-posts-fetcher:v1.0.0 (by /u/lovable_dev)",
      }
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response data structure:", Object.keys(data));

    if (!data.data?.children) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid API response format");
    }

    return data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      selftext: child.data.selftext || "",
      subreddit: child.data.subreddit,
      score: child.data.score,
      url: child.data.url,
      created_utc: child.data.created_utc,
      permalink: `https://reddit.com${child.data.permalink}`,
      thumbnail: child.data.thumbnail,
    }));
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    toast.error("Failed to fetch saved posts");
    throw error;
  }
};