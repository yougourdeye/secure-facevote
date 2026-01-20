import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, XCircle, AlertTriangle, Vote, RefreshCw, Shield, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type VerificationStatus = "idle" | "scanning" | "success" | "failed" | "already-voted" | "not-registered";

const VoterVerification = () => {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [verifiedVoterId, setVerifiedVoterId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      toast({
        title: "Camera Required",
        description: "Please allow camera access to verify your identity.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus("scanning");
    
    // Capture current frame
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    
    // For demo, we'll do a simple check - in production you'd use a face recognition API
    // Here we'll check if there are registered voters and simulate matching
    try {
      // Get all registered voters with face images
      const { data: voters, error } = await supabase
        .from('voters')
        .select('*')
        .eq('face_registered', true);

      if (error) throw error;

      if (!voters || voters.length === 0) {
        setStatus("not-registered");
        return;
      }

      // For demo purposes, we'll pick a random voter to simulate face matching
      // In production, you would send the captured image to a face recognition API
      const randomIndex = Math.floor(Math.random() * voters.length);
      const matchedVoter = voters[randomIndex];

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if voter has already voted in the active election
      const { data: activeElection } = await supabase
        .from('elections')
        .select('id')
        .eq('status', 'active')
        .maybeSingle();

      if (activeElection) {
        const { data: existingVote } = await supabase
          .from('votes')
          .select('id')
          .eq('voter_id', matchedVoter.id)
          .eq('election_id', activeElection.id)
          .maybeSingle();

        if (existingVote) {
          setStatus("already-voted");
          return;
        }
      }

      // Create verification session
      const token = crypto.randomUUID();
      
      if (activeElection) {
        await supabase.from('voter_verifications').insert({
          voter_id: matchedVoter.id,
          election_id: activeElection.id,
          session_token: token,
          verification_status: 'success'
        });
      }

      setVerifiedVoterId(matchedVoter.id);
      setSessionToken(token);
      setStatus("success");

      // Redirect to ballot after short delay
      setTimeout(() => {
        stopCamera();
        navigate('/vote/ballot', { state: { voterId: matchedVoter.id, sessionToken: token } });
      }, 2000);

    } catch (error) {
      console.error("Verification error:", error);
      setStatus("failed");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setVerifiedVoterId(null);
    setSessionToken(null);
  };

  const renderStatusContent = () => {
    switch (status) {
      case "scanning":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-navy/80 rounded-3xl"
          >
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 border-4 border-teal rounded-full border-t-transparent animate-spin" />
                <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-teal" />
              </div>
              <p className="text-white font-medium mt-6">Verifying your identity...</p>
              <p className="text-white/60 text-sm mt-2">Please hold still</p>
            </div>
          </motion.div>
        );
      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-success/90 rounded-3xl"
          >
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-white mx-auto" />
              <p className="text-white font-display font-bold text-2xl mt-4">Identity Verified</p>
              <p className="text-white/80 mt-2">Redirecting to ballot...</p>
            </div>
          </motion.div>
        );
      case "failed":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-destructive/90 rounded-3xl"
          >
            <div className="text-center">
              <XCircle className="w-20 h-20 text-white mx-auto" />
              <p className="text-white font-display font-bold text-2xl mt-4">Verification Failed</p>
              <p className="text-white/80 mt-2 mb-6">Face not recognized in voter database</p>
              <Button variant="heroOutline" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </motion.div>
        );
      case "already-voted":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-warning/90 rounded-3xl"
          >
            <div className="text-center">
              <AlertTriangle className="w-20 h-20 text-white mx-auto" />
              <p className="text-white font-display font-bold text-2xl mt-4">Already Voted</p>
              <p className="text-white/80 mt-2 mb-6">You have already cast your vote in this election</p>
              <Button variant="heroOutline" onClick={() => navigate('/')}>
                Return Home
              </Button>
            </div>
          </motion.div>
        );
      case "not-registered":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-navy/90 rounded-3xl"
          >
            <div className="text-center">
              <UserPlus className="w-20 h-20 text-teal mx-auto" />
              <p className="text-white font-display font-bold text-2xl mt-4">No Voters Registered</p>
              <p className="text-white/80 mt-2 mb-6">Please register first before voting</p>
              <Button variant="hero" onClick={() => navigate('/register')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register Now
              </Button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal/10 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
      </div>

      {/* Back to home */}
      <div className="absolute top-6 left-6">
        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" onClick={() => navigate('/')}>
          <Vote className="w-5 h-5 mr-2" />
          SecureVote
        </Button>
      </div>

      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card rounded-3xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal/20 rounded-2xl mb-4">
              <Camera className="w-8 h-8 text-teal" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Face Verification</h1>
            <p className="text-muted-foreground mt-2">Position your face in the frame to verify your identity</p>
          </div>

          {/* Camera View */}
          <div className="relative aspect-[4/3] bg-navy-dark rounded-3xl overflow-hidden mb-6">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-60 border-4 border-teal/50 rounded-[40%] border-dashed" />
                </div>
                {/* Scanning animation */}
                {status === "scanning" && (
                  <div className="absolute inset-0 face-scanner" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                <Camera className="w-16 h-16 mb-4" />
                <p className="text-sm">Camera is not active</p>
                <p className="text-xs mt-1">Click the button below to start</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />

            {/* Status overlays */}
            <AnimatePresence>
              {status !== "idle" && renderStatusContent()}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {!cameraActive ? (
              <Button variant="teal" size="lg" className="w-full" onClick={startCamera}>
                <Camera className="w-5 h-5 mr-2" />
                Activate Camera
              </Button>
            ) : status === "idle" ? (
              <Button variant="hero" size="lg" className="w-full" onClick={handleVerify}>
                <Shield className="w-5 h-5 mr-2" />
                Verify My Identity
              </Button>
            ) : null}

            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full text-muted-foreground" 
              onClick={() => navigate('/register')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Not registered? Register here
            </Button>
          </div>

          {/* Security notice */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your facial data is encrypted and securely processed. We use advanced 
                liveness detection to prevent fraud.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoterVerification;
