import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Camera, Search, User, Upload, CheckCircle, 
  XCircle, MoreVertical, UserPlus, Vote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Voter {
  id: string;
  name: string;
  nationalId: string;
  registeredAt: string;
  hasVoted: boolean;
  faceRegistered: boolean;
}

const VoterManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingVoter, setIsAddingVoter] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Demo voters data
  const voters: Voter[] = [
    { id: "1", name: "John Smith", nationalId: "ID-12345678", registeredAt: "2024-01-15", hasVoted: true, faceRegistered: true },
    { id: "2", name: "Maria Garcia", nationalId: "ID-23456789", registeredAt: "2024-01-20", hasVoted: false, faceRegistered: true },
    { id: "3", name: "David Chen", nationalId: "ID-34567890", registeredAt: "2024-02-01", hasVoted: false, faceRegistered: true },
    { id: "4", name: "Sarah Johnson", nationalId: "ID-45678901", registeredAt: "2024-02-10", hasVoted: true, faceRegistered: true },
    { id: "5", name: "Michael Brown", nationalId: "ID-56789012", registeredAt: "2024-02-15", hasVoted: false, faceRegistered: false },
  ];

  const filteredVoters = voters.filter(voter =>
    voter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voter.nationalId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingVoter(true);
    
    setTimeout(() => {
      setIsAddingVoter(false);
      setShowDialog(false);
      toast({
        title: "Voter Registered",
        description: "The voter has been successfully registered.",
      });
    }, 2000);
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
            <span className="font-display font-semibold">Voter Management</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search voters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="navy">
                <UserPlus className="w-4 h-4 mr-2" />
                Register Voter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Register New Voter</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddVoter} className="space-y-6 mt-4">
                {/* Face Capture */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-muted rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border-2 border-dashed border-border">
                    <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Capture Face
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Face data is required for verification
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voterName" className="font-medium">Full Name</Label>
                  <Input id="voterName" placeholder="Enter full name" className="h-11" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="font-medium">National/Registration ID</Label>
                  <Input id="nationalId" placeholder="Enter unique ID" className="h-11" required />
                </div>

                <Button type="submit" variant="navy" className="w-full" disabled={isAddingVoter}>
                  {isAddingVoter ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Register Voter
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Voters", value: voters.length },
            { label: "Voted", value: voters.filter(v => v.hasVoted).length },
            { label: "Not Voted", value: voters.filter(v => !v.hasVoted).length },
            { label: "Face Registered", value: voters.filter(v => v.faceRegistered).length },
          ].map((stat, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Voters Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Voter
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    National ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Face
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVoters.map((voter, index) => (
                  <motion.tr
                    key={voter.id}
                    className="hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{voter.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                      {voter.nationalId}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(voter.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {voter.faceRegistered ? (
                        <span className="inline-flex items-center gap-1 text-success text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Registered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-warning text-sm">
                          <XCircle className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        voter.hasVoted 
                          ? "bg-success/10 text-success border border-success/20" 
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {voter.hasVoted ? "Voted" : "Not Voted"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoterManagement;
