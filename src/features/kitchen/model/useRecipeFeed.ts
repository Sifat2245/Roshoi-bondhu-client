import { useEffect, useState } from "react";
import { useSession } from "../../../lib/auth-client";
import { useAuth } from "../../../context/AuthContext";
import postsApi from "../../posts/api/posts.api";
import type { Recipe } from "./recipe-utils";

export function useRecipeFeed() {
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const actorId = session?.user?.id || authUser?.id;
  const token = session?.session?.token;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    postsApi
      .getPosts({ type: "RECIPE", limit: 100 }, token, actorId)
      .then((posts) => {
        if (active) setRecipes(posts as Recipe[]);
      })
      .catch(() => {
        if (active) setError("We couldn’t load the recipes. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, version, actorId]);
  return { recipes, loading, error, retry: () => setVersion((v) => v + 1) };
}
