import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaKey, FaUserPlus, FaUser, FaSync } from 'react-icons/fa';
import { generateUniquePhrase } from '../utils/encryption';

const Login = () => {
  const { login, generateNewProfile, isNewUser, uniquePhrase } = useAppContext();
  const [inputPhrase, setInputPhrase] = useState('');
  const [username, setUsername] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [showNewUserInfo, setShowNewUserInfo] = useState(false);
  const [generatedPhrase, setGeneratedPhrase] = useState('');

  // Check for stored unique phrase on component mount
  useEffect(() => {
    const storedPhrase = localStorage.getItem('uniquePhrase');
    if (storedPhrase) {
      login(storedPhrase);
    }
  }, []); // Empty dependency array to run only once on mount

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhrase.trim()) {
      setLoginError('Please enter your unique phrase');
      return;
    }

    const success = login(inputPhrase.trim());
    if (success) {
      // Store the unique phrase in localStorage
      localStorage.setItem('uniquePhrase', inputPhrase.trim());
    } else {
      setLoginError('Invalid phrase. Please try again or create a new profile.');
    }
  };

  const handleGeneratePhrase = () => {
    if (!username.trim()) {
      setSignupError('Please enter a username first');
      return;
    }
    
    const newPhrase = generateUniquePhrase();
    setGeneratedPhrase(newPhrase);
    setSignupError('');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setSignupError('Please enter a username');
      return;
    }
    
    if (!generatedPhrase) {
      setSignupError('Please generate a unique phrase');
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
      <h2>Meeting Scheduler</h2>
      
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
                  setLoginError('');
                }}
                placeholder="123X5-67Y9"
                className="text-input"
              />
            </div>
            
            {loginError && <p className="error-message">{loginError}</p>}
            
            <button type="submit" className="primary-button">
              <FaKey /> Login
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
                  setSignupError('');
                  // Clear generated phrase when username changes
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
            
            {signupError && <p className="error-message">{signupError}</p>}
            
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