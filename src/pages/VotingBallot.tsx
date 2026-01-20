import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Vote, ArrowLeft, User, AlertCircle, LogOut, IdCard, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  end_time: string;
  start_time: string;
}

interface Voter {
  id: string;
  full_name: string;
  national_id: string;
}

type ViewState = 'elections' | 'ballot' | 'complete';

const VotingBallot = () => {
  const [viewState, setViewState] = useState<ViewState>('elections');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set());
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

      // Get all active elections that haven't ended
      const { data: electionsData, error: electionError } = await supabase
        .from('elections')
        .select('id, title, description, end_time, start_time')
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (electionError) throw electionError;

      // Filter out expired elections on the frontend
      const activeElections = (electionsData || []).filter(
        election => new Date(election.end_time) > new Date()
      );

      if (activeElections.length === 0) {
        setError("No active elections at this time.");
        setLoading(false);
        return;
      }

      // Check which elections this voter has already voted in
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('election_id')
        .eq('voter_id', voterId);

      if (votesError) throw votesError;

      const votedSet = new Set((votesData || []).map(v => v.election_id));
      setVotedElections(votedSet);
      setElections(activeElections);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load election data.");
      setLoading(false);
    }
  };

  const handleSelectElection = async (election: Election) => {
    setSelectedElection(election);
    setLoadingCandidates(true);
    setSelectedCandidate(null);

    try {
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', election.id);

      if (candidatesError) throw candidatesError;

      setCandidates(candidatesData || []);
      setViewState('ballot');
    } catch (err) {
      console.error("Error fetching candidates:", err);
      toast({
        title: "Error",
        description: "Failed to load candidates for this election.",
        variant: "destructive",
      });
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleBackToElections = () => {
    setViewState('elections');
    setSelectedElection(null);
    setSelectedCandidate(null);
    setCandidates([]);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleVote = async () => {
    if (!selectedCandidate || !selectedElection || !voterId) {
      toast({
        title: "Please select a candidate",
        description: "You must choose a candidate before submitting your vote.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          election_id: selectedElection.id,
          voter_id: voterId,
          candidate_id: selectedCandidate,
        });

      if (voteError) {
        if (voteError.code === '23505') {
          toast({
            title: "Already Voted",
            description: "You have already cast your vote in this election.",
            variant: "destructive",
          });
          // Refresh the voted elections
          setVotedElections(prev => new Set([...prev, selectedElection.id]));
          handleBackToElections();
          return;
        }
        throw voteError;
      }

      setVotedElections(prev => new Set([...prev, selectedElection.id]));
      setViewState('complete');
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

  const Header = () => (
    <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Vote className="w-6 h-6 text-teal-light" />
          <span className="font-display font-semibold">SecureVote</span>
        </div>
        
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
  );

  const MobileVoterInfo = () => (
    voter && (
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
    )
  );

  // Complete state
  if (viewState === 'complete') {
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
            Your vote for <span className="font-semibold text-foreground">{selectedElection?.title}</span> has been securely recorded.
          </p>
          <div className="flex flex-col gap-3">
            {elections.filter(e => !votedElections.has(e.id) && e.id !== selectedElection?.id).length > 0 && (
              <Button variant="navy" size="lg" className="w-full" onClick={handleBackToElections}>
                Vote in Another Election
              </Button>
            )}
            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal rounded-full border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading elections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <MobileVoterInfo />
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
            <Button variant="navy" size="lg" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Elections list view
  if (viewState === 'elections') {
    const availableElections = elections.filter(e => !votedElections.has(e.id));
    const completedElections = elections.filter(e => votedElections.has(e.id));

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <MobileVoterInfo />

            <div className="text-center mb-10">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Available Elections
              </h1>
              <p className="text-muted-foreground">
                Select an election to cast your vote
              </p>
            </div>

            {availableElections.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">You've voted in all available elections!</p>
                <p className="text-muted-foreground">Thank you for participating.</p>
              </div>
            ) : (
              <div className="grid gap-4 mb-8">
                {availableElections.map((election) => (
                  <motion.button
                    key={election.id}
                    className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-teal/50 hover:shadow-md transition-all duration-200 text-left"
                    onClick={() => handleSelectElection(election)}
                    whileTap={{ scale: 0.98 }}
                    disabled={loadingCandidates}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                          {election.title}
                        </h3>
                        {election.description && (
                          <p className="text-muted-foreground text-sm mb-3">
                            {election.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Ends {format(new Date(election.end_time), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(election.end_time), 'h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-teal">
                        <Vote className="w-5 h-5" />
                        <span className="font-medium">Vote</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {completedElections.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-display font-semibold text-muted-foreground mb-4">
                  Already Voted
                </h2>
                <div className="grid gap-3">
                  {completedElections.map((election) => (
                    <div
                      key={election.id}
                      className="p-4 rounded-xl border border-border bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-medium text-foreground">{election.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ends {format(new Date(election.end_time), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Voted</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Ballot view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <MobileVoterInfo />

          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {selectedElection?.title}
            </h1>
            {selectedElection?.description && (
              <p className="text-muted-foreground">{selectedElection.description}</p>
            )}
            <p className="text-muted-foreground mt-2">
              Select one candidate from the list below
            </p>
          </div>

          {loadingCandidates ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-teal rounded-full border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
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
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden ${
                    selectedCandidate === candidate.id ? "bg-teal" : "bg-muted"
                  }`}>
                    {candidate.photo_url ? (
                      <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover" />
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

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleBackToElections}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Elections
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

          <p className="text-center text-xs text-muted-foreground mt-6">
            Your vote is final and cannot be changed after submission.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default VotingBallot;
