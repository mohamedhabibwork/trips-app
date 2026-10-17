// Barrel for the web auth layer.
export { authController, authRpcCall, authTokenStore } from "./instance";
export {
  AuthProvider,
  useAuth,
  useAuthLocale,
  useAuthStatus,
  type AuthContextValue,
} from "./auth-context";
export {
  SessionController,
  createSessionController,
  LOADING_SNAPSHOT,
  type RpcCall,
  type SessionControllerOptions,
  type SessionSnapshot,
} from "./session-controller";
export {
  createMemoryTokenStore,
  createResilientTokenStore,
  createWebTokenStore,
  type StorageLike,
  type TokenStore,
} from "./token-store";
export { RpcCallError, buildAuthLink, createRpcCall, peekErrorCode } from "./orpc-link";
export {
  authErrorViewFor,
  extractTransportError,
  isSessionExpiredFailure,
  toAuthErrorView,
  type TransportFailure,
} from "./errors";
export { requireAnonymous, requireSurface, type GuardArguments } from "./guard";
export { HydrationGate, useHydrated } from "./hydration";
