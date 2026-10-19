// SCR-PUB-03 Traveler sign-up (`/sign-up/traveler`): the traveler step of the `/sign-up` flow,
// opened directly. Registration, the code step and the pending step are the same screen.
import { SignUpScreen } from "@/auth/screens/sign-up-screen";

export function TravelerSignUp() {
  return <SignUpScreen start="form" />;
}
