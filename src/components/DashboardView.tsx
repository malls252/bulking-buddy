import CalorieRing from "./CalorieRing";
import MacroBar from "./MacroBar";
import { Flame, Dumbbell, Target, Clock, CheckCircle2, Circle, Bell, BellRing } from "lucide-react";
import type { UserGoals, Meal } from "@/types/bulking";

interface DashboardViewProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goals: UserGoals;
  weightProgress: number;
  daysElapsed: number;
  currentWeight: number;
  meals: Meal[];
  toggleMealCompletion: (id: string) => void;
  registerPush: () => void;
  isPushSubscribed: boolean;
  isRegistering: boolean;
}

export default function DashboardView({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  goals,
  weightProgress,
  daysElapsed,
  currentWeight,
  meals,
  toggleMealCompletion,
  registerPush,
  isPushSubscribed,
  isRegistering,
}: DashboardViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">
          Go <span className="text-gradient">Bulking</span> 💪
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground transition-all animate-fade-in">Ayo capai target hari ini!</p>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
            Hari Ke-{daysElapsed}
          </span>
        </div>
      </div>

      {/* Push Notification Card - Only visible in Median App */}
      {((window as any).median) && (
        <div className={`glass-card rounded-2xl p-4 flex items-center justify-between border ${isPushSubscribed ? 'border-primary/20 bg-primary/5' : 'border-dashed border-muted-foreground/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isPushSubscribed ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
              {isPushSubscribed ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold">{isPushSubscribed ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}</p>
              <p className="text-[10px] text-muted-foreground">Dapatkan pengingat makan & timbang badan</p>
            </div>
          </div>
          <button
            onClick={registerPush}
            disabled={isPushSubscribed || isRegistering}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isPushSubscribed ? 'bg-secondary text-muted-foreground cursor-default' : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'} ${(isRegistering && !isPushSubscribed) ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isPushSubscribed ? 'Aktif' : (isRegistering ? 'Proses...' : 'Izinkan')}
          </button>
        </div>
      )}

      {/* Calorie Ring */}
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-4 glow-primary">
        <CalorieRing current={totalCalories} target={goals.dailyCalories} />
        <div className="flex w-full justify-around">
          <MacroBar label="Protein" value={totalProtein} color="hsl(82, 85%, 55%)" />
          <MacroBar label="Karbo" value={totalCarbs} color="hsl(210, 80%, 55%)" />
          <MacroBar label="Lemak" value={totalFat} color="hsl(38, 92%, 50%)" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Kalori Sisa</span>
          </div>
          <p className="text-2xl font-bold">{Math.max(0, goals.dailyCalories - totalCalories)}</p>
          <p className="text-[10px] text-muted-foreground">kcal lagi</p>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Dumbbell className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Berat Badan</span>
          </div>
          <p className="text-2xl font-bold">{currentWeight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          <p className="text-[10px] text-muted-foreground">target {goals.targetWeight} kg</p>
        </div>
      </div>

      {/* Weight Progress */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Target className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Progress Bulking</span>
        </div>
        <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${weightProgress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{weightProgress.toFixed(0)}% menuju target</p>
      </div>

      {/* Meal Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Jadwal Makan</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {meals.filter(m => m.completed).length}/{meals.length} Selesai
          </span>
        </div>

        <div className="space-y-3">
          {meals.map((meal) => (
            <div
              key={meal.id}
              onClick={() => toggleMealCompletion(meal.id)}
              className={`glass-card rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-transparent ${meal.completed ? "opacity-60 grayscale-[0.3]" : "glow-primary border-primary/10"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${meal.completed ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-bold transition-all ${meal.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {meal.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground/80">{meal.time}</span>
                    <span>•</span>
                    <span>{meal.foods.reduce((sum, f) => sum + f.calories, 0)} kcal</span>
                  </div>
                </div>
              </div>

              <button className="transition-transform duration-300 active:scale-90">
                {meal.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/30" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
