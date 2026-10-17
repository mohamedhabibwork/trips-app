// Real auth routes, owned outside this folder. Screens link to them and sign-in and sign-up forms post to them.
export const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  adminSignIn: "/admin/sign-in",
  staffSignIn: "/business/sign-in",
  moderatorSignIn: "/crew/sign-in",
} as const;
