import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import DashboardView from "@/components/DashboardView";
import MealsView from "@/components/MealsView";
import ProgressView from "@/components/ProgressView";
import GalleryView from "@/components/GalleryView";
import { useBulkingStore } from "@/hooks/useBulkingStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const store = useBulkingStore();
  const push = usePushNotifications();

  // Sync meal reminders whenever schedule changes
  useEffect(() => {
    if (store.meals.length > 0) {
      push.syncMealReminders(store.meals);
    }
  }, [store.meals, push.syncMealReminders]);

  if (store.loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-transparent"></div>
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Menghubungkan ke database...</p>
      </div>
    );
  }

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
            meals={store.meals}
            toggleMealCompletion={store.toggleMealCompletion}
            registerPush={push.registerDevice}
            isPushSubscribed={push.isSubscribed}
            isRegistering={push.isRegistering}
            testAlarm={push.testAlarm}
            isMedian={push.isMedian}
            isWebSupported={push.isWebNotificationSupported}
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
            removeWeightEntry={store.removeWeightEntry}
            weightProgress={store.weightProgress}
            currentWeight={store.currentWeight}
            totalGain={store.totalGain}
            setGoals={store.setGoals}
          />
        )}
        {activeTab === "gallery" && (
          <GalleryView weightHistory={store.weightHistory} />
        )}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
