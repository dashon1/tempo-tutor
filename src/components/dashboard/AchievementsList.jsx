import React, { useEffect, useState } from "react";
import { Achievement } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Zap, Target, Clock } from "lucide-react";
import { format } from "date-fns";

const iconMap = {
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  Clock
};

export default function AchievementsList({ sessions, repertoire }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadAchievements();
    checkAndAwardAchievements();
  }, [sessions, repertoire]);

  const loadAchievements = async () => {
    const data = await Achievement.list("-earned_date", 5);
    setAchievements(data);
  };

  const checkAndAwardAchievements = async () => {
    const existingAchievements = await Achievement.list();
    const earnedTypes = existingAchievements.map(a => a.achievement_type);

    // Check for "First Session" achievement
    if (sessions.length >= 1 && !earnedTypes.includes("first_session")) {
      await Achievement.create({
        achievement_type: "first_session",
        title: "First Steps",
        description: "Completed your first practice session",
        icon: "Star",
        earned_date: format(new Date(), 'yyyy-MM-dd')
      });
    }

    // Check for "Perfect Week" achievement
    const last7Days = sessions.filter(s => {
      const sessionDate = new Date(s.session_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });
    
    const uniqueDays = new Set(last7Days.map(s => s.session_date));
    if (uniqueDays.size >= 7 && !earnedTypes.includes("perfect_week")) {
      await Achievement.create({
        achievement_type: "perfect_week",
        title: "Perfect Week",
        description: "Practiced every day for a week!",
        icon: "Trophy",
        earned_date: format(new Date(), 'yyyy-MM-dd')
      });
    }

    // Check for "10 Hours" achievement
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    if (totalMinutes >= 600 && !earnedTypes.includes("ten_hours")) {
      await Achievement.create({
        achievement_type: "ten_hours",
        title: "Dedicated Musician",
        description: "Logged 10 hours of practice time",
        icon: "Clock",
        earned_date: format(new Date(), 'yyyy-MM-dd')
      });
    }

    // Check for "Master Piece" achievement
    const masteredPiece = repertoire.find(p => p.mastery_level >= 95);
    if (masteredPiece && !earnedTypes.includes("master_piece")) {
      await Achievement.create({
        achievement_type: "master_piece",
        title: "Master Musician",
        description: `Mastered ${masteredPiece.title}!`,
        icon: "Award",
        earned_date: format(new Date(), 'yyyy-MM-dd')
      });
    }

    // Check for "Tempo Titan" achievement
    const reachedTargetTempo = repertoire.filter(p => 
      p.current_tempo >= p.target_tempo && p.target_tempo > 0
    ).length;
    
    if (reachedTargetTempo >= 3 && !earnedTypes.includes("tempo_titan")) {
      await Achievement.create({
        achievement_type: "tempo_titan",
        title: "Tempo Titan",
        description: "Reached target tempo on 3 pieces",
        icon: "Zap",
        earned_date: format(new Date(), 'yyyy-MM-dd')
      });
    }

    // Reload achievements after checking
    loadAchievements();
  };

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.length > 0 ? (
          achievements.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Award;
            return (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{achievement.title}</h4>
                  <p className="text-sm text-slate-600">{achievement.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(achievement.earned_date), 'MMM d')}
                </Badge>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Start practicing to earn achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}