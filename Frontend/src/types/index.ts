export type UserRole = 'admin' | 'staff' | 'trainer' | 'learner' | 'superadmin';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string; // Internal role name (e.g., "Trainer", "Staff")
  utype: UserRole; // Mapped role for logic (e.g., "trainer")
  phone?: string;
  is_active: boolean;
  profile_picture_url?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  total_staff: number;
  total_trainers: number;
  total_trainers_pending: number;
  total_learners: number;
  total_learners_pending: number;
  total_modules: number;
  total_lessons: number;
  total_active_learners: number;
  total_lesson_completions: number;
  learner_progress: { name: string; progress: number }[];
}

export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  learner_id: string;
  is_active: boolean;
  enrollment_date?: string;
}

export interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  trainer_id: string;
  specialization?: string;
  qualification?: string;
  bio?: string;
  is_active: boolean;
}

export interface Track {
  id: string;
  name: string;
  description?: string;
  credits: number;
  is_active: boolean;
}
