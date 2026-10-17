// The one session controller for the tab (correction 3).
//
// Created here — not in router.tsx — so both `utils/orpc.ts` (transport) and the router (guards)
// can import it without an import cycle.
import { ENV } from "../env.public";
import { createRpcCall } from "./orpc-link";
import { SessionController } from "./session-controller";
import { createWebTokenStore } from "./token-store";

/**
 * The persistence layer. On the server this is the memory adapter, so SSR never reads a token and
 * none reaches the HTML (§4.3).
 */
export const authTokenStore = createWebTokenStore();

/**
 * The raw call the controller uses for `auth/refreshSession`, `auth/signOut` and `auth/getSession`.
 * It bypasses the RPCLink interceptor on purpose: the refresh request must never be wrapped by the
 * reactive-retry logic (R3).
 */
export const authRpcCall = createRpcCall({
  baseUrl: ENV.VITE_SERVER_URL,
  getAccessToken: () => authTokenStore.read()?.accessToken ?? null,
});

/** The singleton every layer shares. */
export const authController = new SessionController({
  store: authTokenStore,
  call: authRpcCall,
});
