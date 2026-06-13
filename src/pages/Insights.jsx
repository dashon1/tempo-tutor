import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Music, 
  Target,
  Calendar,
  Award,
  BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, parseISO } from "date-fns";

export default function Insights() {
  const [sessions, setSessions] = useState([]);
  const [repertoire, setRepertoire] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [sessionData, repertoireData] = await Promise.all([
      base44.entities.PracticeSession.list("-created_date", 200),
      base44.entities.Repertoire.list("-updated_date")
    ]);
    setSessions(sessionData);
    setRepertoire(repertoireData);
    setIsLoading(false);
  };

  const getInsights = () => {
    if (sessions.length === 0) return null;

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const avgSessionLength = Math.round(totalMinutes / sessions.length);

    const instrumentCounts = sessions.reduce((acc, s) => {
      acc[s.instrument] = (acc[s.instrument] || 0) + 1;
      return acc;
    }, {});
    const mostPracticedInstrument = Object.entries(instrumentCounts).sort(([,a], [,b]) => b - a)[0];

    const dayOfWeekCounts = sessions.reduce((acc, s) => {
      const day = format(parseISO(s.session_date), 'EEEE');
      acc[day] = (acc[day] || 0) + (s.duration_minutes || 0);
      return acc;
    }, {});
    const bestDay = Object.entries(dayOfWeekCounts).sort(([,a], [,b]) => b - a)[0];

    const avgAccuracy = Math.round(sessions.reduce((sum, s) => sum + (s.accuracy_score || 0), 0) / sessions.length);
    const avgTiming = Math.round(sessions.reduce((sum, s) => sum + (s.timing_score || 0), 0) / sessions.length);
    const avgTechnique = Math.round(sessions.reduce((sum, s) => sum + (s.technique_score || 0), 0) / sessions.length);

    const pieceLastPracticed = {};
    sessions.forEach(s => {
      if (s.piece_name && (!pieceLastPracticed[s.piece_name] || s.session_date > pieceLastPracticed[s.piece_name])) {
        pieceLastPracticed[s.piece_name] = s.session_date;
      }
    });

    const unpracticedPieces = repertoire.filter(piece => {
      const lastDate = pieceLastPracticed[piece.title];
      if (!lastDate) return true;
      const daysSince = Math.floor((new Date() - parseISO(lastDate)) / (1000 * 60 * 60 * 24));
      return daysSince > 14;
    });

    return {
      totalHours,
      totalMinutes,
      avgSessionLength,
      mostPracticedInstrument,
      bestDay,
      avgAccuracy,
      avgTiming,
      avgTechnique,
      unpracticedPieces
    };
  };

  const getPracticeTypeDistribution = () => {
    const distribution = sessions.reduce((acc, s) => {
      const type = s.practice_type || 'other';
      acc[type] = (acc[type] || 0) + (s.duration_minutes || 0);
      return acc;
    }, {});

    return Object.entries(distribution).map(([type, minutes]) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: minutes
    }));
  };

  const getMonthlyTrend = () => {
    const monthlyData = {};
    sessions.forEach(s => {
      const month = format(parseISO(s.session_date), 'MMM yyyy');
      monthlyData[month] = (monthlyData[month] || 0) + (s.duration_minutes || 0);
    });

    return Object.entries(monthlyData)
      .map(([month, minutes]) => ({ month, hours: Math.round(minutes / 60 * 10) / 10 }))
      .slice(-6);
  };

  const insights = getInsights();
  const practiceTypeData = getPracticeTypeDistribution();
  const monthlyTrend = getMonthlyTrend();
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
      <p>Loading insights...</p>
    </div>;
  }

  if (!insights) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto text-center py-12">
        <Music className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">No Data Yet</h2>
        <p className="text-slate-500">Start practicing to see your insights!</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Practice Insights
          </h1>
          <p className="text-slate-600">Deep dive into your practice patterns and progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-slate-600">Total Practice</span>
              </div>
              <p className="text-3xl font-bold">{insights.totalHours}h</p>
              <p className="text-sm text-slate-500 mt-1">{insights.totalMinutes} minutes total</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Avg Session</span>
              </div>
              <p className="text-3xl font-bold">{insights.avgSessionLength}m</p>
              <p className="text-sm text-slate-500 mt-1">Per practice session</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-600">Top Instrument</span>
              </div>
              <p className="text-2xl font-bold capitalize">{insights.mostPracticedInstrument[0]}</p>
              <p className="text-sm text-slate-500 mt-1">{insights.mostPracticedInstrument[1]} sessions</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-slate-600">Best Day</span>
              </div>
              <p className="text-2xl font-bold">{insights.bestDay[0]}</p>
              <p className="text-sm text-slate-500 mt-1">{Math.round(insights.bestDay[1])} min avg</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Average Performance Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-green-600">{insights.avgAccuracy}%</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-2">Timing</p>
                <p className="text-4xl font-bold text-blue-600">{insights.avgTiming}%</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-2">Technique</p>
                <p className="text-4xl font-bold text-purple-600">{insights.avgTechnique}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle>Monthly Practice Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="hours" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle>Practice Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={practiceTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {practiceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {insights.unpracticedPieces.length > 0 && (
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Pieces Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {insights.unpracticedPieces.slice(0, 6).map(piece => (
                  <Badge key={piece.id} variant="outline" className="px-4 py-2">
                    {piece.title}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4">
                These pieces haven't been practiced in over 2 weeks
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}