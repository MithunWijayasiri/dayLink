// Type definitions for the Meeting Scheduler application

export type MeetingType = 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Other';

export type RecurringType = 'everyday' | 'weekdays' | 'weekends' | 'specific' | 'specificDays';

export interface Meeting {
  id: string;
  type: MeetingType;
  link: string;
  description?: string;
  recurringType: RecurringType;
  specificDates?: string[];  // Format: YYYY-MM-DD
  specificDays?: string[];   // Format: Monday, Tuesday, etc.
  time: string;             // Format: HH:MM (24-hour)
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
}

export interface UserProfile {
  uniquePhrase: string;     // Unique identifier and encryption key
  username?: string;
  meetings: Meeting[];
}

export interface EncryptedData {
  data: string;             // AES encrypted JSON string
}