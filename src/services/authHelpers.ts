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

export function signOut() {
  try {
    store.dispatch(reduxLogout());
    localStorage.removeItem("token");
    useUserStore.getState().logout?.();
    removeCookie("authToken");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
