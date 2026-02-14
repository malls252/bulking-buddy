import CalorieRing from "./CalorieRing";
import MacroBar from "./MacroBar";
import { Flame, Dumbbell, Target } from "lucide-react";
import type { UserGoals } from "@/types/bulking";

interface DashboardViewProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goals: UserGoals;
  weightProgress: number;
  daysElapsed: number;
  currentWeight: number;
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
}: DashboardViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">
          Halo, <span className="text-gradient">Bulk King</span> 💪
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground transition-all animate-fade-in">Ayo capai target hari ini!</p>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
            Hari Ke-{daysElapsed}
          </span>
        </div>
      </div>

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
    </div>
  );
}
