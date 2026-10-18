// SCR-PUB-08 Sign-in. The real page is `/sign-in` (routes/sign-in.tsx, guarded there); the registry
// entry renders the same screen for the screen catalog.
import { SignInScreen } from "@/auth/screens/sign-in-screen";

export function SignIn() {
  return <SignInScreen />;
}
