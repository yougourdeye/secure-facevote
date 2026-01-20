import { useState } from "react";
import { BarChart3, Download, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ResultsTabProps {
  elections: ElectionResult[];
  onExportResults: (electionId: string) => void;
}

const ResultsTab = ({ elections, onExportResults }: ResultsTabProps) => {
  const [selectedElection, setSelectedElection] = useState<string>(elections[0]?.id || "");

  const currentElection = elections.find(e => e.id === selectedElection);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Election Results</h2>
        {currentElection && (
          <Button variant="outline" onClick={() => onExportResults(currentElection.id)}>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        )}
      </div>

      {elections.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border px-6 py-16 text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No results available</h3>
          <p className="text-muted-foreground">Results will appear here once voting begins</p>
        </div>
      ) : (
        <>
          {/* Election Selector */}
          <div className="mb-6">
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-full max-w-md h-12">
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.title} ({election.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentElection && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-display font-semibold text-foreground">{currentElection.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {currentElection.totalVotes} total votes
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded-full bg-muted text-xs">
                    {currentElection.status}
                  </span>
                </div>
              </div>

              {/* Results */}
              <div className="p-6 space-y-4">
                {currentElection.candidates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No votes cast yet</p>
                ) : (
                  currentElection.candidates
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {index === 0 && currentElection.totalVotes > 0 && (
                              <Trophy className="w-5 h-5 text-warning" />
                            )}
                            <div>
                              <span className="font-medium text-foreground">{candidate.name}</span>
                              {candidate.party && (
                                <span className="text-muted-foreground text-sm ml-2">({candidate.party})</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground">{candidate.votes}</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              ({candidate.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0 ? "bg-teal" : "bg-primary/60"
                            }`}
                            style={{ width: `${candidate.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsTab;
