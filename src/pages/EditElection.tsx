import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  ArrowLeft, Calendar, Clock, Plus, Trash2, Upload, User, Save, Vote, X, CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  party: string;
  photoFile: File | null;
  photoPreview: string | null;
  existingPhotoUrl: string | null;
}

const EditElection = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState("18:00");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [deletedCandidateIds, setDeletedCandidateIds] = useState<string[]>([]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (id) {
      fetchElectionData();
    }
  }, [id]);

  const fetchElectionData = async () => {
    try {
      // Fetch election
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .single();

      if (electionError) throw electionError;

      if (election.status !== 'draft') {
        toast({
          title: "Cannot Edit",
          description: "Only draft elections can be edited.",
          variant: "destructive",
        });
        navigate('/admin/dashboard');
        return;
      }

      setTitle(election.title);
      setDescription(election.description || "");
      
      const start = new Date(election.start_time);
      setStartDate(start);
      setStartTime(format(start, "HH:mm"));
      
      const end = new Date(election.end_time);
      setEndDate(end);
      setEndTime(format(end, "HH:mm"));

      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', id);

      if (candidatesError) throw candidatesError;

      setCandidates(
        (candidatesData || []).map(c => ({
          id: c.id,
          name: c.name,
          party: c.party || "",
          photoFile: null,
          photoPreview: c.photo_url,
          existingPhotoUrl: c.photo_url,
        }))
      );

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching election:', error);
      toast({
        title: "Error",
        description: "Failed to load election data.",
        variant: "destructive",
      });
      navigate('/admin/dashboard');
    }
  };

  const addCandidate = () => {
    setCandidates([...candidates, { 
      id: `new-${Date.now()}`, 
      name: "", 
      party: "", 
      photoFile: null, 
      photoPreview: null,
      existingPhotoUrl: null,
    }]);
  };

  const removeCandidate = (candidateId: string) => {
    if (candidates.length > 1) {
      // Track deleted existing candidates
      if (!candidateId.startsWith('new-')) {
        setDeletedCandidateIds(prev => [...prev, candidateId]);
      }
      setCandidates(candidates.filter(c => c.id !== candidateId));
    }
  };

  const updateCandidate = (candidateId: string, field: keyof Candidate, value: string | File | null) => {
    setCandidates(candidates.map(c => 
      c.id === candidateId ? { ...c, [field]: value } : c
    ));
  };

  const handlePhotoSelect = (candidateId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setCandidates(candidates.map(c => 
      c.id === candidateId 
        ? { ...c, photoFile: file, photoPreview: previewUrl } 
        : c
    ));
  };

  const removePhoto = (candidateId: string) => {
    setCandidates(candidates.map(c => 
      c.id === candidateId 
        ? { ...c, photoFile: null, photoPreview: null, existingPhotoUrl: null } 
        : c
    ));
  };

  const uploadCandidatePhoto = async (file: File, electionId: string, candidateName: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${electionId}/${Date.now()}-${candidateName.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('candidate-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidate-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter an election title", variant: "destructive" });
      return;
    }

    if (!startDate || !endDate) {
      toast({ title: "Error", description: "Please set start and end dates", variant: "destructive" });
      return;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (endDateTime <= startDateTime) {
      toast({ title: "Error", description: "End date/time must be after start date/time", variant: "destructive" });
      return;
    }

    const validCandidates = candidates.filter(c => c.name.trim());
    if (validCandidates.length < 2) {
      toast({ title: "Error", description: "Please add at least 2 candidates", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update election
      const { error: electionError } = await supabase
        .from('elections')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        })
        .eq('id', id);

      if (electionError) throw electionError;

      // Delete removed candidates
      for (const candidateId of deletedCandidateIds) {
        await supabase.from('candidates').delete().eq('id', candidateId);
      }

      // Update or create candidates
      for (const candidate of validCandidates) {
        let photoUrl: string | null = candidate.existingPhotoUrl;

        if (candidate.photoFile) {
          photoUrl = await uploadCandidatePhoto(candidate.photoFile, id!, candidate.name);
        }

        if (candidate.id.startsWith('new-')) {
          // Create new candidate
          await supabase.from('candidates').insert({
            election_id: id,
            name: candidate.name.trim(),
            party: candidate.party.trim() || null,
            photo_url: photoUrl,
          });
        } else {
          // Update existing candidate
          await supabase.from('candidates').update({
            name: candidate.name.trim(),
            party: candidate.party.trim() || null,
            photo_url: photoUrl,
          }).eq('id', candidate.id);
        }
      }

      toast({
        title: "Election Updated",
        description: "Your changes have been saved.",
      });
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating election:', error);
      toast({
        title: "Error",
        description: "Failed to update election. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Vote className="w-6 h-6 text-teal-light" />
            <span className="font-display font-semibold">Edit Election</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6 max-w-4xl">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Basic Info */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <h2 className="text-xl font-display font-semibold text-foreground mb-6">
              Election Details
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-medium">Election Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Presidential Election 2024"
                  className="h-12"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about this election..."
                  className="min-h-[100px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Start Date & Time</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 h-12 justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-28 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">End Date & Time</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 h-12 justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-28 h-12"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-foreground">
                Candidates
              </h2>
              <Button type="button" variant="outline" onClick={addCandidate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </div>

            <div className="space-y-4">
              {candidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Photo Upload */}
                  <div className="relative flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[candidate.id] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoSelect(candidate.id, file);
                      }}
                    />
                    {candidate.photoPreview ? (
                      <div className="relative w-16 h-16">
                        <img 
                          src={candidate.photoPreview} 
                          alt="Candidate preview" 
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(candidate.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[candidate.id]?.click()}
                        className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors group border-2 border-dashed border-border hover:border-primary"
                      >
                        <div className="text-center">
                          <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary mx-auto" />
                          <span className="text-[10px] text-muted-foreground">Photo</span>
                        </div>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Candidate name"
                          value={candidate.name}
                          onChange={(e) => updateCandidate(candidate.id, "name", e.target.value)}
                          className="pl-10 h-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Party/Affiliation</Label>
                      <Input
                        placeholder="Party name"
                        value={candidate.party}
                        onChange={(e) => updateCandidate(candidate.id, "party", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => removeCandidate(candidate.id)}
                    disabled={candidates.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Add at least 2 candidates. Photos are optional but recommended.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="navy"
              size="lg"
              className="w-full sm:flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </main>
    </div>
  );
};

export default EditElection;
