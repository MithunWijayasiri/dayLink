import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Meeting, UserProfile } from '../types/index';
import {
  generateUniquePhrase,
  getUserProfile,
  saveUserProfile
} from '../utils/encryption';
import { createNewUserProfile, getTodaysMeetings } from '../utils/meetingUtils';

interface AppContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  todaysMeetings: Meeting[];
  uniquePhrase: string | null;
  isNewUser: boolean;
  loading: boolean;
  login: (phrase: string) => boolean;
  logout: () => void;
  generateNewProfile: (username?: string, customPhrase?: string) => void;
  refreshMeetings: () => void;
  setUserProfileState: (profile: UserProfile) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook to access the app context, throws if used outside AppProvider
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todaysMeetings, setTodaysMeetings] = useState<Meeting[]>([]);
  const [uniquePhrase, setUniquePhrase] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restores session from local storage on mount
  useEffect(() => {
    const storedPhrase = localStorage.getItem('uniquePhrase');
    if (storedPhrase) {
      setLoading(true);
      login(storedPhrase);
      setLoading(false);
    }
  }, []);

  // Refreshes today's meetings when user profile changes
  useEffect(() => {
    refreshMeetings();
  }, [userProfile]);

  const login = (phrase: string): boolean => {
    setLoading(true);
    try {
      const profile = getUserProfile(phrase);
      if (profile) {
        setUserProfile(profile);
        setUniquePhrase(phrase);
        setIsAuthenticated(true);
        setIsNewUser(false);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserProfile(null);
    setUniquePhrase(null);
    setIsAuthenticated(false);
    localStorage.removeItem('uniquePhrase');
  };

  const generateNewProfile = (username?: string, customPhrase?: string) => {
    const newPhrase = customPhrase || generateUniquePhrase();
    const newProfile = createNewUserProfile(newPhrase, username);
    saveUserProfile(newProfile);
    setUserProfile(newProfile);
    setUniquePhrase(newPhrase);
    setIsAuthenticated(false);
    setIsNewUser(true);
  };

  const refreshMeetings = () => {
    if (userProfile) {
      const meetings = getTodaysMeetings(userProfile);
      setTodaysMeetings(meetings);
    } else {
      setTodaysMeetings([]);
    }
  };

  const setUserProfileState = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const value = {
    isAuthenticated,
    userProfile,
    todaysMeetings,
    uniquePhrase,
    isNewUser,
    loading,
    login,
    logout,
    generateNewProfile,
    refreshMeetings,
    setUserProfileState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};