import { useState, useCallback } from "react";
import type { Meal, FoodItem, WeightEntry, UserGoals } from "@/types/bulking";

const defaultGoals: UserGoals = {
  targetWeight: 75,
  currentWeight: 65,
  dailyCalories: 3000,
  dailyProtein: 150,
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
  },
  {
    id: "3",
    name: "Snack Sore",
    time: "16:00",
    foods: [
      { id: "f7", name: "Pisang (2)", calories: 210, protein: 3, carbs: 54, fat: 1 },
      { id: "f8", name: "Selai Kacang 2 sdm", calories: 190, protein: 7, carbs: 7, fat: 16 },
    ],
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
  },
];

const defaultWeightHistory: WeightEntry[] = [
  { date: "2026-01-14", weight: 63 },
  { date: "2026-01-21", weight: 63.5 },
  { date: "2026-01-28", weight: 64 },
  { date: "2026-02-04", weight: 64.3 },
  { date: "2026-02-11", weight: 65 },
];

export function useBulkingStore() {
  const [meals, setMeals] = useState<Meal[]>(defaultMeals);
  const [goals, setGoals] = useState<UserGoals>(defaultGoals);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(defaultWeightHistory);

  const totalCalories = meals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.calories, 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.protein, 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.carbs, 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.fat, 0), 0);

  const addFoodToMeal = useCallback((mealId: string, food: FoodItem) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, foods: [...m.foods, food] } : m))
    );
  }, []);

  const removeFoodFromMeal = useCallback((mealId: string, foodId: string) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) } : m
      )
    );
  }, []);

  const addMeal = useCallback((meal: Meal) => {
    setMeals((prev) => [...prev, meal]);
  }, []);

  const removeMeal = useCallback((mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  }, []);

  const addWeightEntry = useCallback((entry: WeightEntry) => {
    setWeightHistory((prev) => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  const weightProgress = goals.targetWeight > 0
    ? Math.min(100, ((goals.currentWeight - (weightHistory[0]?.weight || goals.currentWeight)) / (goals.targetWeight - (weightHistory[0]?.weight || goals.currentWeight))) * 100)
    : 0;

  return {
    meals,
    goals,
    setGoals,
    weightHistory,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    addFoodToMeal,
    removeFoodFromMeal,
    addMeal,
    removeMeal,
    addWeightEntry,
    weightProgress: Math.max(0, weightProgress),
  };
}
