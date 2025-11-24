import React, { useEffect } from "react";
import ProfileDesktop from "./ProfileDesktop";
import { ProfileMobile } from "./ProfileMobile";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { useNavigate } from "react-router-dom";
import { useGetUserByAuthQuery } from "@/redux/api/userApi";
import Loader from "@/components/Loader";

const Profile: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const { settingsHighlight, setSettingsHighlight } = useWalkthroughStore();
  const navigate = useNavigate();

  const { data: userResponse, isLoading, isError } = useGetUserByAuthQuery();

  useEffect(() => {
    if (settingsHighlight === "profile") {
      const timer = setTimeout(() => {
        setSettingsHighlight("notifications");
        navigate("/settings");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [settingsHighlight, setSettingsHighlight, navigate]);

  const forceSecurityTab = settingsHighlight === "security";
  const forceWorkTab = settingsHighlight === "work";

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="p-8 text-red-500">Failed to load user profile</div>;
  }

  const user = userResponse?.data;

  return (
    <div
      className={
        settingsHighlight === "profile"
          ? "profile-highlight"
          : settingsHighlight === "security"
          ? "security-highlight"
          : settingsHighlight === "work"
          ? "work-highlight"
          : ""
      }
    >
      {isMobile ? (
        <ProfileMobile
          forceSecurityTab={forceSecurityTab}
          forceWorkTab={forceWorkTab}
          user={user}
        />
      ) : (
        <ProfileDesktop
          forceSecurityTab={forceSecurityTab}
          forceWorkTab={forceWorkTab}
          user={user}
        />
      )}
    </div>
  );
};

export default Profile;
