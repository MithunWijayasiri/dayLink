import { useState } from 'react';
import { FaDownload, FaTrash, FaArrowLeft, FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import { exportUserProfile } from '../utils/encryption';
import { deleteUserProfile } from '../utils/meetingUtils';

interface ProfileManagerProps {
  onClose: () => void;
}

const ProfileManager = ({ onClose }: ProfileManagerProps) => {
  const { userProfile, logout, setUserProfileState } = useAppContext();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  if (!userProfile) return null;

  const handleExportProfile = () => {
    try {
      const exportData = exportUserProfile(userProfile);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userProfile.username || 'user'}_profile.meetings`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleDeleteProfile = () => {
    if (userProfile) {
      // Remove from localStorage first
      localStorage.removeItem('uniquePhrase');
      
      // Then delete the profile from any other storage
      deleteUserProfile(userProfile);
      logout();
    }
  };

  const startEditingUsername = () => {
    setNewUsername(userProfile.username || '');
    setIsEditingUsername(true);
  };

  const cancelEditingUsername = () => {
    setIsEditingUsername(false);
    setNewUsername('');
  };

  const saveUsername = () => {
    if (!newUsername.trim()) return;

    // Update the user profile with the new username
    const updatedProfile = {
      ...userProfile,
      username: newUsername.trim()
    };

    // Save the updated profile
    setUserProfileState(updatedProfile);
    setIsEditingUsername(false);
    
    // Show success message
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  return (
    <div className="profile-manager-container">
      <div className="profile-header">
        <button 
          className="back-button"
          onClick={onClose}
          title="Back to Dashboard"
        >
          <FaArrowLeft />
        </button>
        <h2>Manage Profile</h2>
      </div>

      <div className="profile-section profile-info">
        <h3>Profile Info</h3>
        <div className="profile-details">
          <div className="profile-detail-item">
            <div className="profile-detail-row">
              <span className="profile-detail-label">Username:</span>
              {isEditingUsername ? (
                <div className="edit-field-container">
                  <input
                    type="text"
                    className="edit-input"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button 
                      className="action-button edit"
                      onClick={saveUsername}
                      title="Save"
                      disabled={!newUsername.trim()}
                    >
                      <FaSave />
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={cancelEditingUsername}
                      title="Cancel"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-value-container">
                  <span className="profile-detail-value">
                    {userProfile.username || 'Not set'}
                  </span>
                  <button 
                    className="edit-button"
                    onClick={startEditingUsername}
                    aria-label="Edit username"
                  >
                    <FaPencilAlt />
                  </button>
                </div>
              )}
            </div>
            {updateSuccess && (
              <div className="success-message">Username updated successfully!</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="profile-section">
        <h3>Export Profile</h3>
        <p>Download your profile data including all meetings. You'll need this file to recover your account if you change browsers or clear your cache.</p>
        <div className="center-button-container">
          <div className="export-section">
            <button 
              className="primary-button export-button"
              onClick={handleExportProfile}
            >
              <FaDownload /> Export Profile
            </button>
            {exportSuccess && <p className="success-message">Profile exported successfully!</p>}
          </div>
        </div>
      </div>
      
      <div className="profile-section danger-zone">
        <h3>Delete Profile</h3>
        <p>This will permanently delete all your meeting data. This action cannot be undone.</p>
        
        {deleteConfirm ? (
          <div className="delete-confirm">
            <p>Are you sure you want to delete your profile?</p>
            <div className="button-group">
              <button 
                className="danger-button"
                onClick={handleDeleteProfile}
              >
                Yes, Delete
              </button>
              <button 
                className="secondary-button"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="center-button-container">
            <button 
              className="danger-button"
              onClick={() => setDeleteConfirm(true)}
            >
              <FaTrash /> Delete Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManager;