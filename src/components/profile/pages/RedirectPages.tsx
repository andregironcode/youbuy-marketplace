
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const InboxPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/messages');
  }, [navigate]);
  
  return null;
};

export const FavoritesRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/favorites');
  }, [navigate]);
  
  return null;
};
