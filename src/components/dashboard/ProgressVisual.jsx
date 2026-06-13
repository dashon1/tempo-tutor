import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

export default function ProgressVisual({ weeklyMinutes, weeklyGoal = 210 }) {
  const progressPercentage = Math.min((weeklyMinutes / weeklyGoal) * 100, 100);
  const isGoalMet = weeklyMinutes >= weeklyGoal;

  return (
    <Card className={`shadow-lg border-0 ${isGoalMet ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} text-white`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span className="font-medium text-white/90">Weekly Goal</span>
          </div>
          {isGoalMet && <TrendingUp className="w-5 h-5 text-white/90" />}
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{Math.floor(weeklyMinutes)}</span>
            <span className="text-xl font-medium text-white/80">/ {weeklyGoal} min</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-white/20" 
          />
          <p className="text-sm text-white/90">
            {isGoalMet 
              ? "🎉 Goal achieved! Keep it up!" 
              : `${Math.round(weeklyGoal - weeklyMinutes)} minutes to go`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}