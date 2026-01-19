import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Vote, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: string;
  name: string;
  party: string;
  image: string;
}

const VotingBallot = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo candidates - in real app, these would come from the database
  const candidates: Candidate[] = [
    { id: "1", name: "Alexandra Chen", party: "Progressive Alliance", image: "" },
    { id: "2", name: "Marcus Williams", party: "Unity Coalition", image: "" },
    { id: "3", name: "Sarah Johnson", party: "Democratic Future", image: "" },
    { id: "4", name: "David Rodriguez", party: "Citizens First", image: "" },
  ];

  const handleVote = () => {
    if (!selectedCandidate) {
      toast({
        title: "Please select a candidate",
        description: "You must choose a candidate before submitting your vote.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate vote submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsComplete(true);
    }, 2000);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full glass-card rounded-3xl p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Vote Submitted!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your vote has been securely recorded. Thank you for participating in this election.
          </p>
          <div className="bg-muted rounded-xl p-4 mb-8">
            <p className="text-xs text-muted-foreground mb-1">Confirmation Number</p>
            <p className="font-mono text-lg font-bold text-foreground">
              SV-{Date.now().toString(36).toUpperCase()}
            </p>
          </div>
          <Button variant="navy" size="lg" className="w-full" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="w-6 h-6 text-teal-light" />
            <span className="font-display font-semibold">SecureVote</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-primary-foreground/80">Verified Voter Session</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Election Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Presidential Election 2024
            </h1>
            <p className="text-muted-foreground">
              Select one candidate from the list below
            </p>
          </div>

          {/* Candidate List */}
          <div className="grid gap-4 mb-8">
            {candidates.map((candidate) => (
              <motion.button
                key={candidate.id}
                className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-5 ${
                  selectedCandidate === candidate.id
                    ? "border-teal bg-teal/5 shadow-lg"
                    : "border-border bg-card hover:border-teal/50 hover:shadow-md"
                }`}
                onClick={() => setSelectedCandidate(candidate.id)}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  selectedCandidate === candidate.id ? "bg-teal" : "bg-muted"
                }`}>
                  {candidate.image ? (
                    <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <User className={`w-8 h-8 ${selectedCandidate === candidate.id ? "text-white" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-display font-semibold text-foreground">{candidate.name}</h3>
                  <p className="text-muted-foreground">{candidate.party}</p>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedCandidate === candidate.id
                    ? "border-teal bg-teal"
                    : "border-border"
                }`}>
                  {selectedCandidate === candidate.id && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="hero"
              size="lg"
              className="w-full sm:flex-1"
              onClick={handleVote}
              disabled={!selectedCandidate || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Vote...
                </div>
              ) : (
                <>
                  <Vote className="w-5 h-5 mr-2" />
                  Submit My Vote
                </>
              )}
            </Button>
          </div>

          {/* Notice */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Your vote is final and cannot be changed after submission.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default VotingBallot;
