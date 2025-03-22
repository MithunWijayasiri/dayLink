// Types for the Meeting Scheduler application

export type MeetingType = 'Google Meet' | 'Microsoft Teams' | 'Zoom';

export type RecurringType = 'weekdays' | 'weekends' | 'specific';

export interface Meeting {
  id: string;
  type: MeetingType;
  link: string;
  description?: string; // Optional meeting description
  recurringType: RecurringType;
  specificDates?: string[]; // ISO date strings (YYYY-MM-DD)
  time: string; // 24-hour format (HH:MM)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UserProfile {
  uniquePhrase: string;
  username?: string;
  meetings: Meeting[];
}

export interface EncryptedData {
  data: string; // Encrypted JSON string
}