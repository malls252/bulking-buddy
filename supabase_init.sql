-- Initial schema for Bulking Buddy on Supabase

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    target_weight NUMERIC(5, 2) NOT NULL,
    current_weight NUMERIC(5, 2) NOT NULL,
    daily_calories INTEGER NOT NULL,
    daily_protein INTEGER NOT NULL,
    start_date DATE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID DEFAULT auth.uid()
);

-- Weight history table
CREATE TABLE IF NOT EXISTS weight_history (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    image TEXT, -- Stores public URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID DEFAULT auth.uid()
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID DEFAULT auth.uid()
);

-- Food items table
CREATE TABLE IF NOT EXISTS food_items (
    id TEXT PRIMARY KEY,
    meal_id TEXT REFERENCES meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID DEFAULT auth.uid()
);

-- Enable Row Level Security (RLS)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Permissive Database Policies (Public Demo)
CREATE POLICY "Public full access to goals" ON goals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to weight_history" ON weight_history FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to meals" ON meals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to food_items" ON food_items FOR ALL TO anon USING (true) WITH CHECK (true);

-- --- STORAGE POLICIES (Run this in SQL Editor) ---
-- Ensure you have created a bucket named 'progress-photos' first.

-- 1. Allow public uploads
CREATE POLICY "Allow Public Upload" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'progress-photos');

-- 2. Allow public viewing
CREATE POLICY "Allow Public View" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'progress-photos');

-- 3. Allow public deletion (Agar foto otomatis terhapus dari bucket)
CREATE POLICY "Allow Public Delete" ON storage.objects
FOR DELETE TO anon
USING (bucket_id = 'progress-photos');
