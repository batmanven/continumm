import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Activity, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Clock,
  AlertTriangle,
  Brain,
  BarChart3,
  RefreshCw,
  Trash2,
  Edit,
  X
} from 'lucide-react';
import { useSymptomChecker } from '@/hooks/useSymptomChecker';
import { SymptomEntry } from '@/services/symptomCheckerService';

const SymptomChecker = () => {
  const {
    entries,
    patterns,
    insights,
    loading,
    analyzing,
    error,
    addSymptomEntry,
    updateSymptomEntry,
    deleteSymptomEntry,
    analyzePatterns,
    refreshEntries,
    clearError
  } = useSymptomChecker();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SymptomEntry | null>(null);
  const [formData, setFormData] = useState({
    symptom_name: '',
    severity: [5],
    description: '',
    triggers: '',
    duration: '',
    stress_level: [5],
    sleep_hours: [7]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData = {
      symptom_name: formData.symptom_name,
      severity: formData.severity[0],
      description: formData.description || undefined,
      triggers: formData.triggers ? formData.triggers.split(',').map(t => t.trim()) : undefined,
      duration: formData.duration || undefined,
      stress_level: formData.stress_level[0],
      sleep_hours: formData.sleep_hours[0],
      start_time: new Date().toISOString()
    };

    if (editingEntry) {
      await updateSymptomEntry(editingEntry.id!, entryData);
      setEditingEntry(null);
    } else {
      await addSymptomEntry(entryData);
    }

    
    setFormData({
      symptom_name: '',
      severity: [5],
      description: '',
      triggers: '',
      duration: '',
      stress_level: [5],
      sleep_hours: [7]
    });
    setShowAddForm(false);
  };

  const handleEdit = (entry: SymptomEntry) => {
    setEditingEntry(entry);
    setFormData({
      symptom_name: entry.symptom_name,
      severity: [entry.severity],
      description: entry.description || '',
      triggers: entry.triggers?.join(', ') || '',
      duration: entry.duration || '',
      stress_level: [entry.stress_level || 5],
      sleep_hours: [entry.sleep_hours || 7]
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this symptom entry?')) {
      await deleteSymptomEntry(id);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'worsening': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading symptom data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Symptom Pattern Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your symptoms and discover patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={analyzePatterns}
            disabled={analyzing}
            className="gap-2"
          >
            {analyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            Analyze Patterns
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Symptom
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-foreground">Pattern Insights</h2>
          <div className="grid gap-3">
            {insights.map((insight, index) => (
              <Card key={index} className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800">{insight.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.type}
                        </Badge>
                        <span className="text-xs text-blue-600">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Patterns Section */}
      {patterns.length > 0 && (
        <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-foreground">Symptom Patterns</h2>
          <div className="grid gap-4">
            {patterns.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {pattern.symptom_name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(pattern.trend)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {pattern.trend}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-semibold">{pattern.frequency}/month</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Severity</p>
                      <p className="font-semibold">{pattern.avg_severity}/10</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stress Correlation</p>
                      <p className="font-semibold">{Math.round(pattern.correlations.stress_correlation * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sleep Correlation</p>
                      <p className="font-semibold">{Math.round(pattern.correlations.sleep_correlation * 100)}%</p>
                    </div>
                  </div>
                  {pattern.common_triggers.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Common Triggers</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.common_triggers.map((trigger, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
        <h2 className="text-lg font-semibold text-foreground">Recent Entries</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No symptom entries yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your symptoms to discover patterns
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Symptom
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {entries.map((entry, index) => (
              <Card key={entry.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${300 + index * 50}ms` }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{entry.symptom_name}</h3>
                        <Badge className={getSeverityColor(entry.severity)}>
                          Severity: {entry.severity}/10
                        </Badge>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                      )}
                      {entry.triggers && entry.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {entry.triggers.map((trigger, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.created_at!)}
                        </div>
                        {entry.stress_level && (
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            Stress: {entry.stress_level}/10
                          </div>
                        )}
                        {entry.sleep_hours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Sleep: {entry.sleep_hours}h
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingEntry ? 'Edit Symptom Entry' : 'Add Symptom Entry'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Symptom Name</label>
                  <Input
                    value={formData.symptom_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptom_name: e.target.value }))}
                    placeholder="e.g., Headache, Nausea, Fatigue"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Severity: {formData.severity[0]}/10
                  </label>
                  <Slider
                    value={formData.severity}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your symptoms in more detail..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Triggers</label>
                  <Input
                    value={formData.triggers}
                    onChange={(e) => setFormData(prev => ({ ...prev, triggers: e.target.value }))}
                    placeholder="e.g., Stress, Lack of sleep, Certain foods (comma separated)"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 2 hours, All day, Since morning"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Stress Level: {formData.stress_level[0]}/10
                  </label>
                  <Slider
                    value={formData.stress_level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, stress_level: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Sleep Hours: {formData.sleep_hours[0]}
                  </label>
                  <Slider
                    value={formData.sleep_hours}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sleep_hours: value }))}
                    max={12}
                    min={0}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEntry ? 'Update' : 'Add'} Symptom
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingEntry(null);
                      setFormData({
                        symptom_name: '',
                        severity: [5],
                        description: '',
                        triggers: '',
                        duration: '',
                        stress_level: [5],
                        sleep_hours: [7]
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
