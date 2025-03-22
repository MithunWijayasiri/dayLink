import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaKey, FaUserPlus, FaUser } from 'react-icons/fa';

const Login = () => {
  const { login, generateNewProfile, isNewUser, uniquePhrase } = useAppContext();
  const [inputPhrase, setInputPhrase] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showNewUserInfo, setShowNewUserInfo] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhrase.trim()) {
      setError('Please enter your unique phrase');
      return;
    }

    const success = login(inputPhrase.trim());
    if (!success) {
      setError('Invalid phrase. Please try again or generate a new profile.');
    }
  };

  const handleGenerateNew = () => {
    setShowNewUserForm(true);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    generateNewProfile(username.trim());
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
            onClick={() => login(uniquePhrase)}
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Show the new profile creation form
  if (showNewUserForm) {
    return (
      <div className="login-container">
        <h2>Create New Profile</h2>
        <p>Enter a username and we'll generate a unique phrase for you.</p>
        
        <form onSubmit={handleCreateProfile} className="login-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter username"
              className="text-input"
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="button-group">
            <button type="submit" className="primary-button">
              Generate Unique Phrase
            </button>
            <button 
              type="button" 
              className="secondary-button"
              onClick={() => setShowNewUserForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Default login form
  return (
    <div className="login-container">
      <h2>Meeting Scheduler</h2>
      <p>Enter your unique phrase to access your meetings or generate a new profile.</p>
      
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <FaKey className="input-icon" />
          <input
            type="text"
            value={inputPhrase}
            onChange={(e) => {
              setInputPhrase(e.target.value);
              setError('');
            }}
            placeholder="Enter your unique phrase"
            className="text-input"
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="button-group">
          <button type="submit" className="primary-button">
            <FaKey /> Login
          </button>
          <button 
            type="button" 
            className="secondary-button"
            onClick={handleGenerateNew}
          >
            <FaUserPlus /> New Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;