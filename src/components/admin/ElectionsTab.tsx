import { Vote, Clock, CheckCircle, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Election {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "upcoming" | "completed" | "draft";
  start_time: string;
  end_time: string;
  totalVotes: number;
}

interface ElectionsTabProps {
  elections: Election[];
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

const ElectionsTab = ({ elections, onActivate, onDelete }: ElectionsTabProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: Election["status"]) => {
    const styles = {
      active: "bg-success/10 text-success border-success/20",
      upcoming: "bg-warning/10 text-warning border-warning/20",
      completed: "bg-muted text-muted-foreground border-border",
      draft: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return styles[status];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">All Elections</h2>
        <Button variant="navy" onClick={() => navigate('/admin/elections/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Election
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {elections.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Vote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No elections yet</h3>
            <p className="text-muted-foreground mb-6">Create your first election to get started</p>
            <Button variant="navy" onClick={() => navigate('/admin/elections/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Election
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {elections.map((election) => (
              <div key={election.id} className="px-6 py-5 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      election.status === "active" ? "bg-success/10" :
                      election.status === "upcoming" ? "bg-warning/10" : 
                      election.status === "draft" ? "bg-blue-500/10" : "bg-muted"
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
                      <h3 className="font-medium text-foreground mb-1">{election.title}</h3>
                      {election.description && (
                        <p className="text-sm text-muted-foreground mb-2">{election.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Start: {formatDate(election.start_time)}</span>
                        <span>End: {formatDate(election.end_time)}</span>
                        <span>{election.totalVotes} votes cast</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${getStatusBadge(election.status)}`}>
                      {election.status}
                    </span>
                    {election.status === "draft" && (
                      <Button variant="outline" size="sm" onClick={() => onActivate(election.id)}>
                        Activate
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDelete(election.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionsTab;
