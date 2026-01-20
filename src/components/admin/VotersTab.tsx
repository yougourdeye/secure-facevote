import { useState } from "react";
import { Users, Search, Download, CheckCircle, XCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Voter {
  id: string;
  full_name: string;
  national_id: string;
  face_registered: boolean;
  created_at: string;
  hasVoted: boolean;
}

interface VotersTabProps {
  voters: Voter[];
  onExportVoters: () => void;
}

const VotersTab = ({ voters, onExportVoters }: VotersTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVoters = voters.filter(voter => 
    voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.national_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Registered Voters</h2>
        <Button variant="outline" onClick={onExportVoters}>
          <Download className="w-4 h-4 mr-2" />
          Export Voters
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {filteredVoters.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? "No voters found" : "No voters registered"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try a different search term" : "Voters will appear here after registration"}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>Voter</div>
              <div>National ID</div>
              <div>Face Registered</div>
              <div>Voted</div>
              <div>Registered On</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-border">
              {filteredVoters.map((voter) => (
                <div key={voter.id} className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{voter.full_name}</span>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm">{voter.national_id}</div>
                  <div>
                    {voter.face_registered ? (
                      <span className="inline-flex items-center gap-1 text-success text-sm">
                        <CheckCircle className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-destructive text-sm">
                        <XCircle className="w-4 h-4" /> No
                      </span>
                    )}
                  </div>
                  <div>
                    {voter.hasVoted ? (
                      <span className="inline-flex items-center gap-1 text-success text-sm">
                        <CheckCircle className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                        <XCircle className="w-4 h-4" /> No
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDate(voter.created_at)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Showing {filteredVoters.length} of {voters.length} voters
      </div>
    </div>
  );
};

export default VotersTab;
