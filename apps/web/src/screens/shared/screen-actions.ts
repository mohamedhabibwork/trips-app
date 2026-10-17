import type { FormEvent } from "react";

// Route paths used by the shared error and sign-in screens. Confirm them against the app routes.
export const SIGN_IN_PATH = "/sign-in";

export function goHome(): void {
  window.location.assign("/");
}

export function goSignIn(): void {
  window.location.assign(SIGN_IN_PATH);
}

export function goBack(): void {
  window.history.back();
}

export function retryPage(): void {
  window.location.reload();
}

// Screens are presentational, so a submitted form must not reload the page.
export function preventSubmit(event: FormEvent<HTMLFormElement>): void {
  event.preventDefault();
}
