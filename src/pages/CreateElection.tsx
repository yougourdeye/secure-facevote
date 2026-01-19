import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Calendar, Clock, Plus, Trash2, Upload, User, Save, Vote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: string;
  name: string;
  party: string;
}

const CreateElection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: "1", name: "", party: "" }
  ]);

  const addCandidate = () => {
    setCandidates([...candidates, { id: Date.now().toString(), name: "", party: "" }]);
  };

  const removeCandidate = (id: string) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  const updateCandidate = (id: string, field: keyof Candidate, value: string) => {
    setCandidates(candidates.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Election Created",
        description: "Your election has been successfully created.",
      });
      navigate('/admin/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <span className="font-display font-semibold">Create New Election</span>
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about this election..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground font-medium">Start Date & Time</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="datetime-local"
                      className="pl-12 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-foreground font-medium">End Date & Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="datetime-local"
                      className="pl-12 h-12"
                      required
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
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-muted/80 transition-colors group">
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-foreground mx-auto" />
                      <span className="text-[10px] text-muted-foreground">Photo</span>
                    </div>
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
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Election
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </main>
    </div>
  );
};

export default CreateElection;
