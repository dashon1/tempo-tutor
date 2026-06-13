import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { subDays } from "date-fns";

export default function PracticeSuggestions({ sessions, repertoire }) {
  const getSuggestions = () => {
    const suggestions = [];
    
    // Check for pieces not practiced recently
    const now = new Date();
    const recentlyPracticedPieces = sessions
      .filter(s => s.piece_name && new Date(s.session_date) >= subDays(now, 7))
      .map(s => s.piece_name);
    
    const neglectedPieces = repertoire
      .filter(p => p.status !== 'performance_ready' && !recentlyPracticedPieces.includes(p.title))
      .slice(0, 2);
    
    if (neglectedPieces.length > 0) {
      suggestions.push({
        type: "neglected",
        title: "Time to revisit these pieces",
        description: `You haven't practiced ${neglectedPieces[0].title} recently`,
        action: "Practice Now",
        piece: neglectedPieces[0],
        icon: Clock,
        color: "text-orange-600"
      });
    }
    
    // Check for pieces close to mastery
    const almostMastered = repertoire
      .filter(p => p.mastery_level >= 70 && p.mastery_level < 95 && p.status !== 'performance_ready')
      .sort((a, b) => b.mastery_level - a.mastery_level)[0];
    
    if (almostMastered) {
      suggestions.push({
        type: "almost_mastered",
        title: "You're almost there!",
        description: `${almostMastered.title} is at ${almostMastered.mastery_level}% mastery`,
        action: "Push to 100%",
        piece: almostMastered,
        icon: Target,
        color: "text-green-600"
      });
    }
    
    // Check for low timing scores
    const recentSessions = sessions.slice(0, 10);
    const avgTiming = recentSessions.reduce((sum, s) => sum + (s.timing_score || 0), 0) / (recentSessions.length || 1);
    
    if (avgTiming < 70 && recentSessions.length > 0) {
      suggestions.push({
        type: "timing",
        title: "Focus on timing",
        description: "Your recent timing scores could use some work",
        action: "Practice with Metronome",
        icon: TrendingUp,
        color: "text-blue-600"
      });
    }
    
    // Default suggestion if nothing else
    if (suggestions.length === 0) {
      suggestions.push({
        type: "default",
        title: "Keep up the great work!",
        description: "Your practice routine is solid. Consider adding a new piece to challenge yourself.",
        action: "Browse Repertoire",
        icon: Lightbulb,
        color: "text-purple-600"
      });
    }
    
    return suggestions.slice(0, 3);
  };

  const suggestions = getSuggestions();

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="flex items-start gap-3">
              <suggestion.icon className={`w-5 h-5 ${suggestion.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">{suggestion.title}</h4>
                <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>
                <Link to={suggestion.piece ? createPageUrl(`Practice?pieceId=${suggestion.piece.id}`) : createPageUrl("Repertoire")}>
                  <Button size="sm" variant="outline" className="w-full">
                    {suggestion.action}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}