
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export const NotificationProvider = () => {
  const { theme } = useTheme();
  
  return (
    <Toaster 
      theme={(theme as "light" | "dark" | "system") || "light"} 
      position="top-right"
      closeButton
      richColors
    />
  );
};
