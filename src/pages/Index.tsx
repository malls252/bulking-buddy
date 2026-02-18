import { useState, useEffect, useRef } from "react";
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

  const isFirstLoad = useRef(true);

  // On app open: auto-reschedule only if stale (>23h since last schedule)
  // On meal change: always reschedule immediately
  useEffect(() => {
    if (store.meals.length === 0) return;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      push.scheduleIfNeeded(store.meals); // throttled — skips if still fresh
    } else {
      push.syncMealReminders(store.meals); // user changed schedule — always sync
    }
  }, [store.meals, push.scheduleIfNeeded, push.syncMealReminders]);

  // Sync OneSignal ID to store if it exists and hasn't been saved
  useEffect(() => {
    if (push.oneSignalId && push.oneSignalId !== store.goals.onesignal_id) {
      console.log("Auto-syncing OneSignal ID to store:", push.oneSignalId);
      store.setGoals({
        ...store.goals,
        onesignal_id: push.oneSignalId
      });
    }
  }, [push.oneSignalId, store.goals, store.setGoals]);

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
