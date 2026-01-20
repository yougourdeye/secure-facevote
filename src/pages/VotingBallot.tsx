import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Vote, ArrowLeft, User, AlertCircle, LogOut, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  name: string;
  party: string | null;
  photo_url: string | null;
}

interface Election {
  id: string;
  title: string;
  description: string | null;
}

interface Voter {
  id: string;
  full_name: string;
  national_id: string;
}

const VotingBallot = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const voterId = location.state?.voterId;
  const sessionToken = location.state?.sessionToken;

  useEffect(() => {
    if (!voterId || !sessionToken) {
      toast({
        title: "Verification Required",
        description: "Please verify your identity before voting.",
        variant: "destructive",
      });
      navigate('/vote');
      return;
    }

    fetchData();
  }, [voterId, sessionToken, navigate, toast]);

  const fetchData = async () => {
    try {
      // Fetch voter info
      const { data: voterData, error: voterError } = await supabase
        .from('voters')
        .select('id, full_name, national_id')
        .eq('id', voterId)
        .single();

      if (voterError) throw voterError;
      setVoter(voterData);

      // Get active election
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();

      if (electionError) throw electionError;

      if (!electionData) {
        setError("No active election at this time.");
        setLoading(false);
        return;
      }

      setElection(electionData);

      // Get candidates for this election
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionData.id);

      if (candidatesError) throw candidatesError;

      setCandidates(candidatesData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load election data.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const fetchElectionData = async () => {
    try {
      // Get active election
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();

      if (electionError) throw electionError;

      if (!electionData) {
        setError("No active election at this time.");
        setLoading(false);
        return;
      }

      setElection(electionData);

      // Get candidates for this election
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionData.id);

      if (candidatesError) throw candidatesError;

      setCandidates(candidatesData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching election data:", err);
      setError("Failed to load election data.");
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate || !election || !voterId) {
      toast({
        title: "Please select a candidate",
        description: "You must choose a candidate before submitting your vote.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          election_id: election.id,
          voter_id: voterId,
          candidate_id: selectedCandidate,
        });

      if (voteError) {
        if (voteError.code === '23505') {
          // Unique constraint violation - already voted
          toast({
            title: "Already Voted",
            description: "You have already cast your vote in this election.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        throw voteError;
      }

      setIsComplete(true);
    } catch (err) {
      console.error("Vote submission error:", err);
      toast({
        title: "Vote Failed",
        description: "There was an error submitting your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal rounded-full border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ballot...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full glass-card rounded-3xl p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-14 h-14 text-warning" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            {error}
          </h1>
          <p className="text-muted-foreground mb-8">
            Please check back later or contact an administrator.
          </p>
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
          
          {/* Voter Info */}
          <div className="flex items-center gap-4">
            {voter && (
              <div className="hidden sm:flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-light" />
                  <span className="font-medium">{voter.full_name}</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-teal-light" />
                  <span className="text-sm text-white/80">{voter.national_id}</span>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Voter Info Card (Mobile) */}
          {voter && (
            <div className="sm:hidden mb-6 p-4 bg-teal/10 border border-teal/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{voter.full_name}</p>
                  <p className="text-sm text-muted-foreground">ID: {voter.national_id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Election Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {election?.title}
            </h1>
            {election?.description && (
              <p className="text-muted-foreground">{election.description}</p>
            )}
            <p className="text-muted-foreground mt-2">
              Select one candidate from the list below
            </p>
          </div>

          {/* Candidate List */}
          {candidates.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No candidates available for this election.</p>
            </div>
          ) : (
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
                    {candidate.photo_url ? (
                      <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <User className={`w-8 h-8 ${selectedCandidate === candidate.id ? "text-white" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-foreground">{candidate.name}</h3>
                    {candidate.party && (
                      <p className="text-muted-foreground">{candidate.party}</p>
                    )}
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
          )}

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
              disabled={!selectedCandidate || isSubmitting || candidates.length === 0}
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
