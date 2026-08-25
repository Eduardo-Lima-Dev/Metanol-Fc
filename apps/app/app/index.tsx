import { Redirect } from "expo-router";
import { useAuth } from "../src/core/auth/AuthProvider";

export default function Index() {
  const { status } = useAuth();

  if (status === "loading") return null;

  return <Redirect href={status === "authenticated" ? "/(tabs)/rachas" : "/(auth)/login"} />;
}
