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
    <div className="min-h-screen flex bg-gray-50">
      <ProfileSidebar />
      <div className="flex-1 ml-60 pt-16">
        <main className="h-full max-w-7xl mx-auto px-4 py-6">
          <ProfileRoutes />
        </main>
      </div>
    </div>
  );
};

export default Profile;
