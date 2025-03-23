import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaKey, FaUserPlus, FaUser, FaSync, FaSignInAlt } from 'react-icons/fa';
import { generateUniquePhrase } from '../utils/encryption';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, generateNewProfile, isNewUser, uniquePhrase } = useAppContext();
  const [inputPhrase, setInputPhrase] = useState('');
  const [username, setUsername] = useState('');
  const [showNewUserInfo, setShowNewUserInfo] = useState(false);
  const [generatedPhrase, setGeneratedPhrase] = useState('');

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhrase.trim()) {
      showErrorToast('Please enter your unique phrase');
      return;
    }

    const success = login(inputPhrase.trim());
    if (success) {
      localStorage.setItem('uniquePhrase', inputPhrase.trim());
    } else {
      showErrorToast('Invalid phrase. Please try again or create a new profile.');
    }
  };

  const handleGeneratePhrase = () => {
    if (!username.trim()) {
      showErrorToast('Please enter a username first');
      return;
    }
    
    const newPhrase = generateUniquePhrase();
    setGeneratedPhrase(newPhrase);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      showErrorToast('Please enter a username');
      return;
    }
    
    if (!generatedPhrase) {
      showErrorToast('Please generate a unique phrase');
      return;
    }
    
    // Use the already generated phrase
    generateNewProfile(username.trim(), generatedPhrase);
    setShowNewUserInfo(true);
  };

  // Display the new profile information after generation
  if (isNewUser && uniquePhrase && showNewUserInfo) {
    return (
      <div className="login-container">
        <div className="app-branding">
          <h1>dayLink</h1>
          <p className="tagline">Meeting Scheduler</p>
        </div>
        <div className="new-user-info">
          <h2>Your Unique Phrase</h2>
          <div className="unique-phrase-display">{uniquePhrase}</div>
          <p className="warning">
            <strong>IMPORTANT:</strong> Save this phrase somewhere safe. You will need it to access your meetings in the future.
            There is no way to recover this phrase if you lose it.
          </p>
          <button 
            className="primary-button"
            onClick={() => {
              // Store phrase in localStorage and login
              localStorage.setItem('uniquePhrase', uniquePhrase);
              login(uniquePhrase);
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Combined login and signup form
  return (
    <div className="login-container">
      <div className="app-branding">
        <h1>dayLink</h1>
        <p className="tagline">Meeting Scheduler</p>
      </div>
      
      <div className="login-signup-container">
        <div className="login-section">
          <h3>Login</h3>
          <p>Enter your unique phrase to access your meetings</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                type="text"
                value={inputPhrase}
                onChange={(e) => {
                  setInputPhrase(e.target.value);
                }}
                placeholder="123X5-67Y9"
                className="text-input"
              />
            </div>
            
            <button type="submit" className="primary-button">
              <FaSignInAlt /> Login
            </button>
          </form>
        </div>
        
        <div className="divider"></div>
        
        <div className="signup-section">
          <h3>Create New Profile</h3>
          <p>Enter a username and generate a unique phrase</p>
          
          <form onSubmit={handleCreateProfile} className="signup-form">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (generatedPhrase) setGeneratedPhrase('');
                }}
                placeholder="Username"
                className="text-input"
              />
            </div>
            
            <div className="input-group phrase-input-group">
              <FaKey className="input-icon" />
              <input
                type="text"
                value={generatedPhrase}
                readOnly
                disabled={!generatedPhrase}
                placeholder="Unique Phrase"
                className="text-input phrase-input"
                aria-label="Generated unique phrase"
              />
              <button 
                type="button"
                className="generate-icon-button"
                onClick={handleGeneratePhrase}
                title="Generate Unique Phrase"
                aria-label="Generate unique phrase"
              >
                <FaSync className="generate-icon" />
              </button>
            </div>
            
            <button 
              type="submit" 
              className={`primary-button create-profile-button ${generatedPhrase ? 'ready' : ''}`}
            >
              <FaUserPlus /> Create Profile
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
};

export default Login;