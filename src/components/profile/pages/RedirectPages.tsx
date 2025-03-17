
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PrivateAccountRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/profile/settings");
  }, [navigate]);
  
  return null;
};

export const SellerAccountRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/profile/sales");
  }, [navigate]);
  
  return null;
};

export const PurchasesRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/profile/purchases");
  }, [navigate]);
  
  return null;
};

export const SalesRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/profile/sales");
  }, [navigate]);
  
  return null;
};
