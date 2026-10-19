// Shown by shared pages that read the signed-in user's data when nobody is signed in.
import { useAuth } from "@/auth/auth-context";
import { Notice, TextLink } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";

export function SignInRequired({ message }: { message: string }) {
  const { t } = useAuth();
  return (
    <Notice tone="info">
      {message} <TextLink to={pathFor("SCR-PUB-08")}>{t("screen.auth.signIn.submit")}</TextLink>
    </Notice>
  );
}
