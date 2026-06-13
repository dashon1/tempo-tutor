import React, { useState } from "react";
import { User, Repertoire } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Music, Target, CheckCircle, ArrowRight } from "lucide-react";

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    defaultInstrument: "",
    practiceGoal: 30,
    firstPieceTitle: "",
    firstPieceComposer: "",
    firstPieceDifficulty: "beginner"
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // Save user preferences
    await User.updateMyUserData({
      default_instrument: formData.defaultInstrument,
      daily_practice_goal: formData.practiceGoal,
      show_onboarding: false
    });

    // Create first piece if provided
    if (formData.firstPieceTitle) {
      await Repertoire.create({
        title: formData.firstPieceTitle,
        composer: formData.firstPieceComposer || "Unknown",
        instrument: formData.defaultInstrument,
        difficulty: formData.firstPieceDifficulty,
        status: "learning",
        mastery_level: 0,
        practice_count: 0,
        total_practice_time: 0
      });
    }

    onComplete();
  };

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Welcome to MusicPro!</CardTitle>
            <div className="text-sm text-slate-500">Step {step} of 3</div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 py-4">
              <div className="text-center mb-6">
                <Music className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Let's get started!</h3>
                <p className="text-slate-600">First, tell us about your musical journey</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="defaultInstrument">What's your primary instrument? *</Label>
                  <Select 
                    value={formData.defaultInstrument} 
                    onValueChange={(value) => setFormData({...formData, defaultInstrument: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="guitar">Guitar</SelectItem>
                      <SelectItem value="violin">Violin</SelectItem>
                      <SelectItem value="drums">Drums</SelectItem>
                      <SelectItem value="bass">Bass</SelectItem>
                      <SelectItem value="saxophone">Saxophone</SelectItem>
                      <SelectItem value="trumpet">Trumpet</SelectItem>
                      <SelectItem value="flute">Flute</SelectItem>
                      <SelectItem value="cello">Cello</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 py-4">
              <div className="text-center mb-6">
                <Target className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Set your practice goal</h3>
                <p className="text-slate-600">How many minutes would you like to practice daily?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="practiceGoal">Daily Practice Goal (minutes)</Label>
                  <Input
                    id="practiceGoal"
                    type="number"
                    min="5"
                    max="480"
                    value={formData.practiceGoal}
                    onChange={(e) => setFormData({...formData, practiceGoal: parseInt(e.target.value) || 30})}
                    className="text-lg"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Recommended: 20-60 minutes per day for steady progress
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 py-4">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Add your first piece (optional)</h3>
                <p className="text-slate-600">What are you working on right now?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstPieceTitle">Piece Title</Label>
                  <Input
                    id="firstPieceTitle"
                    placeholder="e.g., Für Elise, Wonderwall, Canon in D"
                    value={formData.firstPieceTitle}
                    onChange={(e) => setFormData({...formData, firstPieceTitle: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="firstPieceComposer">Composer/Artist</Label>
                  <Input
                    id="firstPieceComposer"
                    placeholder="e.g., Beethoven, Oasis, Pachelbel"
                    value={formData.firstPieceComposer}
                    onChange={(e) => setFormData({...formData, firstPieceComposer: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="firstPieceDifficulty">Difficulty Level</Label>
                  <Select 
                    value={formData.firstPieceDifficulty} 
                    onValueChange={(value) => setFormData({...formData, firstPieceDifficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-sm text-slate-500 italic">
                  You can skip this and add pieces later
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && !formData.defaultInstrument}
                className="bg-gradient-to-r from-purple-500 to-blue-600"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Get Started!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}