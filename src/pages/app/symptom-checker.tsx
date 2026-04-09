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
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { SymptomEntry, SymptomPattern } from '@/services/symptomCheckerService';
import { BodyHeatmap, BodyRegion } from '@/components/ui/BodyHeatmap';
import BodyPartCutout from '@/components/ui/BodyPartCutout';

const mapSymptomToRegion = (symptom: string): BodyRegion[] => {
  const s = symptom.toLowerCase();
  const regions: BodyRegion[] = [];
  
  if (s.includes('head') || s.includes('migraine') || s.includes('fever') || s.includes('dizz') || s.includes('face') || s.includes('eye')) regions.push('head');
  else if (s.includes('neck') || s.includes('throat') || s.includes('swallow')) regions.push('neck');
  else if (s.includes('shoulder')) { regions.push('front-deltoids'); regions.push('back-deltoids'); }
  else if (s.includes('chest') || s.includes('heart') || s.includes('breath') || s.includes('cough')) regions.push('chest');
  else if (s.includes('stomach') || s.includes('abdo') || s.includes('nausea') || s.includes('cramp') || s.includes('digest') || s.includes('belly')) { regions.push('abs'); regions.push('obliques'); }
  else if (s.includes('pelvi') || s.includes('groin') || s.includes('bladder')) regions.push('adductor');
  
  if (s.includes('back')) {
    if (s.includes('upper')) regions.push('upper-back');
    else if (s.includes('lower')) regions.push('lower-back');
    else { regions.push('upper-back'); regions.push('lower-back'); }
  }
  
  if (s.includes('arm') || s.includes('elbow') || s.includes('wrist')) {
    regions.push('biceps'); regions.push('triceps');
  }
  
  if (s.includes('hand') || s.includes('finger')) {
    regions.push('forearm');
  }

  if (s.includes('leg') || s.includes('knee') || s.includes('thigh') || s.includes('calf')) {
    regions.push('quadriceps'); regions.push('hamstring'); regions.push('calves');
  }
  
  if (s.includes('foot') || s.includes('feet') || s.includes('toe') || s.includes('ankle')) {
    regions.push('calves');
  }
  
  return regions;
};

