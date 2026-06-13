import React, { useState, useEffect } from "react";
import { PracticeRoutine } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Clock, 
  Edit, 
  Trash2, 
  PlayCircle,
  GripVertical,
  Music
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Routines() {
  const [routines, setRoutines] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setIsLoading(true);
    const data = await PracticeRoutine.list("-updated_date");
    setRoutines(data);
    setIsLoading(false);
  };

  const openAddDialog = () => {
    setEditingRoutine({
      name: "",
      description: "",
      activities: [],
      is_active: true
    });
    setShowDialog(true);
  };

  const openEditDialog = (routine) => {
    setEditingRoutine(routine);
    setShowDialog(true);
  };

  const handleSaveRoutine = async () => {
    if (!editingRoutine.name) {
      alert("Please provide a name for the routine!");
      return;
    }

    const totalDuration = editingRoutine.activities.reduce((sum, act) => sum + (act.duration_minutes || 0), 0);
    const routineData = {
      ...editingRoutine,
      total_duration: totalDuration
    };

    if (editingRoutine.id) {
      const { id, ...dataToUpdate } = routineData;
      await PracticeRoutine.update(id, dataToUpdate);
    } else {
      await PracticeRoutine.create(routineData);
    }

    setShowDialog(false);
    setEditingRoutine(null);
    loadRoutines();
  };

  const handleDeleteRoutine = async (routineId) => {
    if (window.confirm("Are you sure you want to delete this routine?")) {
      await PracticeRoutine.delete(routineId);
      setShowDialog(false);
      setEditingRoutine(null);
      loadRoutines();
    }
  };

  const addActivity = () => {
    setEditingRoutine({
      ...editingRoutine,
      activities: [
        ...(editingRoutine.activities || []),
        { type: "piece", name: "", duration_minutes: 10, notes: "" }
      ]
    });
  };

  const updateActivity = (index, field, value) => {
    const newActivities = [...editingRoutine.activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setEditingRoutine({ ...editingRoutine, activities: newActivities });
  };

  const removeActivity = (index) => {
    const newActivities = editingRoutine.activities.filter((_, i) => i !== index);
    setEditingRoutine({ ...editingRoutine, activities: newActivities });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Practice Routines
            </h1>
            <p className="text-slate-600 mt-2">Create structured practice sessions for consistent improvement</p>
          </div>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-purple-500 to-blue-600">
            <Plus className="w-5 h-5 mr-2" />
            New Routine
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.map((routine) => (
            <Card key={routine.id} className="shadow-lg bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{routine.name}</CardTitle>
                    {routine.description && (
                      <p className="text-sm text-slate-600">{routine.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(routine)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{routine.total_duration || 0} minutes total</span>
                </div>

                <div className="space-y-2">
                  {routine.activities?.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                      <span className="truncate flex-1">{activity.name || activity.type}</span>
                      <Badge variant="outline">{activity.duration_minutes}m</Badge>
                    </div>
                  ))}
                  {routine.activities?.length > 3 && (
                    <p className="text-xs text-slate-500">+{routine.activities.length - 3} more activities</p>
                  )}
                </div>

                <Link to={createPageUrl("Practice")}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Routine
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {routines.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No routines yet</h3>
            <p className="text-slate-500 mb-4">Create your first practice routine to get started!</p>
            <Button onClick={openAddDialog} className="bg-gradient-to-r from-purple-500 to-blue-600">
              <Plus className="w-5 h-5 mr-2" />
              Create Routine
            </Button>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoutine?.id ? 'Edit Routine' : 'Create New Routine'}</DialogTitle>
            </DialogHeader>
            {editingRoutine && (
              <>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="routineName">Routine Name *</Label>
                    <Input
                      id="routineName"
                      placeholder="e.g., Morning Warm-up, Audition Prep"
                      value={editingRoutine.name}
                      onChange={(e) => setEditingRoutine({...editingRoutine, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="routineDescription">Description</Label>
                    <Textarea
                      id="routineDescription"
                      placeholder="Describe this routine..."
                      value={editingRoutine.description}
                      onChange={(e) => setEditingRoutine({...editingRoutine, description: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Activities</Label>
                      <Button onClick={addActivity} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>

                    {editingRoutine.activities?.map((activity, index) => (
                      <Card key={index} className="p-4 bg-slate-50">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <GripVertical className="w-5 h-5 text-slate-400 mt-2" />
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Type</Label>
                                <Select 
                                  value={activity.type} 
                                  onValueChange={(value) => updateActivity(index, 'type', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="piece">Piece</SelectItem>
                                    <SelectItem value="scales">Scales</SelectItem>
                                    <SelectItem value="technique">Technique</SelectItem>
                                    <SelectItem value="sight_reading">Sight Reading</SelectItem>
                                    <SelectItem value="exercise">Exercise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-xs">Duration (min)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={activity.duration_minutes}
                                  onChange={(e) => updateActivity(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                                />
                              </div>

                              <div className="col-span-2">
                                <Label className="text-xs">Name/Description</Label>
                                <Input
                                  placeholder="e.g., C Major scale, Hanon exercises"
                                  value={activity.name}
                                  onChange={(e) => updateActivity(index, 'name', e.target.value)}
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeActivity(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {(!editingRoutine.activities || editingRoutine.activities.length === 0) && (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No activities yet. Click "Add Activity" to get started.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <div>
                    {editingRoutine.id && (
                      <Button variant="destructive" onClick={() => handleDeleteRoutine(editingRoutine.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveRoutine} className="bg-purple-600 hover:bg-purple-700">
                      {editingRoutine.id ? 'Save Changes' : 'Create Routine'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}