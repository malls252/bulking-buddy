import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Plus, Scale, TrendingUp, Target, Edit2 } from "lucide-react";
import type { WeightEntry, UserGoals } from "@/types/bulking";

interface ProgressViewProps {
  weightHistory: WeightEntry[];
  goals: UserGoals;
  addWeightEntry: (entry: WeightEntry) => void;
  weightProgress: number;
  setGoals: (goals: UserGoals) => void;
}

export default function ProgressView({
  weightHistory,
  goals,
  addWeightEntry,
  weightProgress,
  setGoals
}: ProgressViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  // Temp states for editing goals
  const [tempGoals, setTempGoals] = useState({
    targetWeight: goals.targetWeight.toString(),
    dailyCalories: goals.dailyCalories.toString(),
    dailyProtein: goals.dailyProtein.toString(),
  });

  const handleAdd = () => {
    if (!newWeight) return;
    addWeightEntry({
      date: new Date().toISOString().split("T")[0],
      weight: Number(newWeight),
    });
    setNewWeight("");
    setShowAdd(false);
  };

  const handleUpdateGoals = () => {
    const weight = parseFloat(tempGoals.targetWeight);
    const calories = parseInt(tempGoals.dailyCalories);
    const protein = parseInt(tempGoals.dailyProtein);

    if (!isNaN(weight) && !isNaN(calories) && !isNaN(protein)) {
      setGoals({
        ...goals,
        targetWeight: weight,
        dailyCalories: calories,
        dailyProtein: protein,
      });
      setShowEditTarget(false);
    }
  };

  const chartData = weightHistory.map((e) => ({
    date: e.date.slice(5),
    berat: e.weight,
  }));

  const gained = weightHistory.length >= 2
    ? (weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <span className="text-gradient">Progress</span> Bulking
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowEditTarget(!showEditTarget);
              setShowAdd(false);
              setTempGoals({
                targetWeight: goals.targetWeight.toString(),
                dailyCalories: goals.dailyCalories.toString(),
                dailyProtein: goals.dailyProtein.toString(),
              });
            }}
            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Edit2 className="h-3 w-3" /> Edit Target
          </button>
          <button
            onClick={() => {
              setShowAdd(!showAdd);
              setShowEditTarget(false);
            }}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3 w-3" /> Catat Berat
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="glass-card rounded-xl p-4 space-y-3 animate-scale-in">
          <p className="text-sm font-semibold">Catat Berat Badan</p>
          <input
            placeholder="Berat badan (kg)"
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={handleAdd} className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground">
            Simpan
          </button>
        </div>
      )}

      {showEditTarget && (
        <div className="glass-card rounded-xl p-4 space-y-4 animate-scale-in border-primary/20 border">
          <p className="text-sm font-semibold text-primary">Konfigurasi Target Bulking</p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Target Berat (kg)</label>
              <input
                type="number"
                step="0.1"
                value={tempGoals.targetWeight}
                onChange={(e) => setTempGoals(p => ({ ...p, targetWeight: e.target.value }))}
                className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Target Kalori</label>
                <input
                  type="number"
                  value={tempGoals.dailyCalories}
                  onChange={(e) => setTempGoals(p => ({ ...p, dailyCalories: e.target.value }))}
                  className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Target Protein (g)</label>
                <input
                  type="number"
                  value={tempGoals.dailyProtein}
                  onChange={(e) => setTempGoals(p => ({ ...p, dailyProtein: e.target.value }))}
                  className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <button onClick={handleUpdateGoals} className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground mt-2 shadow-lg shadow-primary/20">
            Perbarui Semua Target
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Scale className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Berat Saat Ini</span>
          </div>
          <p className="text-2xl font-bold">
            {weightHistory[weightHistory.length - 1]?.weight || goals.currentWeight}
            <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Naik</span>
          </div>
          <p className="text-2xl font-bold">
            +{gained}
            <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menuju {goals.targetWeight} kg
          </span>
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${weightProgress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{weightProgress.toFixed(0)}%</p>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Grafik Berat Badan</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="hsl(220, 15%, 18%)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 15%, 22%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(0, 0%, 95%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="berat"
                stroke="hsl(82, 85%, 55%)"
                strokeWidth={2.5}
                dot={{ fill: "hsl(82, 85%, 55%)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight History */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Riwayat</h3>
        {[...weightHistory].reverse().map((e, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
            <span className="text-sm text-muted-foreground">{e.date}</span>
            <span className="text-sm font-semibold">{e.weight} kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}
