import { useState, useRef, useEffect } from 'react';
import { FaPlus, FaCog, FaSignOutAlt, FaBars, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import MeetingList from './MeetingList';
import MeetingForm from './MeetingForm';
import ProfileManager from './ProfileManager';

const Dashboard = () => {
  const { logout, userProfile } = useAppContext();
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [editMeeting, setEditMeeting] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoutConfirmRef = useRef<HTMLDivElement>(null);

  const handleAddMeeting = () => {
    setShowAddMeeting(true);
    setShowProfileManager(false);
    setMenuOpen(false);
  };

  const handleManageProfile = () => {
    setShowProfileManager(true);
    setShowAddMeeting(false);
    setMenuOpen(false);
  };

  const handleCloseForm = () => {
    setShowAddMeeting(false);
    setEditMeeting(null);
  };

  const handleEditMeeting = (meetingId: string) => {
    setEditMeeting(meetingId);
    setShowAddMeeting(true);
    setShowProfileManager(false);
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const confirmLogout = () => {
    setMenuOpen(false);
    setShowLogoutConfirm(true);
  };
  
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  const navigateToDashboard = () => {
    setShowAddMeeting(false);
    setShowProfileManager(false);
    setEditMeeting(null);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      
      if (logoutConfirmRef.current && !logoutConfirmRef.current.contains(event.target as Node)) {
        setShowLogoutConfirm(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find the meeting being edited
  const meetingToEdit = editMeeting && userProfile
    ? userProfile.meetings.find(m => m.id === editMeeting)
    : undefined;
    
  // Calculate some basic stats for the dashboard
  const totalMeetings = userProfile?.meetings?.length || 0;
  const upcomingMeetings = userProfile?.meetings?.filter(m => {
    // For recurring meetings, check if today matches the pattern
    // For specific dates, check if any dates are in the future
    if (m.recurringType === 'specific' && m.specificDates && m.specificDates.length > 0) {
      return m.specificDates.some(dateStr => {
        const specificDate = new Date(dateStr);
        return specificDate >= new Date();
      });
    }
    // If we can't determine, count it as upcoming
    return true;
  }).length || 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="app-branding dashboard-branding" onClick={navigateToDashboard}>
          <div className="logo-container">
            <div className="logo-icon">d</div>
            <h1>dayLink</h1>
          </div>
          <p className="tagline">Meeting Scheduler</p>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button 
              className="action-button add"
              onClick={handleAddMeeting}
              title="Add Meeting"
            >
              <FaPlus /> Add Meeting
            </button>
            <button 
              className="hamburger-menu-button"
              onClick={toggleMenu}
              title="Menu"
            >
              <FaBars />
            </button>
            {menuOpen && (
              <div className="menu-dropdown" ref={menuRef}>
                <button 
                  className="menu-item"
                  onClick={handleManageProfile}
                >
                  <FaCog /> Manage Profile
                </button>
                <button 
                  className="menu-item"
                  onClick={confirmLogout}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {!showAddMeeting && !showProfileManager && (
        <div className="dashboard-welcome">
          <h2>Welcome, {userProfile?.username || 'User'}</h2>
          <p className="welcome-subtitle">Here's your meeting overview</p>
          
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-details">
                <div className="stat-value">{totalMeetings}</div>
                <div className="stat-label">Total Meetings</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-details">
                <div className="stat-value">{upcomingMeetings}</div>
                <div className="stat-label">Upcoming</div>
              </div>
            </div>
          </div>

          <div className="backup-reminder">
            <p>
              <strong>Remember:</strong> Your data is stored in your browser. 
              <button className="text-button" onClick={handleManageProfile}>
                Export your profile
              </button> 
              to backup your data.
            </p>
          </div>
        </div>
      )}

      <main className="dashboard-content">
        {showAddMeeting ? (
          <MeetingForm 
            meeting={meetingToEdit} 
            onClose={handleCloseForm} 
          />
        ) : showProfileManager ? (
          <ProfileManager onClose={() => setShowProfileManager(false)} />
        ) : (
          <MeetingList onEditMeeting={handleEditMeeting} />
        )}
      </main>
      
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-dialog center-dialog" ref={logoutConfirmRef}>
            <p>Are you sure you want to logout?</p>
            <div className="confirmation-actions">
              <button 
                className="confirm-button confirm-yes" 
                onClick={handleLogout}
              >
                Yes
              </button>
              <button 
                className="confirm-button confirm-no" 
                onClick={cancelLogout}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;