
import React, { useState, useEffect, useRef, useCallback } from "react";
import { PracticeSession, Repertoire } from "@/entities/all";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Square, 
  Zap,
  TrendingUp,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import PracticeTips from "../components/practice/PracticeTips";

export default function Practice() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState("");
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [practiceType, setPracticeType] = useState("");
  const [tempo, setTempo] = useState(120);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [repertoire, setRepertoire] = useState([]);
  const [notes, setNotes] = useState("");
  const [sessionSummary, setSessionSummary] = useState(null);
  
  // Real-time feedback simulation
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [timingScore, setTimingScore] = useState(0);
  const [techniqueScore, setTechniqueScore] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  
  const intervalRef = useRef(null);
  const metronomeRef = useRef(null);
  const feedbackIntervalRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // This function pre-fills form fields. It's wrapped in useCallback
  // to prevent it from being recreated on every render, which is important for the useEffect below.
  const prefillFromPiece = useCallback((piece) => {
    if (piece) {
      setSelectedPiece(piece.title);
      setSelectedInstrument(piece.instrument);
      setTempo(piece.current_tempo || 120);
      setPracticeType("repertoire");
    }
  }, []); // State setters from useState are stable and don't need to be in this dependency array.

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pieceId = params.get('pieceId');
    
    const loadDataAndPrefill = async () => {
      const repertoireData = await Repertoire.list("-updated_date");
      setRepertoire(repertoireData);

      // If a pieceId is found in the URL, find the piece and pre-fill the form.
      if (pieceId) {
        const piece = repertoireData.find(p => p.id === pieceId);
        if (piece) {
          prefillFromPiece(piece);
        }
        // IMPORTANT: Clear the URL parameter *after* using it to prevent it from running again.
        // This navigation is outside the `if (piece)` block because we want to clear the param
        // even if the piece isn't found (e.g., deleted piece, invalid ID)
        navigate(location.pathname, { replace: true });
      }
    };
    
    loadDataAndPrefill();
    
    // This effect now correctly lists its dependencies, resolving the error.
  }, [location.search, location.pathname, navigate, prefillFromPiece]);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused]);

  // Metronome logic
  useEffect(() => {
    if (isMetronomeOn && isActive && !isPaused) {
      const interval = 60000 / tempo; // Convert BPM to milliseconds
      metronomeRef.current = setInterval(() => {
        setCurrentBeat(beat => (beat + 1) % 4);
        // Here you would play a metronome sound
      }, interval);
    } else {
      clearInterval(metronomeRef.current);
    }
    return () => clearInterval(metronomeRef.current);
  }, [isMetronomeOn, isActive, isPaused, tempo]);

  // Simulated real-time feedback
  useEffect(() => {
    if (isActive && !isPaused) {
      feedbackIntervalRef.current = setInterval(() => {
        // Simulate fluctuating scores based on practice duration
        const baseAccuracy = 70 + Math.random() * 25;
        const baseTiming = 65 + Math.random() * 30;
        const baseTechnique = 60 + Math.random() * 35;
        
        setAccuracyScore(Math.min(100, baseAccuracy + (time / 300) * 10));
        setTimingScore(Math.min(100, baseTiming + (time / 400) * 15));
        setTechniqueScore(Math.min(100, baseTechnique + (time / 500) * 12));
      }, 2000);
    } else {
      clearInterval(feedbackIntervalRef.current);
    }
    return () => clearInterval(feedbackIntervalRef.current);
  }, [isActive, isPaused, time]);

  const handlePieceSelect = (title) => {
    setSelectedPiece(title);
    const piece = repertoire.find(p => p.title === title);
    if (piece) {
      prefillFromPiece(piece);
    } else {
      // If piece is not found (e.g., cleared selection or piece removed)
      // Reset relevant states
      setSelectedInstrument("");
      setTempo(120); // Default tempo
      setPracticeType(""); // Clear practice type
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedInstrument || !practiceType) {
      alert("Please select an instrument and practice type first!");
      return;
    }
    setIsActive(true);
    setIsPaused(false);
    // Reset feedback scores at the start of a new session
    setAccuracyScore(0);
    setTimingScore(0);
    setTechniqueScore(0);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    setIsActive(false);
    setIsPaused(false);
    
    if (time > 0) {
      const sessionData = await saveSession();
      setSessionSummary({
        ...sessionData,
        duration: formatTime(time) // duration for display in summary
      });
    }
    
    setTime(0);
    setCurrentBeat(0);
    // Note: accuracy/timing/technique scores are reset by resetPractice, not here directly
    // This allows them to be captured in sessionData before being cleared.
  };

  const saveSession = async () => {
    const sessionData = {
      instrument: selectedInstrument,
      piece_name: selectedPiece || "General Practice",
      duration_minutes: Math.round(time / 60 * 10) / 10,
      tempo,
      accuracy_score: Math.round(accuracyScore),
      timing_score: Math.round(timingScore),
      technique_score: Math.round(techniqueScore),
      practice_type: practiceType,
      session_date: format(new Date(), 'yyyy-MM-dd'),
      notes: notes
    };

    await PracticeSession.create(sessionData);
    
    // Update repertoire practice count if a piece was selected
    if (selectedPiece) {
      const piece = repertoire.find(p => p.title === selectedPiece);
      if (piece) {
        await Repertoire.update(piece.id, {
          practice_count: (piece.practice_count || 0) + 1,
          total_practice_time: (piece.total_practice_time || 0) + Math.round(time / 60),
          current_tempo: tempo
        });
      }
    }
    
    setNotes("");
    return sessionData; // Return the session data for the summary
  };
  
  const resetPractice = () => {
    setSessionSummary(null); // Clear the summary to show the main interface
    setAccuracyScore(0); // Reset scores for next session
    setTimingScore(0);
    setTechniqueScore(0);
    setSelectedPiece("");
    setSelectedInstrument("");
    setPracticeType("");
    setTempo(120);
    setIsMetronomeOn(false);
    setNotes("");
  }

  const handleQuickStart = () => {
    // Set some default values for a quick start
    setSelectedInstrument("piano");
    setPracticeType("scales"); // Or "general", "technique", etc.
    setTempo(120); // Default tempo
    setIsMetronomeOn(false); // Start without metronome by default
    
    // Immediately start the session
    setIsActive(true);
    setIsPaused(false);
    setAccuracyScore(0);
    setTimingScore(0);
    setTechniqueScore(0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (sessionSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full shadow-2xl bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              Session Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">Great job! Here's a summary of your practice:</p>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100 rounded-xl">
              <div>
                <p className="text-sm text-slate-500">Duration</p>
                <p className="text-2xl font-bold">{sessionSummary.duration}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Piece</p>
                <p className="text-lg font-semibold truncate">{sessionSummary.piece_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Avg. Accuracy</p>
                <p className="text-xl font-bold">{sessionSummary.accuracy_score}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Avg. Timing</p>
                <p className="text-xl font-bold">{sessionSummary.timing_score}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Avg. Technique</p>
                <p className="text-xl font-bold">{sessionSummary.technique_score}%</p>
              </div>
            </div>
            {sessionSummary.notes && (
              <div className="text-left p-4 border rounded-lg bg-white">
                 <p className="text-sm font-medium text-slate-700">Your Notes:</p>
                 <p className="text-slate-600 italic mt-1">"{sessionSummary.notes}"</p>
              </div>
            )}
            <Button onClick={resetPractice} size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
              Start New Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Practice Session
            </h1>
            <p className="text-slate-600">Perfect your technique with real-time feedback</p>
          </div>
          {!isActive && (
            <Button onClick={handleQuickStart} variant="outline" className="ml-4">
              Quick Start
            </Button>
          )}
        </div>

        {/* Practice Tip */}
        <PracticeTips />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Session Setup */}
          <Card className="lg:col-span-1 shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Session Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Instrument</label>
                <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrument" />
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

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Practice Type</label>
                <Select value={practiceType} onValueChange={setPracticeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select practice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scales">Scales</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="repertoire">Repertoire</SelectItem>
                    <SelectItem value="sight_reading">Sight Reading</SelectItem>
                    <SelectItem value="improvisation">Improvisation</SelectItem>
                    <SelectItem value="ear_training">Ear Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Piece (Optional)</label>
                <Select value={selectedPiece} onValueChange={handlePieceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a piece" />
                  </SelectTrigger>
                  <SelectContent>
                    {repertoire.map(piece => (
                      <SelectItem key={piece.id} value={piece.title}>
                        {piece.title} - {piece.composer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tempo: {tempo} BPM
                </label>
                <Input
                  type="number"
                  min="40"
                  max="200"
                  value={tempo}
                  onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Metronome</span>
                <Button
                  variant={isMetronomeOn ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsMetronomeOn(!isMetronomeOn)}
                  className={isMetronomeOn ? "bg-purple-600" : ""}
                >
                  {isMetronomeOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>

              {isMetronomeOn && (
                <div className="flex space-x-1 justify-center">
                  {[0, 1, 2, 3].map(beat => (
                    <div
                      key={beat}
                      className={`w-3 h-3 rounded-full ${
                        currentBeat === beat ? "bg-purple-600" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice Timer & Controls */}
          <Card className="shadow-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <div className="text-6xl font-bold mb-4">
                  {formatTime(time)}
                </div>
                <Badge variant="secondary" className="text-slate-800 bg-white/90">
                  {isActive ? (isPaused ? "Paused" : "Recording") : "Ready"}
                </Badge>
              </div>

              <div className="flex justify-center space-x-4">
                {!isActive ? (
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Practice
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handlePause}
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={handleStop}
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
                    >
                      <Square className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Feedback */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Live Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Accuracy</span>
                    <span className={`text-sm font-bold ${getScoreColor(accuracyScore)}`}>
                      {Math.round(accuracyScore)}%
                    </span>
                  </div>
                  <Progress value={accuracyScore} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Timing</span>
                    <span className={`text-sm font-bold ${getScoreColor(timingScore)}`}>
                      {Math.round(timingScore)}%
                    </span>
                  </div>
                  <Progress value={timingScore} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Technique</span>
                    <span className={`text-sm font-bold ${getScoreColor(techniqueScore)}`}>
                      {Math.round(techniqueScore)}%
                    </span>
                  </div>
                  <Progress value={techniqueScore} className="h-2" />
                </div>
              </div>

              {isActive && (
                <div className={`p-4 rounded-xl ${getScoreBg((accuracyScore + timingScore + techniqueScore) / 3)}`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Overall: {Math.round((accuracyScore + timingScore + techniqueScore) / 3)}%
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-75">
                    Keep practicing! Scores improve with time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session Notes */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle>Practice Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add notes about your practice session, areas to improve, or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
