import { useState, useCallback, useEffect, useMemo } from "react";
import type { Meal, FoodItem, WeightEntry, UserGoals } from "@/types/bulking";
import { supabase } from "@/lib/supabase";
import { compressImage, base64ToFile } from "@/lib/imageCompression";
import { toast } from "sonner";

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

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured) {
        // Fallback to localStorage if Supabase is not configured
        const savedMeals = localStorage.getItem(STORAGE_KEYS.MEALS);
        const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
        const savedWeight = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
        if (savedMeals) setMeals(JSON.parse(savedMeals));
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        if (savedWeight) setWeightHistory(JSON.parse(savedWeight));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [mealsRes, goalsRes, weightRes, foodsRes] = await Promise.all([
          supabase.from("meals").select("*"),
          supabase.from("goals").select("*").limit(1).maybeSingle(),
          supabase.from("weight_history").select("*").order("date", { ascending: true }),
          supabase.from("food_items").select("*"),
        ]);

        if (mealsRes.data) {
          const fullMeals = mealsRes.data.map(meal => ({
            ...meal,
            foods: (foodsRes.data || []).filter(f => f.meal_id === meal.id)
          }));
          if (fullMeals.length > 0) setMeals(fullMeals);
        }

        if (goalsRes.data) {
          setGoals({
            targetWeight: Number(goalsRes.data.target_weight),
            currentWeight: Number(goalsRes.data.current_weight),
            dailyCalories: goalsRes.data.daily_calories,
            dailyProtein: goalsRes.data.daily_protein,
            startDate: goalsRes.data.start_date,
          });
        }

        if (weightRes.data) {
          setWeightHistory(weightRes.data.map((e: any) => ({
            ...e,
            weight: Number(e.weight)
          })));
        }
      } catch (error) {
        console.error("Failed to fetch data from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSupabaseConfigured]);

  const uploadImage = async (base64: string, id: string): Promise<string | null> => {
    console.log("Starting image upload for ID:", id);
    try {
      const file = await base64ToFile(base64, `photo-${id}.jpg`);
      console.log("File prepared, compressing...");
      const compressed = await compressImage(file);
      console.log("Compression complete. Original size:", (file.size / 1024).toFixed(2), "KB, Compressed size:", (compressed.size / 1024).toFixed(2), "KB");

      const fileName = `progress/${id}-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("progress-photos")
        .upload(fileName, compressed, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        console.error("Supabase Storage Error:", error);
        toast.error(`Gagal upload foto: ${error.message}`);
        return null;
      }

      console.log("Upload successful, fetching public URL...");
      const { data: { publicUrl } } = supabase.storage
        .from("progress-photos")
        .getPublicUrl(fileName);

      console.log("Public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("General Upload Exception:", error);
      toast.error("Terjadi kesalahan saat mengunggah foto.");
      return null;
    }
  };

  // Sync to database and localStorage
  const saveGoals = async (newGoals: UserGoals) => {
    setGoals(newGoals);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));

    if (isSupabaseConfigured) {
      await supabase.from("goals").upsert({
        id: 1, // Single user app
        target_weight: newGoals.targetWeight,
        current_weight: newGoals.currentWeight,
        daily_calories: newGoals.dailyCalories,
        daily_protein: newGoals.dailyProtein,
        start_date: newGoals.startDate,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const syncMeal = async (meal: Meal) => {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals.map(m => m.id === meal.id ? meal : m)));

    if (isSupabaseConfigured) {
      // Upsert meal
      await supabase.from("meals").upsert({
        id: meal.id,
        name: meal.name,
        time: meal.time,
        completed: meal.completed,
      });

      // Cleanup and re-insert foods (transaction-like)
      await supabase.from("food_items").delete().eq("meal_id", meal.id);

      if (meal.foods.length > 0) {
        await supabase.from("food_items").insert(
          meal.foods.map(f => ({
            id: f.id,
            meal_id: meal.id,
            name: f.name,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
          }))
        );
      }
    }
  };

  const addFoodToMeal = useCallback(async (mealId: string, food: FoodItem) => {
    setMeals(prev => {
      const meal = prev.find(m => m.id === mealId);
      if (!meal) return prev;
      const updatedMeal = { ...meal, foods: [...meal.foods, food] };
      syncMeal(updatedMeal);
      return prev.map(m => (m.id === mealId ? updatedMeal : m));
    });
  }, [isSupabaseConfigured]);

  const removeFoodFromMeal = useCallback(async (mealId: string, foodId: string) => {
    setMeals(prev => {
      const meal = prev.find(m => m.id === mealId);
      if (!meal) return prev;
      const updatedMeal = { ...meal, foods: meal.foods.filter(f => f.id !== foodId) };
      syncMeal(updatedMeal);
      return prev.map(m => (m.id === mealId ? updatedMeal : m));
    });
  }, [isSupabaseConfigured]);

  const addMeal = useCallback(async (meal: Meal) => {
    setMeals(prev => [...prev, meal]);
    await syncMeal(meal);
  }, [isSupabaseConfigured]);

  const removeMeal = useCallback(async (mealId: string) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
    if (isSupabaseConfigured) {
      await supabase.from("meals").delete().eq("id", mealId);
    }
  }, [isSupabaseConfigured]);

  const toggleMealCompletion = useCallback(async (mealId: string) => {
    setMeals(prev => {
      const meal = prev.find(m => m.id === mealId);
      if (!meal) return prev;
      const completed = !meal.completed;
      const updatedMeal = { ...meal, completed };
      if (isSupabaseConfigured) {
        supabase.from("meals").update({ completed }).eq("id", mealId).then();
      }
      return prev.map(m => (m.id === mealId ? updatedMeal : m));
    });
  }, [isSupabaseConfigured]);

  const addWeightEntry = useCallback(async (entry: WeightEntry) => {
    let finalImageUrl = entry.image;

    if (entry.image?.startsWith("data:image")) {
      toast.info("Mengunggah foto ke cloud...");
      const uploadedUrl = await uploadImage(entry.image, entry.id);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
        toast.success("Foto berhasil diunggah!");
      } else {
        console.warn("Upload failed, falling back to local storage for the image content.");
        toast.warning("Gagal mengunggah foto ke cloud, menyimpan secara lokal.");
      }
    }

    const entryWithStoredImage = { ...entry, image: finalImageUrl };

    setWeightHistory(prev => {
      const updated = [...prev, entryWithStoredImage].sort((a, b) => a.date.localeCompare(b.date));
      localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(updated));

      if (isSupabaseConfigured) {
        supabase.from("weight_history").upsert({
          id: entryWithStoredImage.id,
          date: entryWithStoredImage.date,
          weight: entryWithStoredImage.weight,
          image: entryWithStoredImage.image,
        }).then(({ error }) => {
          if (error) {
            console.error("Database Upsert Error:", error);
            toast.error("Gagal sinkronisasi data berat ke database.");
          }
        });
      }
      return updated;
    });
  }, [isSupabaseConfigured]);

  const removeWeightEntry = useCallback(async (entryId: string) => {
    const entry = weightHistory.find(e => e.id === entryId);
    if (!entry) return;

    // Delete photo from storage if it's a Supabase URL
    if (entry.image?.includes(".supabase.co/storage/v1/object/public/progress-photos/")) {
      try {
        const path = entry.image.split("/progress-photos/")[1];
        await supabase.storage.from("progress-photos").remove([path]);
      } catch (error) {
        console.error("Failed to delete photo from storage:", error);
      }
    }

    setWeightHistory(prev => {
      const updated = prev.filter(e => e.id !== entryId);
      localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(updated));

      if (isSupabaseConfigured) {
        supabase.from("weight_history").delete().eq("id", entryId).then(({ error }) => {
          if (error) {
            console.error("Database Delete Error:", error);
            toast.error("Gagal menghapus data dari database.");
          } else {
            toast.success("Data berat badan berhasil dihapus.");
          }
        });
      }
      return updated;
    });
  }, [weightHistory, isSupabaseConfigured]);

  // Derive totals only from completed meals
  const completedMeals = meals.filter(m => m.completed);
  const totalCalories = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.calories, 0), 0);
  const totalProtein = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.protein, 0), 0);
  const totalCarbs = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.carbs, 0), 0);
  const totalFat = completedMeals.reduce((sum, m) => sum + m.foods.reduce((s, f) => s + f.fat, 0), 0);

  const currentWeight = useMemo(() =>
    weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0
    , [weightHistory]);

  const totalGain = useMemo(() => {
    if (currentWeight === 0) return 0;
    return Math.max(0, currentWeight - goals.currentWeight);
  }, [currentWeight, goals.currentWeight]);

  const weightProgress = useMemo(() => {
    if (currentWeight === 0) return 0;
    const start = goals.currentWeight;
    const target = goals.targetWeight;
    if (target <= start) return 0;
    return Math.min(100, Math.max(0, ((currentWeight - start) / (target - start)) * 100));
  }, [currentWeight, goals.currentWeight, goals.targetWeight]);

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
    removeWeightEntry,
    weightProgress,
    totalGain,
    daysElapsed,
    loading,
  };
}
