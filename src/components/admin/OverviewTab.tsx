import { motion } from "framer-motion";
import { 
  Users, Vote, BarChart3, UserCheck, ChevronRight, 
  CheckCircle, Clock, AlertCircle, Download 
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  status: "active" | "upcoming" | "completed" | "draft";
  totalVotes: number;
  totalVoters: number;
  endDate: string;
}

interface RecentActivity {
  action: string;
  name: string;
  time: string;
}

interface OverviewTabProps {
  stats: StatCard[];
  elections: Election[];
  recentActivity: RecentActivity[];
  onExportPDF: () => void;
  onViewElection: (id: string) => void;
}

const OverviewTab = ({ stats, elections, recentActivity, onExportPDF, onViewElection }: OverviewTabProps) => {
  const getStatusBadge = (status: Election["status"]) => {
    const styles = {
      active: "bg-success/10 text-success border-success/20",
      upcoming: "bg-warning/10 text-warning border-warning/20",
      completed: "bg-muted text-muted-foreground border-border",
      draft: "bg-muted text-muted-foreground border-border",
    };
    return styles[status];
  };

  return (
    <div>
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

      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <Button variant="outline" onClick={onExportPDF}>
          <Download className="w-4 h-4 mr-2" />
          Export Statistics PDF
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Elections List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground">Elections</h2>
            </div>
            <div className="divide-y divide-border">
              {elections.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No elections yet</p>
                </div>
              ) : (
                elections.slice(0, 5).map((election) => (
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
                      <Button variant="ghost" size="icon" onClick={() => onViewElection(election.id)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.name} • {activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
