import { useState, useEffect } from 'react';
import { FaLink, FaClock, FaCalendarAlt, FaAlignLeft, FaCalendarCheck, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Meeting, MeetingType, RecurringType } from '../types/index';
import { useAppContext } from '../context/AppContext';
import { createMeeting, updateMeeting } from '../utils/meetingUtils';
import { format } from 'date-fns';
import meetSvg from '../assets/meet.svg';
import teamsSvg from '../assets/teams.svg';
import zoomSvg from '../assets/zoom.svg';

const GoogleMeetIcon = () => (
  <img src={meetSvg} alt="Google Meet" width="20" height="20" />
);

const TeamsIcon = () => (
  <img src={teamsSvg} alt="Microsoft Teams" width="20" height="20" />
);

const ZoomIcon = () => (
  <img src={zoomSvg} alt="Zoom" width="20" height="20" />
);

interface MeetingFormProps {
  meeting?: Meeting;
  onClose: () => void;
}

const MeetingForm = ({ meeting, onClose }: MeetingFormProps) => {
  const { userProfile, setUserProfileState } = useAppContext();
  const [type, setType] = useState<MeetingType>(meeting?.type || 'Google Meet');
  const [link, setLink] = useState(meeting?.link || '');
  const [description, setDescription] = useState(meeting?.description || '');
  const [recurringType, setRecurringType] = useState<RecurringType>(meeting?.recurringType || 'weekdays');
  const [time, setTime] = useState(meeting?.time || '09:00');
  const [specificDates, setSpecificDates] = useState<Date[]>(
    meeting?.specificDates ? meeting.specificDates.map(date => new Date(date)) : []
  );
  const [specificDays, setSpecificDays] = useState<string[]>(
    meeting?.specificDays || []
  );
  const [error, setError] = useState('');

  // Auto-detects meeting platform type from the meeting link URL
  useEffect(() => {
    if (!link) return;
    
    try {
      let urlToCheck = link;
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        urlToCheck = 'https://' + link;
      }
      
      const url = new URL(urlToCheck);
      const domain = url.hostname.toLowerCase();
      
      if (domain.includes('meet.google.com')) {
        setType('Google Meet');
      } else if (domain.includes('teams.microsoft.com')) {
        setType('Microsoft Teams');
      } else if (domain.includes('zoom.us')) {
        setType('Zoom');
      } else {
        setType('Other');
      }
    } catch (e) {
      setType('Other');
    }
  }, [link]);

  // Returns the icon component for the current meeting platform
  const getMeetingTypeIcon = () => {
    switch (type) {
      case 'Google Meet':
        return <GoogleMeetIcon />;
      case 'Microsoft Teams':
        return <TeamsIcon />;
      case 'Zoom':
        return <ZoomIcon />;
      default:
        return <FaLink size={16} />;
    }
  };

  // Validates the form data before submission
  const validateForm = () => {
    if (!link.trim()) {
      setError('Please enter a meeting link');
      return false;
    }

    try {
      let urlToCheck = link;
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        urlToCheck = 'https://' + link;
      }
      
      new URL(urlToCheck);
    } catch (e) {
      setError('Please enter a valid URL (e.g., https://zoom.us/j/123456789)');
      return false;
    }

    if (recurringType === 'specific' && specificDates.length === 0) {
      setError('Please select at least one date for specific meetings');
      return false;
    }

    if (recurringType === 'specificDays' && specificDays.length === 0) {
      setError('Please select at least one day of the week');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userProfile) return;

    // Format specific dates to ISO strings (YYYY-MM-DD)
    const formattedDates = specificDates.map(date => format(date, 'yyyy-MM-dd'));

    if (meeting) {
      // Update existing meeting
      const updatedProfile = updateMeeting(userProfile, meeting.id, {
        type,
        link,
        description,
        recurringType,
        time,
        specificDates: recurringType === 'specific' ? formattedDates : undefined,
        specificDays: recurringType === 'specificDays' ? specificDays : undefined
      });
      setUserProfileState(updatedProfile);
    } else {
      // Create new meeting
      const updatedProfile = createMeeting(
        userProfile,
        type,
        link,
        recurringType,
        time,
        recurringType === 'specific' ? formattedDates : undefined,
        description,
        recurringType === 'specificDays' ? specificDays : undefined
      );
      setUserProfileState(updatedProfile);
    }

    onClose();
  };

  return (
    <div className="meeting-form-container">
      <h2>{meeting ? 'Edit Meeting' : 'Add New Meeting'}</h2>
      
      <form onSubmit={handleSubmit} className="meeting-form">
        <div className="form-group">
          <label htmlFor="meetingLink">Meeting Link</label>
          <div className="input-group">
            <span className="input-icon">
              {link ? getMeetingTypeIcon() : <FaLink size={16} />}
            </span>
            <input
              id="meetingLink"
              type="text"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setError('');
              }}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="text-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="meetingDescription">Meeting Description</label>
          <div className="input-group">
            <FaAlignLeft className="input-icon" />
            <input
              id="meetingDescription"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter brief meeting description (optional)"
              className="text-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Meeting Schedule</label>
          <div className="recurring-type-options">
            {(['everyday', 'weekdays', 'weekends', 'specificDays', 'specific'] as RecurringType[]).map(type => (
              <label key={type} className="radio-label">
                <input
                  type="radio"
                  name="recurringType"
                  value={type}
                  checked={recurringType === type}
                  onChange={() => {
                    setRecurringType(type);
                    setError('');
                  }}
                />
                <span>{type === 'everyday' ? 'Everyday' :
                       type === 'weekdays' ? 'Weekdays' : 
                       type === 'weekends' ? 'Weekends' : 
                       type === 'specificDays' ? 'Specific Days' :
                       'Specific Dates'}</span>
              </label>
            ))}
          </div>
        </div>
        
        {recurringType === 'specific' && (
          <div className="form-group">
            <label>Select Dates</label>
            <div className="date-picker-container">
              <FaCalendarAlt className="input-icon" />
              <DatePicker
                selected={null}
                onChange={(date: Date | null) => {
                  if (date) {
                    // Check if date already exists in the array
                    const dateExists = specificDates.some(d => 
                      format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    );
                    
                    if (!dateExists) {
                      setSpecificDates([...specificDates, date]);
                    }
                    setError('');
                  }
                }}
                placeholderText="Click to select dates"
                className="date-picker"
                dateFormat="EEEE, MMMM d, yyyy"
                minDate={new Date()} // Prevent selection of past dates
              />
            </div>
            
            {specificDates.length > 0 && (
              <div className="selected-dates">
                <h4><FaCalendarCheck /> Selected Dates:</h4>
                <ul>
                  {specificDates.map((date, index) => (
                    <li key={index}>
                      {format(date, 'EEEE, MMMM d, yyyy')}
                      <button 
                        type="button" 
                        className="remove-date"
                        onClick={() => setSpecificDates(specificDates.filter((_, i) => i !== index))}
                        aria-label="Remove date"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <FaTimes style={{ color: '#ff4d4f', fontSize: '1.2em' }} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {recurringType === 'specificDays' && (
          <div className="form-group">
            <label>Select Days of the Week</label>
            <div className="days-container">
              <div className="weekday-selector">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <label key={day} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={specificDays.includes(day)}
                      onChange={() => {
                        if (specificDays.includes(day)) {
                          setSpecificDays(specificDays.filter(d => d !== day));
                        } else {
                          setSpecificDays([...specificDays, day]);
                        }
                        setError('');
                      }}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              <div className="weekend-selector">
                {['Saturday', 'Sunday'].map(day => (
                  <label key={day} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={specificDays.includes(day)}
                      onChange={() => {
                        if (specificDays.includes(day)) {
                          setSpecificDays(specificDays.filter(d => d !== day));
                        } else {
                          setSpecificDays([...specificDays, day]);
                        }
                        setError('');
                      }}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="meetingTime">Meeting Time</label>
          <div className="input-group time-input-container">
            <FaClock className="input-icon" style={{ color: 'var(--primary-color)' }} />
            <input
              id="meetingTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="time-input"
            />
          </div>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="button-group">
          <button type="submit" className="primary-button">
            {meeting ? 'Save Changes' : 'Add Meeting'}
          </button>
          <button 
            type="button" 
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;