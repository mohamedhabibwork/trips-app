// SCR-PUB-02 Sign-up chooser. The real page is `/sign-up` (routes/sign-up.tsx); the registry entry
// renders the same screen so the screen catalog shows what users see.
import { SignUpScreen } from "@/auth/screens/sign-up-screen";

export function SignUpChooser() {
  return <SignUpScreen />;
}
