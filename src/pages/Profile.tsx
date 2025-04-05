import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileRoutes } from "@/components/profile/ProfileRoutes";
import { useAuth } from "@/context/AuthContext";
import { AccountLayout } from "@/components/profile/AccountLayout";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <AccountLayout>
      <ProfileRoutes />
    </AccountLayout>
  );
};

export default Profile;
