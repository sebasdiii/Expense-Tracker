import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  category_id: string;
  description: string;
  date: string;
  user_id: string | null;
  created_at: string;
  categories?: Category;
}
