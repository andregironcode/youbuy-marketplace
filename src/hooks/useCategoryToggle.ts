
import { useState, useEffect } from 'react';

export const useCategoryToggle = (initialState: boolean = false) => {
  const [showCategories, setShowCategories] = useState(initialState);
  
  useEffect(() => {
    const handleToggleCategories = () => {
      console.log("Toggle categories event received");
      setShowCategories(prev => !prev);
    };

    window.addEventListener('toggleCategories', handleToggleCategories);
    
    return () => {
      window.removeEventListener('toggleCategories', handleToggleCategories);
    };
  }, []);

  return {
    showCategories,
    setShowCategories
  };
};
