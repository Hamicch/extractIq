export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}
