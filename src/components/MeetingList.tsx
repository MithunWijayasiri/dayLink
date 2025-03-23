import { useState, useRef, useEffect } from 'react';
import { FaEdit, FaTrash, FaExternalLinkAlt, FaInfoCircle, FaLink } from 'react-icons/fa';
import { Meeting } from '../types/index';
import { useAppContext } from '../context/AppContext';
import { formatDate, formatTime } from '../utils/meetingUtils';
import meetSvg from '../assets/meet.svg';
import teamsSvg from '../assets/teams.svg';
import zoomSvg from '../assets/zoom.svg';

interface MeetingListProps {
  onEditMeeting: (meetingId: string) => void;
}

const MeetingList = ({ onEditMeeting }: MeetingListProps) => {
  const { todaysMeetings, userProfile, setUserProfileState } = useAppContext();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  // Close confirm dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target as Node)) {
        setDeleteConfirmId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to get the appropriate icon for the meeting type
  const getMeetingTypeIcon = (type: Meeting['type']) => {
    switch (type) {
      case 'Google Meet':
        return <img src={meetSvg} alt="Google Meet" width="24" height="24" />;
      case 'Microsoft Teams':
        return <img src={teamsSvg} alt="Microsoft Teams" width="24" height="24" />;
      case 'Zoom':
        return <img src={zoomSvg} alt="Zoom" width="24" height="24" />;
      default:
        return <FaLink size={24} />;
    }
  };

  // Function to handle meeting deletion
  const handleDelete = (meetingId: string) => {
    if (!userProfile) return;

    const updatedMeetings = userProfile.meetings.filter(meeting => meeting.id !== meetingId);
    const updatedProfile = {
      ...userProfile,
      meetings: updatedMeetings
    };

    setUserProfileState(updatedProfile);
    setDeleteConfirmId(null);
  };

  // Function to open meeting link in a new tab
  const openMeetingLink = (link: string) => {
    // Add protocol if it's missing
    let urlToOpen = link;
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      urlToOpen = 'https://' + link;
    }
    window.open(urlToOpen, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="meeting-list-container">
      <div className="date-header">
        <h2>{formatDate()}</h2>
      </div>

      {todaysMeetings.length === 0 ? (
        <div className="no-meetings">
          <p>No meetings scheduled for today.</p>
        </div>
      ) : (
        <ul className="meeting-list">
          {todaysMeetings.map(meeting => (
            <li key={meeting.id} className="meeting-item">
              <div className="meeting-type">
                {getMeetingTypeIcon(meeting.type)}
              </div>
              
              {meeting.description && (
                <div className="meeting-description">
                  <FaInfoCircle className="description-icon" />
                  <span>{meeting.description}</span>
                </div>
              )}
              
              <div className="meeting-time">
                {formatTime(meeting.time)}
              </div>
              
              <div className="meeting-actions">
                <button 
                  className="action-button join"
                  onClick={() => openMeetingLink(meeting.link)}
                  title="Join Meeting"
                >
                  <FaExternalLinkAlt /> Join
                </button>
                
                <button 
                  className="action-button edit"
                  onClick={() => onEditMeeting(meeting.id)}
                  title="Edit Meeting"
                >
                  <FaEdit />
                </button>
                
                <button 
                  className="action-button delete"
                  onClick={() => setDeleteConfirmId(meeting.id)}
                  title="Delete Meeting"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="confirmation-dialog center-dialog" ref={deleteConfirmRef}>
            <p>Are you sure you want to delete this meeting?</p>
            <div className="confirmation-actions">
              <button 
                className="confirm-button confirm-yes" 
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Yes
              </button>
              <button 
                className="confirm-button confirm-no" 
                onClick={() => setDeleteConfirmId(null)}
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

export default MeetingList;