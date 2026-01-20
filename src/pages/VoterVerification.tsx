import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, XCircle, AlertTriangle, Vote, RefreshCw, Shield, UserPlus, Loader2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFaceRecognition, arrayToDescriptor } from "@/hooks/useFaceRecognition";

type VerificationStatus = "idle" | "loading-models" | "scanning" | "liveness-check" | "matching" | "success" | "failed" | "already-voted" | "not-registered" | "liveness-failed";

const VoterVerification = () => {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [verifiedVoterId, setVerifiedVoterId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [matchProgress, setMatchProgress] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isLoaded, isLoading, loadModels, getFaceDescriptor, compareFaces, checkLiveness } = useFaceRecognition();

  // Load face recognition models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Auto-start camera when models are loaded
  useEffect(() => {
    if (isLoaded && !cameraActive) {
      startCamera();
    }
  }, [isLoaded]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to actually start playing
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
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
    if (!videoRef.current || !canvasRef.current || !isLoaded) return;
    
    setStatus("liveness-check");
    setMatchProgress("Checking liveness...");
    
    try {
      // Perform liveness detection
      const livenessResult = await checkLiveness(videoRef.current, 2500);
      
      if (!livenessResult.isLive) {
        setStatus("liveness-failed");
        setMatchProgress(livenessResult.message);
        return;
      }
      
      setStatus("scanning");
      setMatchProgress("Capturing face...");
      
      // Capture current frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      
      // Get face descriptor from live capture
      const liveDescriptor = await getFaceDescriptor(canvas);
      
      if (!liveDescriptor) {
        setStatus("failed");
        setMatchProgress("No face detected in capture");
        return;
      }
      
      setStatus("matching");
      setMatchProgress("Searching voter database...");
      
      // Get all registered voters with face descriptors
      const { data: voters, error } = await supabase
        .from('voters')
        .select('*')
        .eq('face_registered', true)
        .not('face_descriptor', 'is', null);

      if (error) throw error;

      if (!voters || voters.length === 0) {
        setStatus("not-registered");
        return;
      }

      setMatchProgress(`Comparing against ${voters.length} registered voters...`);

      // Compare live face against all registered voters
      let matchedVoter = null;
      let bestMatch = { distance: Infinity, voter: null as typeof voters[0] | null };
      
      for (let i = 0; i < voters.length; i++) {
        const voter = voters[i];
        setMatchProgress(`Checking voter ${i + 1} of ${voters.length}...`);
        
        if (!voter.face_descriptor) continue;
        
        try {
          const storedDescriptor = arrayToDescriptor(voter.face_descriptor as number[]);
          const result = compareFaces(liveDescriptor, storedDescriptor, 0.6);
          
          if (result.distance < bestMatch.distance) {
            bestMatch = { distance: result.distance, voter };
          }
          
          if (result.match) {
            matchedVoter = voter;
            break;
          }
        } catch (e) {
          console.error("Error comparing face with voter:", voter.id, e);
        }
      }

      if (!matchedVoter) {
        setStatus("failed");
        setMatchProgress(`No match found. Best similarity: ${((1 - bestMatch.distance) * 100).toFixed(1)}%`);
        return;
      }

      setMatchProgress("Match found! Verifying eligibility...");

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
      setMatchProgress("An error occurred during verification");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setVerifiedVoterId(null);
    setSessionToken(null);
    setMatchProgress("");
  };

  const renderStatusContent = () => {
    switch (status) {
      case "loading-models":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-navy/80 rounded-3xl"
          >
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-teal mx-auto animate-spin" />
              <p className="text-white font-medium mt-6">Loading face recognition...</p>
            </div>
          </motion.div>
        );
      case "liveness-check":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-navy/80 rounded-3xl"
          >
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 border-4 border-warning rounded-full border-t-transparent animate-spin" />
                <Scan className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-warning" />
              </div>
              <p className="text-white font-medium mt-6">Liveness Detection</p>
              <p className="text-white/60 text-sm mt-2">Please hold still and look at the camera</p>
            </div>
          </motion.div>
        );
      case "scanning":
      case "matching":
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
              <p className="text-white font-medium mt-6">
                {status === "scanning" ? "Capturing face..." : "Matching face..."}
              </p>
              <p className="text-white/60 text-sm mt-2">{matchProgress}</p>
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
            <div className="text-center px-6">
              <XCircle className="w-20 h-20 text-white mx-auto" />
              <p className="text-white font-display font-bold text-2xl mt-4">Verification Failed</p>
              <p className="text-white/80 mt-2 mb-6">{matchProgress || "Face not recognized in voter database"}</p>
              <Button variant="heroOutline" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </motion.div>
        );
      case "liveness-failed":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-warning/90 rounded-3xl"
          >
            <div className="text-center px-6">
              <AlertTriangle className="w-20 h-20 text-white mx-auto" />
              <p className="text-white font-display font-bold text-2xl mt-4">Liveness Check Failed</p>
              <p className="text-white/80 mt-2 mb-6">{matchProgress}</p>
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
          {/* Model loading indicator */}
          {isLoading && (
            <div className="mb-4 p-3 bg-teal/10 rounded-lg flex items-center gap-3 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-teal" />
              <span className="text-teal">Loading face recognition models...</span>
            </div>
          )}

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
            <>
              {/* Always mount <video> so refs exist when auto-starting camera */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity ${cameraActive ? "opacity-100" : "opacity-0"}`}
              />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                      <p className="text-sm">Loading face recognition...</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-16 h-16 mb-4" />
                      <p className="text-sm">Camera is not active</p>
                      <p className="text-xs mt-1">Click the button below to start</p>
                    </>
                  )}
                </div>
              )}

              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-60 border-4 border-teal/50 rounded-[40%] border-dashed" />
              </div>

              {/* Scanning animation */}
              {(status === "scanning" || status === "matching" || status === "liveness-check") && (
                <div className="absolute inset-0 face-scanner" />
              )}
            </>
            <canvas ref={canvasRef} className="hidden" />

            {/* Status overlays */}
            <AnimatePresence>
              {status !== "idle" && renderStatusContent()}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {!cameraActive && isLoaded ? (
              <Button variant="teal" size="lg" className="w-full" onClick={startCamera}>
                <Camera className="w-5 h-5 mr-2" />
                Activate Camera
              </Button>
            ) : cameraActive && status === "idle" ? (
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
