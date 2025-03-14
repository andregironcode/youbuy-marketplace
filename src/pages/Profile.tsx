
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileRoutes } from "@/components/profile/ProfileRoutes";
import { useAuth } from "@/context/AuthContext";

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
    <div className="h-screen flex overflow-hidden">
      <ProfileSidebar />
      <main className="flex-1 overflow-auto">
        <ProfileRoutes />
      </main>
    </div>
  );
};

export default Profile;
