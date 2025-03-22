import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Meeting, UserProfile } from '../types/index';
import {
  generateUniquePhrase,
  getUserProfile,
  saveUserProfile,
  savePhraseToSession,
  getPhraseFromSession,
  clearPhraseFromSession
} from '../utils/encryption';
import { createNewUserProfile, getTodaysMeetings } from '../utils/meetingUtils';

interface AppContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  todaysMeetings: Meeting[];
  uniquePhrase: string | null;
  isNewUser: boolean;
  login: (phrase: string) => boolean;
  logout: () => void;
  generateNewProfile: (username?: string) => void;
  refreshMeetings: () => void;
  setUserProfileState: (profile: UserProfile) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

  // Check for existing session on mount
  useEffect(() => {
    const sessionPhrase = getPhraseFromSession();
    if (sessionPhrase) {
      login(sessionPhrase);
    }
  }, []);

  // Update today's meetings whenever the user profile changes
  useEffect(() => {
    refreshMeetings();
  }, [userProfile]);

  const login = (phrase: string): boolean => {
    const profile = getUserProfile(phrase);
    if (profile) {
      setUserProfile(profile);
      setUniquePhrase(phrase);
      savePhraseToSession(phrase);
      setIsAuthenticated(true);
      setIsNewUser(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserProfile(null);
    setUniquePhrase(null);
    setIsAuthenticated(false);
    clearPhraseFromSession();
  };

  const generateNewProfile = (username?: string) => {
    const newPhrase = generateUniquePhrase();
    const newProfile = createNewUserProfile(newPhrase, username);
    saveUserProfile(newProfile);
    setUserProfile(newProfile);
    setUniquePhrase(newPhrase);
    savePhraseToSession(newPhrase);
    setIsAuthenticated(true);
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
    login,
    logout,
    generateNewProfile,
    refreshMeetings,
    setUserProfileState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};