import { useState, useEffect } from 'react';
import { FaLink, FaClock, FaCalendarAlt, FaAlignLeft } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Meeting, MeetingType, RecurringType } from '../types/index';
import { useAppContext } from '../context/AppContext';
import { createMeeting, updateMeeting } from '../utils/meetingUtils';
import { format } from 'date-fns';

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
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!link.trim()) {
      setError('Please enter a meeting link');
      return false;
    }

    // Basic URL validation
    try {
      new URL(link);
    } catch (e) {
      setError('Please enter a valid URL (e.g., https://zoom.us/j/123456789)');
      return false;
    }

    if (recurringType === 'specific' && specificDates.length === 0) {
      setError('Please select at least one date for specific meetings');
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
        specificDates: recurringType === 'specific' ? formattedDates : undefined
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
        description
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
          <label>Meeting Type</label>
          <div className="meeting-type-options">
            {(['Google Meet', 'Microsoft Teams', 'Zoom'] as MeetingType[]).map(meetingType => (
              <label key={meetingType} className="radio-label">
                <input
                  type="radio"
                  name="meetingType"
                  value={meetingType}
                  checked={type === meetingType}
                  onChange={() => setType(meetingType)}
                />
                <span>{meetingType}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="meetingLink">Meeting Link</label>
          <div className="input-group">
            <FaLink className="input-icon" />
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
            {(['weekdays', 'weekends', 'specific'] as RecurringType[]).map(type => (
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
                <span>{type === 'weekdays' ? 'Every Weekday' : 
                       type === 'weekends' ? 'Every Weekend' : 
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
                onChange={(date: Date) => {
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
                dateFormat="MMMM d, yyyy"
              />
            </div>
            
            {specificDates.length > 0 && (
              <div className="selected-dates">
                <h4>Selected Dates:</h4>
                <ul>
                  {specificDates.map((date, index) => (
                    <li key={index}>
                      {format(date, 'MMMM d, yyyy')}
                      <button 
                        type="button" 
                        className="remove-date"
                        onClick={() => setSpecificDates(specificDates.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="meetingTime">Meeting Time</label>
          <div className="input-group">
            <FaClock className="input-icon" />
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