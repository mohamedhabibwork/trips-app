// SCR-PUB-19 Moderator sign-in. The real page is `/crew/sign-in` (routes/crew_.sign-in.tsx).
import { CrewSignInScreen } from "@/auth/screens/crew-sign-in-screen";

export function ModeratorSignInWithStaffCode() {
  return <CrewSignInScreen />;
}
