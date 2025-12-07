/*
  # Expense Tracker Schema

  ## Overview
  Creates a complete expense tracking system with categories and expenses.

  ## New Tables
  
  ### `categories`
  - `id` (uuid, primary key) - Unique identifier for each category
  - `name` (text, not null) - Category name (e.g., Food, Transport, Entertainment)
  - `color` (text, not null) - Hex color code for visual representation
  - `icon` (text) - Icon name for the category
  - `user_id` (uuid) - Reference to auth.users (for future multi-user support)
  - `created_at` (timestamptz) - Timestamp of creation

  ### `expenses`
  - `id` (uuid, primary key) - Unique identifier for each expense
  - `amount` (decimal, not null) - Expense amount
  - `category_id` (uuid, foreign key) - Reference to categories table
  - `description` (text) - Optional description of the expense
  - `date` (date, not null) - Date of the expense
  - `user_id` (uuid) - Reference to auth.users (for future multi-user support)
  - `created_at` (timestamptz) - Timestamp of creation

  ## Security
  - Enable RLS on both tables
  - Public access policies for demo purposes (can be restricted later for auth)
  
  ## Notes
  - Decimal type used for precise monetary calculations
  - Categories have colors for visual chart representation
  - Expenses linked to categories via foreign key
  - Includes indexes for better query performance
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  icon text DEFAULT 'circle',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public access for demo)
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Public can insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update categories"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete categories"
  ON categories FOR DELETE
  USING (true);

-- RLS Policies for expenses (public access for demo)
CREATE POLICY "Public can view expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Public can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update expenses"
  ON expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete expenses"
  ON expenses FOR DELETE
  USING (true);

-- Insert default categories
INSERT INTO categories (name, color, icon) VALUES
  ('Food & Dining', '#10b981', 'utensils'),
  ('Transportation', '#3b82f6', 'car'),
  ('Shopping', '#f59e0b', 'shopping-bag'),
  ('Entertainment', '#8b5cf6', 'film'),
  ('Bills & Utilities', '#ef4444', 'receipt'),
  ('Healthcare', '#ec4899', 'heart-pulse'),
  ('Education', '#06b6d4', 'book-open'),
  ('Other', '#6b7280', 'circle')
ON CONFLICT DO NOTHING;