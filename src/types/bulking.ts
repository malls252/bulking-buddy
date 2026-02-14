export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
  completed: boolean;
}

export interface DayLog {
  date: string;
  meals: Meal[];
  weight?: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface UserGoals {
  targetWeight: number;
  currentWeight: number;
  dailyCalories: number;
  dailyProtein: number;
  startDate: string;
}
