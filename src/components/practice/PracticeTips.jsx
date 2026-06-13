import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const tips = [
  "Start slow! Master the piece at a comfortable tempo before speeding up.",
  "Practice difficult sections separately, then combine them with easier parts.",
  "Record yourself playing to identify areas for improvement.",
  "Take breaks every 20-30 minutes to avoid fatigue and maintain focus.",
  "Use the metronome to develop consistent timing and rhythm.",
  "Practice scales in the same key as your piece for better familiarity.",
  "Focus on one aspect at a time: notes, rhythm, dynamics, or expression.",
  "Listen to professional recordings for inspiration and interpretation ideas.",
  "Practice hands separately (for piano) or sections separately to build muscle memory.",
  "Set specific goals for each practice session to stay focused."
];

export default function PracticeTips() {
  const [currentTip, setCurrentTip] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
  }, []);

  if (!isVisible) return null;

  return (
    <Card className="shadow-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 mb-1">Practice Tip</p>
            <p className="text-sm text-amber-800">{currentTip}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-amber-600 hover:text-amber-900"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}