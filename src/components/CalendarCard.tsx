import { useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import type { Meal, WeightEntry } from "@/types/bulking";
import { cn } from "@/lib/utils";
import { Scale, CheckCircle2 } from "lucide-react";

interface CalendarCardProps {
  meals: Meal[];
  weightHistory: WeightEntry[];
  className?: string;
}

export default function CalendarCard({
  meals,
  weightHistory,
  className,
}: CalendarCardProps) {
  // Parse weight history dates into Date objects
  const weightDates = useMemo(() => {
    return weightHistory.map((entry) => new Date(entry.date));
  }, [weightHistory]);

  // Check if all meals are completed (for today/active tracking)
  const allMealsCompleted = useMemo(() => {
    return meals.length > 0 && meals.every((meal) => meal.completed);
  }, [meals]);

  // Get current month dates for the calendar
  const today = new Date();
  const [displayedMonth, setDisplayedMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));


  return (
    <div className={cn("glass-card rounded-2xl p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Kalender Bulking</h3>
        <span className="text-xs text-muted-foreground">
          {displayedMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
        </span>

      </div>

      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          month={displayedMonth}
          onMonthChange={setDisplayedMonth}
          modifiers={{
            weightLogged: weightDates,
          }}
          modifiersStyles={{
            weightLogged: {
              backgroundColor: "hsl(142, 71%, 45%)",
              color: "white",
              borderRadius: "50%",
              fontWeight: "bold",
            },
          }}
          classNames={{
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          }}
        />
      </div>


      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Timbang Badan</span>
        </div>
        <div className="flex items-center gap-2">
          {allMealsCompleted ? (
            <CheckCircle2 className="w-3 h-3 text-green-500" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          )}
          <span className="text-xs text-muted-foreground">
            {allMealsCompleted ? "Semua meals selesai" : "Meals belum selesai"}
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-primary">{weightHistory.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Hari Timbang
          </p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-500">
            {meals.filter((m) => m.completed).length}/{meals.length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Meals Selesai
          </p>
        </div>
      </div>
    </div>
  );
}
