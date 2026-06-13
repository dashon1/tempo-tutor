
import React, { useState, useEffect } from "react";
import { PracticeSession, Repertoire, User } from "@/entities/all";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Clock, 
  Target, 
  Music, 
  PlayCircle,
  Activity,
  Zap
} from "lucide-react";
import { format, subDays } from "date-fns";
import PracticeSuggestions from "../components/dashboard/PracticeSuggestions";
import AchievementsList from "../components/dashboard/AchievementsList";
import ProgressVisual from "../components/dashboard/ProgressVisual";
import OnboardingWizard from "../components/onboarding/OnboardingWizard";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [repertoire, setRepertoire] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [sessionData, repertoireData, userData] = await Promise.all([
      PracticeSession.list("-created_date", 50),
      Repertoire.list("-updated_date", 20),
      User.me().catch(() => null)
    ]);
    setSessions(sessionData);
    setRepertoire(repertoireData);
    
    // Check if user should see onboarding
    if (userData && userData.show_onboarding !== false && sessionData.length === 0) {
      setShowOnboarding(true);
    }
    
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadData();
  };

  const calculateStats = () => {
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const avgAccuracy = sessions.length > 0 ? sessions.reduce((sum, session) => sum + (session.accuracy_score || 0), 0) / sessions.length : 0;
    const thisWeekSessions = sessions.filter(session => 
      new Date(session.session_date) >= subDays(new Date(), 7)
    );
    const weeklyMinutes = thisWeekSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    
    return {
      totalMinutes,
      avgAccuracy,
      weeklyMinutes,
      totalSessions: sessions.length,
      activePieces: repertoire.filter(piece => piece.status !== 'performance_ready').length
    };
  };

  const getWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayName = format(date, 'EEE');
      const dayData = sessions.filter(session => 
        format(new Date(session.session_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      const minutes = dayData.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
      
      return { day: dayName, minutes };
    });
    
    return last7Days;
  };

  const getPracticeTypeData = () => {
    const types = sessions.reduce((acc, session) => {
      const type = session.practice_type || 'other';
      acc[type] = (acc[type] || 0) + (session.duration_minutes || 0);
      return acc;
    }, {});

    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    
    return Object.entries(types).map(([type, minutes], index) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: minutes,
      color: colors[index % colors.length]
    }));
  };

  const stats = calculateStats();
  const weeklyData = getWeeklyData();
  const practiceTypeData = getPracticeTypeData();

  return (
    <>
      {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Practice Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Track your musical journey and progress</p>
            </div>
            <Link to={createPageUrl("Practice")}>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Practice
              </Button>
            </Link>
          </div>

          {/* Stats Cards with Visual Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <ProgressVisual weeklyMinutes={stats.weeklyMinutes} weeklyGoal={210} />
            </div>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Average Accuracy</p>
                    <p className="text-3xl font-bold mt-2">{stats.avgAccuracy.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Hours</p>
                    <p className="text-3xl font-bold mt-2">{Math.floor(stats.totalMinutes / 60)}h</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Active Pieces</p>
                    <p className="text-3xl font-bold mt-2">{stats.activePieces}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Music className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart Suggestions and Achievements */}
          <div className="grid lg:grid-cols-2 gap-6">
            <PracticeSuggestions sessions={sessions} repertoire={repertoire} />
            <AchievementsList sessions={sessions} repertoire={repertoire} />
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Weekly Practice Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isLoading && weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Bar 
                        dataKey="minutes" 
                        fill="url(#gradient1)" 
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="w-full h-[300px]" />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Practice Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isLoading && practiceTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={practiceTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {practiceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="w-full h-[300px]" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Repertoire */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-green-600" />
                    Current Repertoire Progress
                  </CardTitle>
                  <Link to={createPageUrl("Repertoire")}>
                      <Button variant="ghost">View All</Button>
                  </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!isLoading ? (
                <div className="space-y-4">
                  {repertoire.slice(0, 5).map((piece) => (
                    <div key={piece.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{piece.title}</h3>
                        <p className="text-sm text-slate-600">{piece.composer} • {piece.difficulty}</p>
                        <Progress 
                          value={piece.mastery_level || 0} 
                          className="mt-2 h-2" 
                        />
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <Badge 
                            variant={piece.status === 'performance_ready' ? 'default' : 'secondary'}
                            className={piece.status === 'performance_ready' ? 'bg-green-600' : ''}
                          >
                            {piece.status?.replace('_', ' ')}
                          </Badge>
                          <p className="text-sm text-slate-600 mt-1">{piece.mastery_level || 0}%</p>
                        </div>
                        <Link to={createPageUrl(`Practice?pieceId=${piece.id}`)}>
                          <Button size="icon" className="bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg">
                            <PlayCircle className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {repertoire.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No repertoire added yet. Start building your collection!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
