import React, { useEffect } from "react";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { PublicRoutes } from "./PublicRoutes";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { bootstrapAuthFromCookie } from "@/services/authHelpers";
import { useGetUserByAuthQuery } from "@/redux/api/userApi";
import { setCredentials } from "@/redux/slice/authSlice";

export const IndexRoutes: React.FC = () => {
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  // Bootstrap auth token from cookie if present
  useEffect(() => {
    bootstrapAuthFromCookie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: userResp } = useGetUserByAuthQuery(undefined, { skip: !token });

  useEffect(() => {
    if (userResp && userResp?.data && token) {
      dispatch(setCredentials({ token, user: userResp.data }));
    }
  }, [userResp, dispatch, token]);

  return isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />;
};
