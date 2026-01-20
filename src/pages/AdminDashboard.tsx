import { useState, useEffect } from "react";
import { 
  Users, Vote, BarChart3, Settings, LogOut, 
  Plus, TrendingUp, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import OverviewTab from "@/components/admin/OverviewTab";
import ElectionsTab from "@/components/admin/ElectionsTab";
import VotersTab from "@/components/admin/VotersTab";
import ResultsTab from "@/components/admin/ResultsTab";

interface Election {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "upcoming" | "completed" | "draft";
  start_time: string;
  end_time: string;
  totalVotes: number;
  totalVoters: number;
}

interface Voter {
  id: string;
  full_name: string;
  national_id: string;
  face_registered: boolean;
  created_at: string;
  hasVoted: boolean;
}

interface CandidateResult {
  id: string;
  name: string;
  party: string | null;
  votes: number;
  percentage: number;
}

interface ElectionResult {
  id: string;
  title: string;
  status: string;
  totalVotes: number;
  candidates: CandidateResult[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [elections, setElections] = useState<Election[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [electionResults, setElectionResults] = useState<ElectionResult[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ action: string; name: string; time: string }[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchElections(),
        fetchVoters(),
        fetchResults(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    const { data: electionsData, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching elections:", error);
      return;
    }

    // Get vote counts for each election
    const electionsWithCounts = await Promise.all(
      (electionsData || []).map(async (election) => {
        const { count: voteCount } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('election_id', election.id);

        return {
          ...election,
          totalVotes: voteCount || 0,
          totalVoters: voters.length,
        };
      })
    );

    setElections(electionsWithCounts as Election[]);
  };

  const fetchVoters = async () => {
    const { data: votersData, error } = await supabase
      .from('voters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching voters:", error);
      return;
    }

    // Check which voters have voted
    const { data: votes } = await supabase
      .from('votes')
      .select('voter_id');

    const votedIds = new Set(votes?.map(v => v.voter_id) || []);

    const votersWithStatus = (votersData || []).map(voter => ({
      ...voter,
      hasVoted: votedIds.has(voter.id),
    }));

    setVoters(votersWithStatus);

    // Build recent activity
    const activity = votersData?.slice(0, 5).map(voter => ({
      action: "Voter registered",
      name: voter.full_name,
      time: formatTimeAgo(voter.created_at),
    })) || [];

    setRecentActivity(activity);
  };

  const fetchResults = async () => {
    const { data: electionsData, error: elError } = await supabase
      .from('elections')
      .select('*');

    if (elError || !electionsData) return;

    const results: ElectionResult[] = await Promise.all(
      electionsData.map(async (election) => {
        const { data: candidates } = await supabase
          .from('candidates')
          .select('*')
          .eq('election_id', election.id);

        const { data: votes } = await supabase
          .from('votes')
          .select('candidate_id')
          .eq('election_id', election.id);

        const totalVotes = votes?.length || 0;

        const candidateResults: CandidateResult[] = (candidates || []).map(candidate => {
          const candidateVotes = votes?.filter(v => v.candidate_id === candidate.id).length || 0;
          return {
            id: candidate.id,
            name: candidate.name,
            party: candidate.party,
            votes: candidateVotes,
            percentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0,
          };
        });

        return {
          id: election.id,
          title: election.title,
          status: election.status,
          totalVotes,
          candidates: candidateResults,
        };
      })
    );

    setElectionResults(results);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleActivateElection = async (id: string) => {
    const { error } = await supabase
      .from('elections')
      .update({ status: 'active' })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to activate election", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Election activated" });
    fetchElections();
  };

  const handleDeleteElection = async (id: string) => {
    const { error } = await supabase
      .from('elections')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete election", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Election deleted" });
    fetchElections();
  };

  const exportStatisticsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("SecureVote Statistics Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Summary stats
    doc.setFontSize(14);
    doc.text("Summary", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Voters', voters.length.toString()],
        ['Verified Voters', voters.filter(v => v.face_registered).length.toString()],
        ['Total Elections', elections.length.toString()],
        ['Active Elections', elections.filter(e => e.status === 'active').length.toString()],
        ['Total Votes Cast', elections.reduce((sum, e) => sum + e.totalVotes, 0).toString()],
      ],
    });

    // Elections table
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Elections", 14, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Title', 'Status', 'Votes', 'Start Date', 'End Date']],
      body: elections.map(e => [
        e.title,
        e.status,
        e.totalVotes.toString(),
        new Date(e.start_time).toLocaleDateString(),
        new Date(e.end_time).toLocaleDateString(),
      ]),
    });

    doc.save('securevote-statistics.pdf');
    toast({ title: "Exported", description: "Statistics PDF downloaded" });
  };

  const exportVotersPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Registered Voters Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Voters: ${voters.length}`, 14, 36);

    autoTable(doc, {
      startY: 45,
      head: [['Name', 'National ID', 'Face Registered', 'Voted', 'Registered On']],
      body: voters.map(v => [
        v.full_name,
        v.national_id,
        v.face_registered ? 'Yes' : 'No',
        v.hasVoted ? 'Yes' : 'No',
        new Date(v.created_at).toLocaleDateString(),
      ]),
    });

    doc.save('securevote-voters.pdf');
    toast({ title: "Exported", description: "Voters PDF downloaded" });
  };

  const exportResultsPDF = (electionId: string) => {
    const election = electionResults.find(e => e.id === electionId);
    if (!election) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Election Results Report", 14, 22);
    doc.setFontSize(14);
    doc.text(election.title, 14, 32);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
    doc.text(`Total Votes: ${election.totalVotes}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [['Rank', 'Candidate', 'Party', 'Votes', 'Percentage']],
      body: election.candidates
        .sort((a, b) => b.votes - a.votes)
        .map((c, i) => [
          (i + 1).toString(),
          c.name,
          c.party || '-',
          c.votes.toString(),
          `${c.percentage.toFixed(1)}%`,
        ]),
    });

    doc.save(`securevote-results-${election.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    toast({ title: "Exported", description: "Results PDF downloaded" });
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "elections", label: "Elections", icon: Vote },
    { id: "voters", label: "Voters", icon: Users },
    { id: "results", label: "Results", icon: TrendingUp },
  ];

  const stats = [
    { 
      title: "Total Voters", 
      value: voters.length.toLocaleString(), 
      change: `${voters.filter(v => v.face_registered).length} verified`, 
      icon: Users, 
      trend: "up" as const 
    },
    { 
      title: "Active Elections", 
      value: elections.filter(e => e.status === 'active').length.toString(), 
      change: `${elections.filter(e => e.status === 'upcoming').length} upcoming`, 
      icon: Vote, 
      trend: "neutral" as const 
    },
    { 
      title: "Total Votes Cast", 
      value: elections.reduce((sum, e) => sum + e.totalVotes, 0).toLocaleString(), 
      change: "All elections", 
      icon: BarChart3, 
      trend: "up" as const 
    },
    { 
      title: "Verified Users", 
      value: voters.filter(v => v.face_registered).length.toLocaleString(), 
      change: voters.length > 0 ? `${Math.round((voters.filter(v => v.face_registered).length / voters.length) * 100)}%` : "0%", 
      icon: UserCheck, 
      trend: "up" as const 
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            stats={stats}
            elections={elections.map(e => ({
              ...e,
              endDate: e.end_time,
            }))}
            recentActivity={recentActivity}
            onExportPDF={exportStatisticsPDF}
            onViewElection={(id) => {
              setActiveTab("elections");
            }}
          />
        );
      case "elections":
        return (
          <ElectionsTab
            elections={elections}
            onActivate={handleActivateElection}
            onDelete={handleDeleteElection}
          />
        );
      case "voters":
        return (
          <VotersTab
            voters={voters}
            onExportVoters={exportVotersPDF}
          />
        );
      case "results":
        return (
          <ResultsTab
            elections={electionResults}
            onExportResults={exportResultsPDF}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal rounded-full border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-sidebar-primary/20 rounded-xl">
              <Vote className="w-6 h-6 text-sidebar-primary" />
            </div>
            <span className="font-display font-bold text-sidebar-foreground">SecureVote</span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sidebar-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground capitalize">
                {activeTab === "overview" ? "Dashboard" : activeTab}
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, Administrator</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="navy" onClick={() => navigate('/admin/elections/new')}>
                <Plus className="w-4 h-4 mr-2" />
                New Election
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
