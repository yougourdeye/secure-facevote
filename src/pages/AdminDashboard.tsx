import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, Vote, BarChart3, Calendar, Plus, Settings, LogOut, 
  ChevronRight, TrendingUp, CheckCircle, Clock, UserCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
}

interface Election {
  id: string;
  title: string;
  status: "active" | "upcoming" | "completed";
  totalVotes: number;
  totalVoters: number;
  endDate: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const stats: StatCard[] = [
    { title: "Total Voters", value: "12,543", change: "+12%", icon: Users, trend: "up" },
    { title: "Active Elections", value: "3", change: "2 upcoming", icon: Vote, trend: "neutral" },
    { title: "Votes Cast Today", value: "1,284", change: "+28%", icon: BarChart3, trend: "up" },
    { title: "Verified Users", value: "11,892", change: "95%", icon: UserCheck, trend: "up" },
  ];

  const elections: Election[] = [
    { id: "1", title: "Presidential Election 2024", status: "active", totalVotes: 8432, totalVoters: 12543, endDate: "2024-11-15" },
    { id: "2", title: "City Council Election", status: "upcoming", totalVotes: 0, totalVoters: 5621, endDate: "2024-12-01" },
    { id: "3", title: "School Board Election", status: "completed", totalVotes: 3241, totalVoters: 4500, endDate: "2024-10-20" },
  ];

  const recentActivity = [
    { action: "New voter registered", name: "John Smith", time: "2 min ago" },
    { action: "Vote cast", name: "Anonymous", time: "5 min ago" },
    { action: "Election activated", name: "Presidential 2024", time: "1 hour ago" },
    { action: "Candidate added", name: "Maria Garcia", time: "3 hours ago" },
  ];

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "elections", label: "Elections", icon: Vote },
    { id: "voters", label: "Voters", icon: Users },
    { id: "candidates", label: "Candidates", icon: UserCheck },
    { id: "results", label: "Results", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const getStatusBadge = (status: Election["status"]) => {
    const styles = {
      active: "bg-success/10 text-success border-success/20",
      upcoming: "bg-warning/10 text-warning border-warning/20",
      completed: "bg-muted text-muted-foreground border-border",
    };
    return styles[status];
  };

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
            onClick={() => navigate('/')}
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
              <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-card transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend === "up" ? "bg-success/10 text-success" : 
                    stat.trend === "down" ? "bg-destructive/10 text-destructive" : 
                    "bg-muted text-muted-foreground"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-display font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Elections List */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-display font-semibold text-foreground">Elections</h2>
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {elections.map((election) => (
                    <div key={election.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          election.status === "active" ? "bg-success/10" :
                          election.status === "upcoming" ? "bg-warning/10" : "bg-muted"
                        }`}>
                          {election.status === "active" ? (
                            <Vote className="w-5 h-5 text-success" />
                          ) : election.status === "upcoming" ? (
                            <Clock className="w-5 h-5 text-warning" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{election.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{election.totalVotes.toLocaleString()} votes</span>
                            <span>•</span>
                            <span>{election.totalVoters.toLocaleString()} voters</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${getStatusBadge(election.status)}`}>
                          {election.status}
                        </span>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display font-semibold text-foreground">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.name} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
