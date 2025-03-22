import CryptoJS from 'crypto-js';
import { EncryptedData, UserProfile } from '../types/index';

// Generate a random unique phrase for new users
export const generateUniquePhrase = (): string => {
  // Generate a random string with letters and numbers
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 10;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    if (i === 5) {
      result += '-'; // Add a hyphen in the middle for readability
    } else {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
};

// Create a hash of the unique phrase to use as a storage key
export const hashPhrase = (phrase: string): string => {
  try {
    return CryptoJS.SHA256(phrase).toString();
  } catch (error) {
    console.error('Hash creation failed:', error);
    // Fallback in case of error
    return phrase.replace(/[^a-zA-Z0-9]/g, '');
  }
};

// Encrypt data with the unique phrase
export const encryptData = (data: UserProfile, phrase: string): EncryptedData => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, phrase).toString();
    return { data: encrypted };
  } catch (error) {
    console.error('Encryption failed:', error);
    // Return unencrypted data as fallback
    return { data: JSON.stringify(data) };
  }
};

// Decrypt data with the unique phrase
export const decryptData = (encryptedData: EncryptedData, phrase: string): UserProfile | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData.data, phrase);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as UserProfile;
  } catch (error) {
    console.error('Decryption failed:', error);
    // Try to parse the data as unencrypted JSON as fallback
    try {
      return JSON.parse(encryptedData.data) as UserProfile;
    } catch {
      return null;
    }
  }
};

// Save encrypted user profile to local storage
export const saveUserProfile = (profile: UserProfile): void => {
  const { uniquePhrase } = profile;
  const storageKey = `meeting_data_${hashPhrase(uniquePhrase)}`;
  const encrypted = encryptData(profile, uniquePhrase);
  localStorage.setItem(storageKey, JSON.stringify(encrypted));
};

// Retrieve and decrypt user profile from local storage
export const getUserProfile = (phrase: string): UserProfile | null => {
  const storageKey = `meeting_data_${hashPhrase(phrase)}`;
  const encryptedJson = localStorage.getItem(storageKey);
  
  if (!encryptedJson) return null;
  
  try {
    const encrypted = JSON.parse(encryptedJson) as EncryptedData;
    return decryptData(encrypted, phrase);
  } catch (error) {
    console.error('Failed to retrieve user profile:', error);
    return null;
  }
};

// Save phrase to session storage for current session
export const savePhraseToSession = (phrase: string): void => {
  sessionStorage.setItem('meeting_scheduler_phrase', phrase);
};

// Get phrase from session storage
export const getPhraseFromSession = (): string | null => {
  return sessionStorage.getItem('meeting_scheduler_phrase');
};

// Clear phrase from session storage (logout)
export const clearPhraseFromSession = (): void => {
  sessionStorage.removeItem('meeting_scheduler_phrase');
};

// Export user data to a file
export const exportUserData = (profile: UserProfile): string => {
  const encrypted = encryptData(profile, profile.uniquePhrase);
  return JSON.stringify(encrypted);
};

// Import user data from a file
export const importUserData = (jsonData: string, phrase: string): UserProfile | null => {
  try {
    const encrypted = JSON.parse(jsonData) as EncryptedData;
    return decryptData(encrypted, phrase);
  } catch (error) {
    console.error('Failed to import user data:', error);
    return null;
  }
};