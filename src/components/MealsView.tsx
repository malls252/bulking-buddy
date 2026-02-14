import { useState } from "react";
import { Clock, Plus, Trash2, X, CheckCircle2, Circle } from "lucide-react";
import type { Meal, FoodItem } from "@/types/bulking";

interface MealsViewProps {
  meals: Meal[];
  addFoodToMeal: (mealId: string, food: FoodItem) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
  toggleMealCompletion: (mealId: string) => void;
}

export default function MealsView({
  meals,
  addFoodToMeal,
  removeFoodFromMeal,
  addMeal,
  removeMeal,
  toggleMealCompletion
}: MealsViewProps) {
  const [showAddFood, setShowAddFood] = useState<string | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newFood, setNewFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [newMeal, setNewMeal] = useState({ name: "", time: "12:00" });

  const handleAddFood = (mealId: string) => {
    if (!newFood.name) return;
    addFoodToMeal(mealId, {
      id: Date.now().toString(),
      name: newFood.name,
      calories: Number(newFood.calories) || 0,
      protein: Number(newFood.protein) || 0,
      carbs: Number(newFood.carbs) || 0,
      fat: Number(newFood.fat) || 0,
    });
    setNewFood({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    setShowAddFood(null);
  };

  const handleAddMeal = () => {
    if (!newMeal.name) return;
    addMeal({
      id: Date.now().toString(),
      name: newMeal.name,
      time: newMeal.time,
      foods: [],
      completed: false,
    });
    setNewMeal({ name: "", time: "12:00" });
    setShowAddMeal(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jadwal <span className="text-gradient">Makan</span></h1>
        <button
          onClick={() => setShowAddMeal(true)}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3 w-3" /> Tambah Meal
        </button>
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="glass-card rounded-xl p-4 space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Meal Baru</span>
            <button onClick={() => setShowAddMeal(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <input
            placeholder="Nama meal (e.g. Snack Malam)"
            value={newMeal.name}
            onChange={(e) => setNewMeal((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="time"
            value={newMeal.time}
            onChange={(e) => setNewMeal((p) => ({ ...p, time: e.target.value }))}
            className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={handleAddMeal} className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground">
            Simpan
          </button>
        </div>
      )}

      {/* Meal Cards */}
      {meals.map((meal) => {
        const mealCal = meal.foods.reduce((s, f) => s + f.calories, 0);
        return (
          <div
            key={meal.id}
            className={`glass-card rounded-xl p-4 space-y-3 transition-opacity duration-300 ${meal.completed ? "opacity-60" : "opacity-100"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMealCompletion(meal.id)}
                  className={`transition-colors ${meal.completed ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                >
                  {meal.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div>
                  <h3 className={`font-semibold transition-all ${meal.completed ? "text-muted-foreground line-through" : ""}`}>
                    {meal.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" /> {meal.time}
                    <span className="ml-2">{mealCal} kcal</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddFood(showAddFood === meal.id ? null : meal.id)}
                  className="rounded-full bg-secondary p-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="rounded-full bg-secondary p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add Food Form */}
            {showAddFood === meal.id && (
              <div className="space-y-2 pt-2 border-t border-border animate-scale-in">
                <input
                  placeholder="Nama makanan"
                  value={newFood.name}
                  onChange={(e) => setNewFood((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="grid grid-cols-4 gap-2">
                  {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
                    <input
                      key={field}
                      placeholder={field === "calories" ? "Kal" : field === "protein" ? "Pro" : field === "carbs" ? "Kar" : "Lem"}
                      value={newFood[field]}
                      onChange={(e) => setNewFood((p) => ({ ...p, [field]: e.target.value }))}
                      type="number"
                      className="rounded-lg bg-secondary px-2 py-2 text-sm text-center text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                  ))}
                </div>
                <button onClick={() => handleAddFood(meal.id)} className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground">
                  Tambah
                </button>
              </div>
            )}

            {/* Food List */}
            <div className="space-y-1">
              {meal.foods.map((food) => (
                <div key={food.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <div>
                    <span className="text-sm">{food.name}</span>
                    <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{food.calories} kal</span>
                      <span>P:{food.protein}g</span>
                      <span>K:{food.carbs}g</span>
                      <span>L:{food.fat}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFoodFromMeal(meal.id, food.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
