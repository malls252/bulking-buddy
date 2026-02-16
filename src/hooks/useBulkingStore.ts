import { useState, useCallback, useEffect } from "react";
import type { Meal, FoodItem, WeightEntry, UserGoals } from "@/types/bulking";

const STORAGE_KEYS = {
  MEALS: "bulking-meals",
  GOALS: "bulking-goals",
  WEIGHT_HISTORY: "bulking-weight-history",
};

const defaultGoals: UserGoals = {
  targetWeight: 75,
  currentWeight: 65,
  dailyCalories: 3000,
  dailyProtein: 150,
  startDate: "2026-02-01",
};

const defaultMeals: Meal[] = [
  {
    id: "1",
    name: "Sarapan",
    time: "07:00",
    foods: [
      { id: "f1", name: "Nasi Putih", calories: 350, protein: 6, carbs: 78, fat: 1 },
      { id: "f2", name: "Telur Rebus (3)", calories: 210, protein: 18, carbs: 2, fat: 15 },
      { id: "f3", name: "Susu Full Cream", calories: 150, protein: 8, carbs: 12, fat: 8 },
    ],
    completed: false,
  },
  {
    id: "2",
    name: "Makan Siang",
    time: "12:00",
    foods: [
      { id: "f4", name: "Nasi Putih", calories: 350, protein: 6, carbs: 78, fat: 1 },
      { id: "f5", name: "Dada Ayam 200g", calories: 330, protein: 62, carbs: 0, fat: 7 },
      { id: "f6", name: "Sayur Brokoli", calories: 55, protein: 4, carbs: 11, fat: 1 },
    ],
    completed: false,
  },
  {
    id: "3",
    name: "Snack Sore",
    time: "16:00",
    foods: [
      { id: "f7", name: "Pisang (2)", calories: 210, protein: 3, carbs: 54, fat: 1 },
      { id: "f8", name: "Selai Kacang 2 sdm", calories: 190, protein: 7, carbs: 7, fat: 16 },
    ],
    completed: false,
  },
  {
    id: "4",
    name: "Makan Malam",
    time: "19:00",
    foods: [
      { id: "f9", name: "Nasi Putih", calories: 350, protein: 6, carbs: 78, fat: 1 },
      { id: "f10", name: "Ikan Salmon 150g", calories: 280, protein: 34, carbs: 0, fat: 16 },
      { id: "f11", name: "Kentang Rebus", calories: 130, protein: 3, carbs: 30, fat: 0 },
    ],
    completed: false,
  },
];

const defaultWeightHistory: WeightEntry[] = [
  { id: "1", date: "2026-02-01", weight: 63 },
  { id: "2", date: "2026-02-04", weight: 64.3 },
  { id: "3", date: "2026-02-11", weight: 65 },
];

export function useBulkingStore() {
  const [meals, setMeals] = useState<Meal[]>(defaultMeals);
  const [goals, setGoals] = useState<UserGoals>(defaultGoals);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(defaultWeightHistory);
  const [loading, setLoading] = useState(true);

  // Fetch initial data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mealsRes, goalsRes, weightRes] = await Promise.all([
          fetch("/api/meals"),
          fetch("/api/goals"),
          fetch("/api/weight"),
        ]);

        const mealsData = await mealsRes.json();
        const goalsData = await goalsRes.json();
        const weightData = await weightRes.json();

        if (mealsData && mealsData.length > 0) setMeals(mealsData);
        if (goalsData) setGoals(goalsData);
        if (weightData) {
          // Compatibility: ensure IDs exist
          setWeightHistory(weightData.map((e: any, i: number) => ({
            ...e,
            id: e.id || `${e.date}-${i}`,
            weight: Number(e.weight) // Ensure weight is numeric
          })));
        }
      } catch (error) {
        console.error("Failed to fetch data from Vercel:", error);
        // Fallback to localStorage if API fails (optional, but good for local dev)
        const savedMeals = localStorage.getItem(STORAGE_KEYS.MEALS);
        const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
        const savedWeight = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
        if (savedMeals) setMeals(JSON.parse(savedMeals));
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        if (savedWeight) setWeightHistory(JSON.parse(savedWeight));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync to database and localStorage
  const saveGoals = async (newGoals: UserGoals) => {
    setGoals(newGoals);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGoals),
    });
  };

  const syncMeal = async (meal: Meal) => {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals.map(m => m.id === meal.id ? meal : m)));
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meal),
    });
  };

  const addFoodToMeal = useCallback(async (mealId: string, food: FoodItem) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const updatedMeal = { ...meal, foods: [...meal.foods, food] };
    setMeals(prev => prev.map(m => (m.id === mealId ? updatedMeal : m)));
    await syncMeal(updatedMeal);
  }, [meals]);

  const removeFoodFromMeal = useCallback(async (mealId: string, foodId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const updatedMeal = { ...meal, foods: meal.foods.filter(f => f.id !== foodId) };
    setMeals(prev => prev.map(m => (m.id === mealId ? updatedMeal : m)));
    await syncMeal(updatedMeal);
  }, [meals]);

  const addMeal = useCallback(async (meal: Meal) => {
    setMeals(prev => [...prev, meal]);
    await syncMeal(meal);
  }, [meals]);

  const removeMeal = useCallback(async (mealId: string) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
    await fetch(`/api/meals?id=${mealId}`, { method: "DELETE" });
  }, []);

  const toggleMealCompletion = useCallback(async (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const completed = !meal.completed;
    setMeals(prev => prev.map(m => (m.id === mealId ? { ...m, completed } : m)));

    await fetch("/api/meals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: mealId, completed }),
    });
  }, [meals]);

  const addWeightEntry = useCallback(async (entry: WeightEntry) => {
    setWeightHistory(prev => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)));
    localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify([...weightHistory, entry]));

    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  }, [weightHistory]);

  // Derive totals only from completed meals
  const completedMeals = meals.filter(m => m.completed);
  const totalCalories = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.calories, 0), 0);
  const totalProtein = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.protein, 0), 0);
  const totalCarbs = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.carbs, 0), 0);
  const totalFat = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.fat, 0), 0);

  const initialWeight = weightHistory[0]?.weight || goals.currentWeight;
  const currentWeight = weightHistory[weightHistory.length - 1]?.weight || goals.currentWeight;

  const weightProgress = goals.targetWeight > initialWeight
    ? Math.min(100, Math.max(0, ((currentWeight - initialWeight) / (goals.targetWeight - initialWeight)) * 100))
    : 0;

  const daysElapsed = Math.floor((new Date().getTime() - new Date(goals.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    meals,
    goals,
    setGoals: saveGoals,
    weightHistory,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    currentWeight,
    addFoodToMeal,
    removeFoodFromMeal,
    addMeal,
    removeMeal,
    toggleMealCompletion,
    addWeightEntry,
    weightProgress,
    daysElapsed,
    loading,
  };
}
