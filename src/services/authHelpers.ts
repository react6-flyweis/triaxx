import { store } from "@/redux/store";
import {
  logout as reduxLogout,
  setToken as reduxSetToken,
} from "@/redux/slice/authSlice";
import getCookie from "@/utils/getCookie";
import { useUserStore } from "@/store/zustandStores";
import { removeCookie } from "@/utils/removeCookie";

/**
 * Logout across both Redux and Zustand (clear cookie & both states)
 */
export function logoutAll() {
  // Clear Redux auth state
  store.dispatch(reduxLogout());
  // Clear Zustand auth/user store if exists
  try {
    useUserStore.getState().logout?.();
  } catch (err) {
    // ignore - optional
  }
  // Clear cookie(s)
  try {
    removeCookie("authToken");
  } catch (err) {
    // ignore
  }
}

/**
 * Bootstrap auth from cookie; if token exists it sets it in Redux and returns it.
 */
export function bootstrapAuthFromCookie() {
  const token = getCookie("authToken");
  if (!token) return null;
  // Set token into redux store so RTK Query prepares headers
  store.dispatch(reduxSetToken(token));
  return token;
}
