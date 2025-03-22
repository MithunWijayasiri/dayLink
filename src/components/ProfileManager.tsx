import { useState } from 'react';
import { FaDownload, FaUpload, FaTrash } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import { exportUserData, importUserData } from '../utils/encryption';
import { deleteUserProfile } from '../utils/meetingUtils';

interface ProfileManagerProps {
  onClose: () => void;
}

const ProfileManager = ({ onClose }: ProfileManagerProps) => {
  const { userProfile, setUserProfileState, logout } = useAppContext();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPhrase, setImportPhrase] = useState('');
  const [importError, setImportError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!userProfile) return null;

  const handleExport = () => {
    const exportData = exportUserData(userProfile);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meetings_data.meetings';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setImportError('');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }

    if (!importPhrase.trim()) {
      setImportError('Please enter the phrase used to encrypt this file');
      return;
    }

    try {
      const fileContent = await importFile.text();
      const importedProfile = importUserData(fileContent, importPhrase.trim());
      
      if (!importedProfile) {
        setImportError('Invalid file or incorrect phrase');
        return;
      }
      
      setUserProfileState(importedProfile);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Failed to import file. Please check the file format.');
    }
  };

  const handleDeleteProfile = () => {
    if (userProfile) {
      deleteUserProfile(userProfile);
      logout();
    }
  };

  return (
    <div className="profile-manager-container">
      <h2>Manage Profile</h2>
      
      <div className="profile-section">
        <h3>Export Meeting Data</h3>
        <p>Download your encrypted meeting data as a file. You'll need your unique phrase to import it later.</p>
        <button 
          className="primary-button export-button"
          onClick={handleExport}
        >
          <FaDownload /> Export Data
        </button>
      </div>
      
      <div className="profile-section">
        <h3>Import Meeting Data</h3>
        <p>Import meeting data from a previously exported file.</p>
        
        <div className="import-form">
          <div className="form-group">
            <label htmlFor="importFile">Select File</label>
            <input 
              type="file" 
              id="importFile" 
              accept=".meetings,application/json" 
              onChange={handleImportChange} 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="importPhrase">Enter Phrase</label>
            <input 
              type="text" 
              id="importPhrase" 
              value={importPhrase}
              onChange={(e) => {
                setImportPhrase(e.target.value);
                setImportError('');
              }}
              placeholder="Enter the phrase used to encrypt this file"
              className="text-input"
            />
          </div>
          
          {importError && <p className="error-message">{importError}</p>}
          
          <button 
            className="primary-button import-button"
            onClick={handleImport}
          >
            <FaUpload /> Import Data
          </button>
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
          <button 
            className="danger-button"
            onClick={() => setDeleteConfirm(true)}
          >
            <FaTrash /> Delete Profile
          </button>
        )}
      </div>
      
      <div className="button-group">
        <button 
          className="secondary-button"
          onClick={onClose}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProfileManager;