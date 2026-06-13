
import React, { useState, useEffect } from "react";
import { Repertoire } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Music, 
  Clock, 
  Target, // Added Star
  Edit,
  ExternalLink,
  Trash2,
  ArrowUpDown // Added ArrowUpDown
} from "lucide-react";

const emptyPiece = {
    title: "",
    composer: "",
    instrument: "",
    genre: "",
    difficulty: "beginner",
    key_signature: "",
    tempo_marking: "",
    target_tempo: 120,
    current_tempo: 60,
    status: "learning", // Default status for new pieces
    notes: "",
    sheet_music_url: "",
    audio_reference_url: ""
};

export default function RepertoirePage() {
  const [repertoire, setRepertoire] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterInstrument, setFilterInstrument] = useState("all"); // Still managed in state, but UI control removed
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'updated_date', direction: 'desc' }); // Added sortConfig state
  const [showDialog, setShowDialog] = useState(false);
  const [editingPiece, setEditingPiece] = useState(null); // Holds the piece being added or edited

  useEffect(() => {
    loadRepertoire();
  }, []);

  const loadRepertoire = async () => {
    setIsLoading(true);
    const data = await Repertoire.list("-updated_date");
    setRepertoire(data);
    setIsLoading(false);
  };

  const handleFormChange = (field, value) => {
    setEditingPiece(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePiece = async () => {
    if (!editingPiece.title || !editingPiece.instrument) {
      alert("Please fill in at least the title and instrument!");
      return;
    }

    // Ensure numeric values are numbers, not strings from input
    const pieceToSave = { ...editingPiece };
    if (typeof pieceToSave.target_tempo === 'string') {
        pieceToSave.target_tempo = parseInt(pieceToSave.target_tempo, 10) || 120;
    }
    if (typeof pieceToSave.current_tempo === 'string') {
        pieceToSave.current_tempo = parseInt(pieceToSave.current_tempo, 10) || 60;
    }


    if (editingPiece.id) {
      // Update existing piece
      const { id, ...dataToUpdate } = pieceToSave;
      await Repertoire.update(id, dataToUpdate);
    } else {
      // Create new piece
      await Repertoire.create({
        ...pieceToSave,
        mastery_level: 0,
        practice_count: 0,
        total_practice_time: 0,
      });
    }

    setShowDialog(false);
    setEditingPiece(null); // Clear editing state
    loadRepertoire(); // Reload repertoire list
  };
  
  const handleDeletePiece = async (pieceId) => {
    if (window.confirm("Are you sure you want to delete this piece? This action cannot be undone.")) {
      await Repertoire.delete(pieceId);
      setShowDialog(false);
      setEditingPiece(null); // Clear editing state
      loadRepertoire(); // Reload repertoire list
    }
  };
  
  const openAddDialog = () => {
    setEditingPiece(emptyPiece); // Initialize with empty data
    setShowDialog(true);
  };
  
  const openEditDialog = (piece) => {
    setEditingPiece(piece); // Set the piece to be edited
    setShowDialog(true);
  };

  const sortedAndFilteredRepertoire = React.useMemo(() => {
    let filtered = repertoire.filter(piece => {
      const statusMatch = filterStatus === "all" || piece.status === filterStatus;
      const instrumentMatch = filterInstrument === "all" || piece.instrument === filterInstrument; // filterInstrument still applies
      const searchMatch = searchTerm === "" || 
        piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (piece.composer && piece.composer.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return statusMatch && instrumentMatch && searchMatch;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle numerical sorting for mastery_level, current_tempo, target_tempo
        if (sortConfig.key === 'mastery_level' || sortConfig.key === 'current_tempo' || sortConfig.key === 'target_tempo') {
            const valA = parseFloat(a[sortConfig.key] || 0);
            const valB = parseFloat(b[sortConfig.key] || 0);
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }

        // Handle string sorting for title
        if (typeof a[sortConfig.key] === 'string' && typeof b[sortConfig.key] === 'string') {
            const valA = a[sortConfig.key].toLowerCase();
            const valB = b[sortConfig.key].toLowerCase();
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }

        // Default or date sorting (e.g., updated_date)
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [repertoire, filterStatus, filterInstrument, searchTerm, sortConfig]);

  const getStatusColor = (status) => {
    switch (status) {
      case "learning": return "bg-blue-100 text-blue-800";
      case "practicing": return "bg-yellow-100 text-yellow-800";
      case "polishing": return "bg-orange-100 text-orange-800";
      case "performance_ready": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      case "expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              My Repertoire
            </h1>
            <p className="text-slate-600 mt-2">Manage your musical pieces and track progress</p>
          </div>
          
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Add New Piece
          </Button>
        </div>

        {/* Filters and Sorting */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search pieces by title or composer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="practicing">Practicing</SelectItem>
                  <SelectItem value="polishing">Polishing</SelectItem>
                  <SelectItem value="performance_ready">Performance Ready</SelectItem>
                </SelectContent>
              </Select>
              {/* filterInstrument Select removed from UI as per outline */}
              <Select value={`${sortConfig.key}-${sortConfig.direction}`} onValueChange={(value) => {
                  const [key, direction] = value.split('-');
                  setSortConfig({ key, direction });
              }}>
                <SelectTrigger className="w-full">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_date-desc">Last Practiced</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                   <SelectItem value="mastery_level-desc">Mastery (High-Low)</SelectItem>
                   <SelectItem value="mastery_level-asc">Mastery (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Repertoire Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredRepertoire.map((piece) => (
            <Card key={piece.id} className="shadow-lg bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 pr-2 flex-1">
                    {piece.title}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(piece)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(piece.status)}>
                    {piece.status?.replace('_', ' ')}
                  </Badge>
                  <Badge className={getDifficultyColor(piece.difficulty)}>
                    {piece.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <strong>Composer:</strong> {piece.composer || "Unknown"}
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>Instrument:</strong> {piece.instrument}
                    </p>
                    {piece.key_signature && (
                      <p className="text-sm text-slate-600">
                        <strong>Key:</strong> {piece.key_signature}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-purple-600">{piece.mastery_level || 0}%</span>
                    </div>
                    <Progress value={piece.mastery_level || 0} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{piece.total_practice_time || 0}h practiced</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>{piece.practice_count || 0} sessions</span>
                    </div>
                  </div>

                  {(piece.current_tempo && piece.target_tempo) && (
                    <div className="space-y-1 mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Tempo Progress</span>
                        <span>{piece.current_tempo}/{piece.target_tempo} BPM</span>
                      </div>
                      <Progress 
                        value={(piece.current_tempo / piece.target_tempo) * 100} 
                        className="h-1" 
                      />
                    </div>
                  )}
                </div>

                {(piece.sheet_music_url || piece.audio_reference_url) && (
                  <div className="flex gap-2 mt-4">
                    {piece.sheet_music_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={piece.sheet_music_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Sheet Music
                        </a>
                      </Button>
                    )}
                    {piece.audio_reference_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={piece.audio_reference_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Audio
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedAndFilteredRepertoire.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No pieces found</h3>
            <p className="text-slate-500 mb-4">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your filters or search term" 
                : "Start building your repertoire by adding your first piece!"}
            </p>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPiece?.id ? 'Edit Piece' : 'Add New Piece'}</DialogTitle>
            </DialogHeader>
            {editingPiece && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={editingPiece.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Enter piece title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="composer">Composer</Label>
                    <Input
                      id="composer"
                      value={editingPiece.composer}
                      onChange={(e) => handleFormChange('composer', e.target.value)}
                      placeholder="Enter composer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instrument">Instrument *</Label>
                    <Select value={editingPiece.instrument} onValueChange={(value) => handleFormChange('instrument', value)}>
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
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={editingPiece.difficulty} onValueChange={(value) => handleFormChange('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={editingPiece.status} onValueChange={(value) => handleFormChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="practicing">Practicing</SelectItem>
                        <SelectItem value="polishing">Polishing</SelectItem>
                        <SelectItem value="performance_ready">Performance Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={editingPiece.genre} onValueChange={(value) => handleFormChange('genre', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="folk">Folk</SelectItem>
                        <SelectItem value="blues">Blues</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="world">World</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key_signature">Key Signature</Label>
                    <Input
                      id="key_signature"
                      value={editingPiece.key_signature}
                      onChange={(e) => handleFormChange('key_signature', e.target.value)}
                      placeholder="e.g., C Major, A minor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_tempo">Target Tempo (BPM)</Label>
                    <Input
                      id="target_tempo"
                      type="number"
                      min="40"
                      max="200"
                      value={editingPiece.target_tempo}
                      onChange={(e) => handleFormChange('target_tempo', parseInt(e.target.value) || 120)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_tempo">Current Practice Tempo (BPM)</Label>
                    <Input
                      id="current_tempo"
                      type="number"
                      min="40"
                      max="200"
                      value={editingPiece.current_tempo}
                      onChange={(e) => handleFormChange('current_tempo', parseInt(e.target.value) || 60)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sheet_music_url">Sheet Music URL</Label>
                    <Input
                      id="sheet_music_url"
                      value={editingPiece.sheet_music_url}
                      onChange={(e) => handleFormChange('sheet_music_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audio_reference_url">Audio Reference URL</Label>
                    <Input
                      id="audio_reference_url"
                      value={editingPiece.audio_reference_url}
                      onChange={(e) => handleFormChange('audio_reference_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editingPiece.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Add any notes about this piece..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-3 pt-4 border-t">
                  <div>
                    {editingPiece.id && (
                       <Button variant="destructive" onClick={() => handleDeletePiece(editingPiece.id)}>
                         <Trash2 className="w-4 h-4 mr-2" />
                         Delete
                       </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePiece} className="bg-purple-600 hover:bg-purple-700">
                      {editingPiece.id ? 'Save Changes' : 'Add Piece'}
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
