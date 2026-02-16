-- Initial schema for Bulking Buddy

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    target_weight DECIMAL(5, 2) NOT NULL,
    current_weight DECIMAL(5, 2) NOT NULL,
    daily_calories INTEGER NOT NULL,
    daily_protein INTEGER NOT NULL,
    start_date DATE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Weight history table
CREATE TABLE IF NOT EXISTS weight_history (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    weight DECIMAL(5, 2) NOT NULL,
    image TEXT, -- Base64 string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food items table (linked to meals)
CREATE TABLE IF NOT EXISTS food_items (
    id TEXT PRIMARY KEY,
    meal_id TEXT REFERENCES meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: This app currently supports a single user. 
-- For multi-user support, we would need a 'user_id' column in all tables.
