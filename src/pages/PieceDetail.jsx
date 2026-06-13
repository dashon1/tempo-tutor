import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Edit, 
  PlayCircle, 
  ExternalLink,
  TrendingUp,
  Clock,
  Target,
  Music,
  Calendar
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

export default function PieceDetail() {
  const { pieceId } = useParams();
  const navigate = useNavigate();
  const [piece, setPiece] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [pieceId]);

  const loadData = async () => {
    setIsLoading(true);
    const repertoireList = await base44.entities.Repertoire.list();
    const pieceData = repertoireList.find(p => p.id === pieceId);
    
    const allSessions = await base44.entities.PracticeSession.list("-session_date", 100);
    
    setPiece(pieceData);
    
    if (pieceData) {
      const pieceSessions = allSessions.filter(s => s.piece_name === pieceData.title);
      setSessions(pieceSessions);
    }
    setIsLoading(false);
  };

  const getProgressData = () => {
    return sessions.slice(0, 10).reverse().map((session, index) => ({
      session: `#${index + 1}`,
      accuracy: session.accuracy_score || 0,
      timing: session.timing_score || 0,
      technique: session.technique_score || 0,
      date: format(parseISO(session.session_date), 'MMM d')
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "learning": return "bg-blue-100 text-blue-800";
      case "practicing": return "bg-yellow-100 text-yellow-800";
      case "polishing": return "bg-orange-100 text-orange-800";
      case "performance_ready": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || !piece) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  const progressData = getProgressData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Repertoire"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900">{piece.title}</h1>
            <p className="text-slate-600 mt-1">{piece.composer}</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl(`Practice?pieceId=${piece.id}`)}>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-600">
                <PlayCircle className="w-5 h-5 mr-2" />
                Practice Now
              </Button>
            </Link>
            <Link to={createPageUrl("Repertoire")}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-slate-600">Mastery</span>
              </div>
              <p className="text-3xl font-bold">{piece.mastery_level || 0}%</p>
              <Progress value={piece.mastery_level || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Practice Time</span>
              </div>
              <p className="text-3xl font-bold">{piece.total_practice_time || 0}h</p>
              <p className="text-sm text-slate-500 mt-1">{piece.practice_count || 0} sessions</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-600">Tempo</span>
              </div>
              <p className="text-2xl font-bold">{piece.current_tempo || 0}</p>
              <p className="text-sm text-slate-500 mt-1">Target: {piece.target_tempo || 0} BPM</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-slate-600">Status</span>
              </div>
              <Badge className={`${getStatusColor(piece.status)} mt-2`}>
                {piece.status?.replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle>Piece Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Instrument</p>
                  <p className="text-lg capitalize">{piece.instrument}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Difficulty</p>
                  <p className="text-lg capitalize">{piece.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Genre</p>
                  <p className="text-lg capitalize">{piece.genre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Key</p>
                  <p className="text-lg">{piece.key_signature || 'N/A'}</p>
                </div>
              </div>

              {piece.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-slate-500 mb-2">Notes</p>
                  <p className="text-slate-700">{piece.notes}</p>
                </div>
              )}

              {(piece.sheet_music_url || piece.audio_reference_url) && (
                <div className="pt-4 border-t flex gap-3">
                  {piece.sheet_music_url && (
                    <Button variant="outline" asChild>
                      <a href={piece.sheet_music_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Sheet Music
                      </a>
                    </Button>
                  )}
                  {piece.audio_reference_url && (
                    <Button variant="outline" asChild>
                      <a href={piece.audio_reference_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Audio Reference
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium">{format(parseISO(session.session_date), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-slate-500 mt-1">{session.duration_minutes} min • {session.tempo} BPM</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">Acc: {session.accuracy_score}%</Badge>
                        <Badge variant="outline" className="text-xs">Time: {session.timing_score}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No practice sessions yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {progressData.length > 0 && (
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} name="Accuracy" />
                  <Line type="monotone" dataKey="timing" stroke="#3B82F6" strokeWidth={2} name="Timing" />
                  <Line type="monotone" dataKey="technique" stroke="#8B5CF6" strokeWidth={2} name="Technique" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}