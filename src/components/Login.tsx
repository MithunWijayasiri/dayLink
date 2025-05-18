import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaUserPlus, FaUser, FaSignInAlt, FaLock, FaUpload } from 'react-icons/fa';
import { generateUniquePhrase } from '../utils/encryption';
import toast from 'react-hot-toast';
import Footer from './Footer';

const Login = () => {
  const { login, generateNewProfile, isNewUser, userProfile, loading } = useAppContext();
  const [username, setUsername] = useState('');
  const [showNewUserInfo, setShowNewUserInfo] = useState(false);
  const [localUniquePhrase, setLocalUniquePhrase] = useState<string | null>(null); // For the new user screen
  const [localUsername, setLocalUsername] = useState<string>(''); // For the new user screen

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  
  useEffect(() => {
    // Only attempt auto-login if not showing new user info and no user is already logged in
    if (!showNewUserInfo && !userProfile && !loading) {
      const storedPhrase = localStorage.getItem('uniquePhrase');
      if (storedPhrase) {
        login(storedPhrase); // This will navigate if successful via AppContext
      }
    }
  }, [showNewUserInfo, userProfile, loading, login]); 

  const showErrorToast = (message: string) => {
    toast.dismiss(); 
    toast.error(message);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      showErrorToast('Please enter a username');
      return;
    }
    
    const newPhrase = generateUniquePhrase();
    generateNewProfile(username.trim(), newPhrase); // This updates context's uniquePhrase and isNewUser
    
    // Store the phrase in localStorage for persistence
    localStorage.setItem('uniquePhrase', newPhrase);

    // Set local state to display the new user info screen
    setLocalUniquePhrase(newPhrase);
    setLocalUsername(username.trim());
    setShowNewUserInfo(true);
    // Do NOT call login() here. Let the user click "Continue".
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setImportError('');
    } else {
      setImportFile(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(''); // Clear previous errors
    
    if (!importFile) {
      showErrorToast('Please select a file to import');
      return;
    }

    try {
      const fileContent = await importFile.text();
      const importedData = JSON.parse(fileContent);
      
      if (!importedData) {
        setImportError('Invalid profile data format in the file.');
        return;
      }
      
      let extractedPhrase = '';
      if (importedData.metadata && importedData.metadata.uniquePhrase) {
        extractedPhrase = importedData.metadata.uniquePhrase;
      } else if (importedData.data) {
        const phraseMatch = fileContent.match(/"uniquePhrase":"([^"]*)"/);
        if (phraseMatch && phraseMatch[1]) {
          extractedPhrase = phraseMatch[1];
        } else {
          // Heuristic for very old formats - less reliable
          const potentialPhrases = Object.values(importedData.data).filter(
            (val: any) => typeof val === 'string' && val.split(' ').length > 5 
          ) as string[];
          if (potentialPhrases.length > 0) {
            extractedPhrase = potentialPhrases[0];
          }
        }
      }

      if (!extractedPhrase) {
        setImportError('Could not find a unique phrase in the imported file. The file might be corrupted or in an unsupported format.');
        return;
      }
      
      localStorage.setItem('uniquePhrase', extractedPhrase);
      const success = login(extractedPhrase); // AppContext's login will handle navigation
      
      if (!success) {
        setImportError('Invalid or corrupted profile data. Login failed.');
        localStorage.removeItem('uniquePhrase'); // Clean up if login fails
      } else {
        toast.success('Profile imported successfully! Redirecting to dashboard...');
        // Navigation is handled by the login function in AppContext
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Failed to import profile. Please ensure the file is a valid JSON export and not corrupted.');
    }
  };

  // Display the new profile information after generation
  // Uses localUniquePhrase and isNewUser from context (which should be set by generateNewProfile)
  if (showNewUserInfo && localUniquePhrase && isNewUser) {
    return (
      <div className="login-container">
        <div className="app-branding">
          <div className="logo-container">
            <div className="logo-icon">d</div>
            <h1>dayLink</h1>
          </div>
          <p className="tagline">Meeting Scheduler</p>
        </div>
        
        <div className="new-user-info">
          <h2>Welcome, {localUsername}!</h2> {/* Use localUsername */}
          <p>Your profile has been created successfully.</p>
          <div className="warning">
            <p><strong>IMPORTANT:</strong> Remember to export your profile from the dashboard to back up your data. This is crucial for recovering your account if you switch browsers or clear your browser's cache.</p>
          </div>
          <button 
            className="primary-button"
            onClick={() => {
              // Now, login with the generated phrase to set userProfile and navigate
              if (localUniquePhrase) {
                login(localUniquePhrase); // This will set userProfile and trigger navigation via AppContext
              }
              // setShowNewUserInfo(false); // No longer needed here, navigation will occur
            }}
          >
            <FaSignInAlt /> Continue to Dashboard
          </button>
        </div>
        
        <Footer />
      </div>
    );
  }

  // If already logged in (e.g., from auto-login or previous session that didn't clear),
  // App.tsx should handle redirection. This Login component should not render its main form.
  // However, a loading state or null can be returned if AppContext is still processing.
  if (loading || userProfile) {
      return null; // Or a loading spinner if preferred: <div className="loading-spinner">Loading...</div>
  }


  // Main Login/Signup/Import form
  return (
    <div className="login-container">
      <div className="app-branding">
        <div className="logo-container">
          <div className="logo-icon">d</div>
          <h1>dayLink</h1>
        </div>
        <p className="tagline">Meeting Scheduler</p>
      </div>
      
      <div className="login-signup-container">
        <div className="login-section">
          <h3>Create New Profile</h3>
          <p>Get started by creating a new local profile.</p>
          
          <form onSubmit={handleCreateProfile} className="signup-form">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a Username"
                className="text-input"
                aria-label="Username for new profile"
              />
            </div>
            
            <div className="button-row">
              <button 
                type="submit" 
                className="primary-button"
                disabled={!username.trim()}
              >
                <FaUserPlus /> Create Profile
              </button>
            </div>
          </form>
        </div>
        
        <div className="divider" aria-hidden="true"></div>
        
        <div className="signup-section"> 
          <h3>Import Existing Profile</h3>
          <p>Restore your profile from a backup file.</p>
          
          <form onSubmit={handleImport} className="signup-form"> 
            <div className="input-group">
              <FaUpload className="input-icon" />
              <input
                type="file"
                id="importFile"
                accept=".meetings,application/json,.json"
                onChange={handleImportChange}
                className="file-input" 
                aria-label="Select profile file to import"
              />
              <label htmlFor="importFile" className="file-label">
                {importFile ? importFile.name : 'Select Profile File (.json)'}
              </label>
            </div>
            
            {importError && <p className="form-error-message">{importError}</p>}
            
            <div className="button-row">
              <button 
                type="submit" 
                className="primary-button"
                disabled={!importFile}
              >
                <FaUpload /> Import Profile
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="privacy-info">
        <FaLock className="privacy-icon" />
        <p>
          <strong>Your Privacy Matters:</strong> All your data, including meeting information, is stored locally on your device and encrypted. It is never sent to any server. We do not track your usage or collect personal information.
        </p>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;