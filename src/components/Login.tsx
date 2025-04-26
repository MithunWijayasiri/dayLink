import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaUserPlus, FaUser, FaSignInAlt, FaLock, FaUpload } from 'react-icons/fa'; // Removed FaKey
import { generateUniquePhrase } from '../utils/encryption';
import toast from 'react-hot-toast';
import Footer from './Footer';

const Login = () => {
  const { login, generateNewProfile, isNewUser, uniquePhrase } = useAppContext(); // Removed userProfile
  const [username, setUsername] = useState('');
  const [showNewUserInfo, setShowNewUserInfo] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  
  // Check for stored unique phrase on component mount
  useEffect(() => {
    const storedPhrase = localStorage.getItem('uniquePhrase');
    if (storedPhrase) {
      login(storedPhrase);
    }
  }, []); // Empty dependency array to run only once on mount

  // Helper function to show error toast (dismissing any existing toast first)
  const showErrorToast = (message: string) => {
    toast.dismiss(); // Dismiss any existing toast
    toast.error(message);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      showErrorToast('Please enter a username');
      return;
    }
    
    // Generate a new phrase
    const newPhrase = generateUniquePhrase();
    
    // Generate the new profile and login
    generateNewProfile(username.trim(), newPhrase);
    // Store the phrase in localStorage
    localStorage.setItem('uniquePhrase', newPhrase);
    // Show the new user info with the warning
    setShowNewUserInfo(true);
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setImportError('');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }

    try {
      const fileContent = await importFile.text();
      const importedData = JSON.parse(fileContent);
      
      if (!importedData) {
        setImportError('Invalid profile data format');
        return;
      }
      
      // Check if the file has the new format with metadata
      let extractedPhrase = '';
      
      if (importedData.metadata && importedData.metadata.uniquePhrase) {
        // New format with metadata
        extractedPhrase = importedData.metadata.uniquePhrase;
      } else if (importedData.data) {
        // Old format, try to extract phrase from the encrypted data
        const phraseMatch = fileContent.match(/"uniquePhrase":"([^"]*)"/);
        if (!phraseMatch || !phraseMatch[1]) {
          setImportError('Could not find unique phrase in the imported file');
          return;
        }
        extractedPhrase = phraseMatch[1];
      } else {
        setImportError('Invalid profile data format');
        return;
      }
      
      // Store the phrase for auto-login
      localStorage.setItem('uniquePhrase', extractedPhrase);
      // Attempt to login with the extracted phrase
      const success = login(extractedPhrase);
      
      if (!success) {
        setImportError('Invalid or corrupted profile data');
        localStorage.removeItem('uniquePhrase');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Failed to import profile. Please check the file format.');
    }
  };

  // Display the new profile information after generation
  if (isNewUser && uniquePhrase && showNewUserInfo) {
    return (
      <div className="login-container lime-theme">
        <div className="app-branding">
          <div className="logo-container">
            <div className="logo-icon">d</div>
            <h1>dayLink</h1>
          </div>
          <p className="tagline">Meeting Scheduler</p>
        </div>
        
        <div className="new-user-info">
          <h2>Welcome, {username}!</h2>
          <p>Your profile has been created successfully.</p>
          <div className="warning">
            <p><strong>IMPORTANT:</strong> You'll need to export your profile from the dashboard to backup your data.
            This is required to recover your account if you change browsers or clear your cache.</p>
          </div>
          <button 
            className="primary-button lime-button"
            onClick={() => {
              // Set authentication to true and login with the phrase
              login(uniquePhrase);
            }}
          >
            <FaSignInAlt /> Continue to Dashboard
          </button>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Simplified login with signup and import options
  return (
    <div className="login-container lime-theme">
      <div className="app-branding">
        <div className="logo-container">
          <div className="logo-icon">d</div>
          <h1>dayLink</h1>
        </div>
        <p className="tagline">Meeting Scheduler</p>
      </div>
      
      <div className="login-layout">
        <div className="login-panel">
          <div className="login-card sign-up-card">
            <h3>Create New Profile</h3>
            <p>Enter a username to create your profile</p>
            
            <form onSubmit={handleCreateProfile} className="signup-form">
              <div className="input-field">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  placeholder="Username"
                  className="text-input lime-input"
                />
              </div>
              
              <div className="button-row">
                <button 
                  type="submit" 
                  className="primary-button lime-button"
                  disabled={!username.trim()}
                >
                  <FaUserPlus /> Sign Up
                </button>
              </div>
            </form>
          </div>
          
          <div className="login-card import-card">
            <h3>Import Profile</h3>
            <p>Import your previously exported profile</p>
            
            <form onSubmit={handleImport} className="import-form">
              <div className="file-selector">
                <input 
                  type="file" 
                  id="importFile" 
                  accept=".meetings,application/json" 
                  onChange={handleImportChange}
                  className="file-input" 
                />
                <label htmlFor="importFile" className="file-label">
                  {importFile ? importFile.name : 'Select Profile File'}
                </label>
              </div>
              
              {importError && <p className="error-message">{importError}</p>}
              
              <div className="button-row">
                <button 
                  type="submit" 
                  className="primary-button lime-button"
                  disabled={!importFile}
                >
                  <FaUpload /> Import Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="privacy-info">
        <FaLock className="privacy-icon" />
        <p>
          <strong>Your Privacy Matters:</strong> All data is stored locally on your device. 
          Your meeting information is encrypted and never sent to any server. 
          We don't track your usage or collect personal information.
        </p>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;