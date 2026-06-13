import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Settings as SettingsIcon, 
  Volume2, 
  Bell,
  Music
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    defaultInstrument: "piano",
    practiceGoal: 30,
    reminderEnabled: true,
    reminderTime: "19:00",
    metronomeVolume: 50,
    feedbackSensitivity: 75,
    autoSave: true,
    darkMode: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Here you would save settings to user profile
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600">Customize your practice experience</p>
        </div>

        <div className="grid gap-6">
          {/* Practice Preferences */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Practice Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultInstrument">Default Instrument</Label>
                  <Select 
                    value={settings.defaultInstrument} 
                    onValueChange={(value) => handleSettingChange('defaultInstrument', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default instrument" />
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

                <div className="space-y-2">
                  <Label htmlFor="practiceGoal">Daily Practice Goal (minutes)</Label>
                  <Input
                    id="practiceGoal"
                    type="number"
                    min="1"
                    max="480"
                    value={settings.practiceGoal}
                    onChange={(e) => handleSettingChange('practiceGoal', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Feedback Sensitivity: {settings.feedbackSensitivity}%</Label>
                <Slider
                  value={[settings.feedbackSensitivity]}
                  onValueChange={(value) => handleSettingChange('feedbackSensitivity', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-slate-500">
                  Higher sensitivity provides more detailed feedback but may be more strict
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Metronome Volume: {settings.metronomeVolume}%</Label>
                <Slider
                  value={[settings.metronomeVolume]}
                  onValueChange={(value) => handleSettingChange('metronomeVolume', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Practice Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reminderEnabled">Daily Practice Reminders</Label>
                  <p className="text-sm text-slate-500">Get notified when it's time to practice</p>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={settings.reminderEnabled}
                  onCheckedChange={(checked) => handleSettingChange('reminderEnabled', checked)}
                />
              </div>

              {settings.reminderEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                App Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="autoSave">Auto-save Practice Sessions</Label>
                  <p className="text-sm text-slate-500">Automatically save sessions when you stop practicing</p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-slate-500">Use dark theme for the app interface</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}