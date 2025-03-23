import { v4 as uuidv4 } from 'uuid';
import { format, isWeekend } from 'date-fns';
import { Meeting, MeetingType, RecurringType, UserProfile } from '../types/index';
import { saveUserProfile } from './encryption';

// Create a new meeting
export const createMeeting = (
  profile: UserProfile,
  type: MeetingType,
  link: string,
  recurringType: RecurringType,
  time: string,
  specificDates?: string[],
  description?: string,
  specificDays?: string[]
): UserProfile => {
  const now = new Date().toISOString();
  
  const newMeeting: Meeting = {
    id: uuidv4(),
    type,
    link,
    recurringType,
    time,
    specificDates,
    description,
    specificDays,
    createdAt: now,
    updatedAt: now
  };
  
  const updatedProfile = {
    ...profile,
    meetings: [...profile.meetings, newMeeting]
  };
  
  saveUserProfile(updatedProfile);
  return updatedProfile;
};

// Update an existing meeting
export const updateMeeting = (
  profile: UserProfile,
  meetingId: string,
  updates: Partial<Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>>
): UserProfile => {
  const now = new Date().toISOString();
  
  const updatedMeetings = profile.meetings.map(meeting => {
    if (meeting.id === meetingId) {
      return {
        ...meeting,
        ...updates,
        updatedAt: now
      };
    }
    return meeting;
  });
  
  const updatedProfile = {
    ...profile,
    meetings: updatedMeetings
  };
  
  saveUserProfile(updatedProfile);
  return updatedProfile;
};

// Delete a meeting
export const deleteMeeting = (
  profile: UserProfile,
  meetingId: string
): UserProfile => {
  const updatedMeetings = profile.meetings.filter(meeting => meeting.id !== meetingId);
  
  const updatedProfile = {
    ...profile,
    meetings: updatedMeetings
  };
  
  saveUserProfile(updatedProfile);
  return updatedProfile;
};

// Get today's meetings
export const getTodaysMeetings = (profile: UserProfile): Meeting[] => {
  const today = new Date();
  const isWeekendToday = isWeekend(today);
  const todayStr = format(today, 'yyyy-MM-dd');
  const dayOfWeek = format(today, 'EEEE'); // Returns day name like "Monday"
  
  return profile.meetings.filter(meeting => {
    // Check for specific dates
    if (meeting.recurringType === 'specific' && meeting.specificDates) {
      return meeting.specificDates.includes(todayStr);
    }
    
    // Check for specific days of the week
    if (meeting.recurringType === 'specificDays' && meeting.specificDays) {
      return meeting.specificDays.includes(dayOfWeek);
    }
    
    // Check for weekdays (Monday-Friday)
    if (meeting.recurringType === 'weekdays') {
      return !isWeekendToday;
    }
    
    // Check for weekends (Saturday-Sunday)
    if (meeting.recurringType === 'weekends') {
      return isWeekendToday;
    }
    
    return false;
  }).sort((a, b) => {
    // Sort by time (earliest to latest)
    return a.time.localeCompare(b.time);
  });
};

// Format date for display
export const formatDate = (date: Date = new Date()): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

// Format time for display
export const formatTime = (time: string): string => {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

// Create a new user profile
export const createNewUserProfile = (uniquePhrase: string, username?: string): UserProfile => {
  return {
    uniquePhrase,
    username,
    meetings: []
  };
};

// Delete user profile
export const deleteUserProfile = (profile: UserProfile): void => {
  const { uniquePhrase } = profile;
  const storageKey = `meeting_data_${uniquePhrase}`;
  localStorage.removeItem(storageKey);
};