const computeHeatData = (patterns: SymptomPattern[]) => {
  const data: Partial<Record<BodyRegion, number>> = {};
  patterns.forEach(p => {
    const regions = mapSymptomToRegion(p.symptom_name);
    regions.forEach(r => {
      const score = Math.min(10, p.avg_severity * (1 + (p.frequency * 0.1)));
      if (!data[r] || score > data[r]!) {
        data[r] = score;
      }
    });
  });
  return data;
};

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

  const { user } = useSupabaseAuth();
  const userGender = (user?.user_metadata?.gender === 'female' ? 'female' : 'male') as 'male' | 'female';

  const [showAddForm, setShowAddForm] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [editingEntry, setEditingEntry] = useState<SymptomEntry | null>(null);
  const heatData = computeHeatData(patterns);
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
      <div className="flex items-center justify-between animate-fade-in">
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
            id="tour-sc-analyze"
            variant="outline"
            onClick={() => analyzePatterns()}
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
          <Button id="tour-sc-add-btn" onClick={() => setShowAddForm(true)} className="gap-2">
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

      {/* Insights & Heatmap Section */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          
          {/* Heatmap Column */}
          <Card id="tour-sc-heatmap" className="lg:col-span-1 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Body Heatmap</span>
                {selectedRegion && (
                   <Button variant="ghost" size="sm" onClick={() => setSelectedRegion(null)} className="h-6 px-2 text-xs">
                     Clear Selection
                   </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <BodyHeatmap 
                  heatData={heatData} 
                  hoveredRegion={hoveredRegion}
                  selectedRegion={selectedRegion}
                  onRegionHover={setHoveredRegion}
                  onRegionClick={(r) => {
                    setSelectedRegion(r);
                    const regionName = r.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                    const capitalizedRegion = regionName.charAt(0).toUpperCase() + regionName.slice(1);
                    setFormData(prev => ({
                      ...prev,
                      symptom_name: `${capitalizedRegion} Issue`
                    }));
                    setShowAddForm(true);
                  }}
                  gender={userGender}
                />
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-foreground capitalize">
                     {hoveredRegion ? hoveredRegion.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim() : (selectedRegion ? selectedRegion.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim() : 'Tap a region to report')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 px-4 text-balance">
                    Red indicates higher symptom frequency and severity. Tap a region to quickly log a new symptom.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Pattern Insights</h2>
            <div className="grid gap-3">
              {insights.length > 0 ? insights.map((insight, index) => (
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
              )) : (
                <Card className="border-dashed">
                   <CardContent className="p-8 text-center text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>Not enough data for insights yet. Keep tracking!</p>
                   </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

      {/* Patterns Section */}
      {patterns.length > 0 && (
        <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-foreground">Symptom Patterns</h2>
          <div className="grid gap-4">
            {patterns
              .filter(p => {
                if (!selectedRegion) return true;
                const regions = mapSymptomToRegion(p.symptom_name);
                return regions.includes(selectedRegion);
              })
              .map((pattern, index) => (
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
              <Card key={entry.id} className="animate-fade-in" style={{ animationDelay: `${300 + index * 50}ms` }}>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-200">
          <Card className={`w-full ${selectedRegion ? 'max-w-3xl' : 'max-w-xl'} max-h-[90vh] overflow-hidden flex flex-col ${selectedRegion ? 'md:flex-row' : ''} shadow-2xl border-primary/20`}>
            
            {/* Visual Cutout Sidebar */}
            {selectedRegion && (
              <div className="md:w-1/3 bg-primary/5 border-r border-primary/10 p-6 flex flex-col items-center justify-center space-y-4">
                <div className="text-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Focus Area</h3>
                  <p className="text-sm font-semibold capitalize bg-white text-slate-900 px-3 py-1 rounded-full shadow-sm border">
                    {selectedRegion.replace(/-/g, ' ')}
                  </p>
                </div>

                <div className="relative h-64 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-inner border border-primary/10 p-4">
                  <BodyPartCutout
                    region={selectedRegion}
                    gender={userGender}
                  />
                </div>

                <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
                  Selected region is highlighted for clinical context in your health memory.
                </p>
              </div>
            )}

            {/* Form Content */}
            <div className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">
                  {editingEntry ? 'Refine Symptom Entry' : 'New Symptom Log'}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto pr-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Symptom Name</label>
                        <Input
                          value={formData.symptom_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, symptom_name: e.target.value }))}
                          placeholder="Headache, Fatigue..."
                          required
                          className="mt-1.5 h-11"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Severity Intensity: {formData.severity[0]}/10
                        </label>
                        <Slider
                          value={formData.severity}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-4"
                        />
                        <div className="flex justify-between mt-1 text-[10px] font-medium text-muted-foreground">
                          <span>Mild</span>
                          <span>Acute</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Triggers</label>
                        <Input
                          value={formData.triggers}
                          onChange={(e) => setFormData(prev => ({ ...prev, triggers: e.target.value }))}
                          placeholder="Stress, caffeine..."
                          className="mt-1.5 h-11"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</label>
                        <Input
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g. 2 hours"
                          className="mt-1.5 h-11"
                        />
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Description</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the sensation, exact location, or any patterns you notice..."
                          rows={4}
                          className="mt-1.5 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Daily Stress: {formData.stress_level[0]}/10
                        </label>
                        <Slider
                          value={formData.stress_level}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, stress_level: value }))}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-4"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Sleep (Last Night): {formData.sleep_hours[0]}h
                        </label>
                        <Slider
                          value={formData.sleep_hours}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, sleep_hours: value }))}
                          max={12}
                          min={0}
                          step={0.5}
                          className="mt-4"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" className="flex-1 bg-primary h-12 text-base shadow-lg shadow-primary/20">
                      {editingEntry ? 'Save Changes' : 'Log Symptom'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 px-6"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingEntry(null);
                        setSelectedRegion(null);
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
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;