import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaKey, FaUserPlus, FaUser, FaSignInAlt, FaLock, FaShieldAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { generateUniquePhrase } from '../utils/encryption';
import toast from 'react-hot-toast';
import Footer from './Footer';

const Login = () => {
  const { login, generateNewProfile, isNewUser, uniquePhrase } = useAppContext();
  const [inputPhrase, setInputPhrase] = useState('');
  const [username, setUsername] = useState('');
  const [showNewUserInfo, setShowNewUserInfo] = useState(false);
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Check for stored unique phrase on component mount
  useEffect(() => {
    const storedPhrase = localStorage.getItem('uniquePhrase');
    if (storedPhrase) {
      login(storedPhrase);
    }
  }, []); // Empty dependency array to run only once on mount

  // Generate phrase when username changes
  useEffect(() => {
    if (username.trim()) {
      const newPhrase = generateUniquePhrase();
      setGeneratedPhrase(newPhrase);
    } else {
      setGeneratedPhrase('');
    }
  }, [username]);

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
      showErrorToast('Invalid phrase. Please try again.');
    }
  };

  const handleCopyPhrase = () => {
    if (generatedPhrase) {
      navigator.clipboard.writeText(generatedPhrase)
        .then(() => {
          setIsCopied(true);
          toast.success('Phrase copied to clipboard!');
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(() => {
          toast.error('Failed to copy phrase');
        });
    }
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
      <div className="login-container lime-theme">
        <div className="app-branding">
          <div className="logo-container">
            <div className="logo-icon">d</div>
            <h1>dayLink</h1>
          </div>
          <p className="tagline">Meeting Scheduler</p>
        </div>
        
        <div className="new-user-info">
          <h2>Your Unique Phrase</h2>
          <div className="unique-phrase-display">{uniquePhrase}</div>
          <div className="warning">
            <FaShieldAlt style={{ marginRight: '8px' }} />
            <p><strong>IMPORTANT:</strong> Save this phrase somewhere safe. You will need it to access your meetings in the future.
            There is no way to recover this phrase if you lose it.</p>
          </div>
          <button 
            className="primary-button lime-button"
            onClick={() => {
              // Store phrase in localStorage and login
              localStorage.setItem('uniquePhrase', uniquePhrase);
              login(uniquePhrase);
            }}
          >
            <FaSignInAlt /> Continue to Dashboard
          </button>
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
  }

  // Combined login and signup form
  return (
    <div className="login-container lime-theme">
      <div className="app-branding">
        <div className="logo-container">
          <div className="logo-icon">d</div>
          <h1>dayLink</h1>
        </div>
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
                placeholder="Enter your unique phrase"
                className="text-input lime-input"
              />
            </div>
            
            <button type="submit" className="primary-button lime-button">
              <FaSignInAlt /> Login
            </button>
          </form>
        </div>
        
        <div className="divider"></div>
        
        <div className="signup-section">
          <h3>Create New Profile</h3>
          <p>Enter a username and we'll generate a unique phrase</p>
          
          <form onSubmit={handleCreateProfile} className="signup-form">
            <div className="input-group">
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
            
            <div className="input-group phrase-input-group">
              <FaKey className="input-icon" />
              <input
                type="text"
                value={generatedPhrase}
                readOnly
                disabled={!generatedPhrase}
                placeholder="Your unique phrase will appear here"
                className="text-input phrase-input lime-input"
                aria-label="Generated unique phrase"
                style={{ fontWeight: 'normal' }}
              />
              {generatedPhrase && (
                <button 
                  type="button"
                  className="generate-icon-button"
                  onClick={handleCopyPhrase}
                  title="Copy Unique Phrase"
                  aria-label="Copy unique phrase"
                >
                  {isCopied ? <FaCheck className="generate-icon" /> : <FaCopy className="generate-icon" />}
                </button>
              )}
            </div>
            
            <button 
              type="submit" 
              className="primary-button create-profile-button lime-button"
              disabled={!username.trim() || !generatedPhrase}
            >
              <FaUserPlus /> Create Profile
            </button>
          </form>
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