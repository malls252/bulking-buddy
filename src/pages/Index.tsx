import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import DashboardView from "@/components/DashboardView";
import MealsView from "@/components/MealsView";
import ProgressView from "@/components/ProgressView";
import { useBulkingStore } from "@/hooks/useBulkingStore";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const store = useBulkingStore();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {activeTab === "dashboard" && (
          <DashboardView
            totalCalories={store.totalCalories}
            totalProtein={store.totalProtein}
            totalCarbs={store.totalCarbs}
            totalFat={store.totalFat}
            goals={store.goals}
            weightProgress={store.weightProgress}
            daysElapsed={store.daysElapsed}
            currentWeight={store.currentWeight}
          />
        )}
        {activeTab === "meals" && (
          <MealsView
            meals={store.meals}
            addFoodToMeal={store.addFoodToMeal}
            removeFoodFromMeal={store.removeFoodFromMeal}
            addMeal={store.addMeal}
            removeMeal={store.removeMeal}
            toggleMealCompletion={store.toggleMealCompletion}
          />
        )}
        {activeTab === "progress" && (
          <ProgressView
            weightHistory={store.weightHistory}
            goals={store.goals}
            addWeightEntry={store.addWeightEntry}
            weightProgress={store.weightProgress}
            setGoals={store.setGoals}
          />
        )}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
