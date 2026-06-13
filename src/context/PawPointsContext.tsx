import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  paw_points: number;
  streak_days: number;
  current_stress_level: string;
}

interface PawPointsContextType {
  userData: UserData;
  refreshUserData: () => Promise<void>;
}

const PawPointsContext = createContext<PawPointsContextType | undefined>(undefined);

export const PawPointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    paw_points: 0,
    streak_days: 0,
    current_stress_level: "Low"
  });

  const refreshUserData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/user/status');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <PawPointsContext.Provider value={{ userData, refreshUserData }}>
      {children}
    </PawPointsContext.Provider>
  );
};

export const usePawPoints = () => {
  const context = useContext(PawPointsContext);
  if (!context) throw new Error("usePawPoints must be used within PawPointsProvider");
  return context;
};
