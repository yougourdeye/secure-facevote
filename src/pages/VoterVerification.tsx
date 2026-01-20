import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, XCircle, AlertTriangle, Vote, RefreshCw, Shield, UserPlus, Loader2, Scan, IdCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFaceRecognition, arrayToDescriptor } from "@/hooks/useFaceRecognition";

type VerificationStep = "id-input" | "face-verify";
type VerificationStatus = "idle" | "loading-models" | "scanning" | "liveness-check" | "matching" | "success" | "failed" | "already-voted" | "not-registered" | "liveness-failed" | "id-not-found";

interface Voter {
  id: string;
  full_name: string;
  national_id: string;
  face_descriptor: unknown;
  face_registered: boolean;
}

const VoterVerification = () => {
  const [step, setStep] = useState<VerificationStep>("id-input");
  const [nationalId, setNationalId] = useState("");
  const [voter, setVoter] = useState<Voter | null>(null);
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [verifiedVoterId, setVerifiedVoterId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [matchProgress, setMatchProgress] = useState<string>("");
  const [isCheckingId, setIsCheckingId] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isLoaded, isLoading, loadModels, getFaceDescriptor, compareFaces, checkLiveness } = useFaceRecognition();

  // Load face recognition models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Start camera when entering face-verify step
  useEffect(() => {
    if (step === "face-verify" && isLoaded && !cameraActive) {
      startCamera();
    }
  }, [step, isLoaded]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nationalId.trim()) {
      toast({
        title: "ID Required",
        description: "Please enter your National/Registration ID.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingId(true);

    try {
      // Look up voter by national ID
      const { data: foundVoter, error } = await supabase
        .from('voters')
        .select('id, full_name, national_id, face_descriptor, face_registered')
        .eq('national_id', nationalId.trim())
        .maybeSingle();

      if (error) throw error;

      if (!foundVoter) {
        setStatus("id-not-found");
        toast({
          title: "ID Not Found",
          description: "This ID is not registered. Please register first.",
          variant: "destructive",
        });
        setIsCheckingId(false);
        return;
      }

      if (!foundVoter.face_registered || !foundVoter.face_descriptor) {
        toast({
          title: "Registration Incomplete",
          description: "Your face is not registered. Please complete registration first.",
          variant: "destructive",
        });
        setIsCheckingId(false);
        return;
      }

      // Check if already voted
      const { data: activeElection } = await supabase
        .from('elections')
        .select('id')
        .eq('status', 'active')
        .maybeSingle();

      if (activeElection) {
        const { data: existingVote } = await supabase
          .from('votes')
          .select('id')
          .eq('voter_id', foundVoter.id)
          .eq('election_id', activeElection.id)
          .maybeSingle();

        if (existingVote) {
          setStatus("already-voted");
          setIsCheckingId(false);
          return;
        }
      }

      setVoter(foundVoter);
      setStep("face-verify");
    } catch (error) {
      console.error("Error checking ID:", error);
      toast({
        title: "Error",
        description: "Failed to verify ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current || !isLoaded || !voter) return;
    
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
      setMatchProgress(`Comparing with ${voter.full_name}'s registered face...`);

      // Stricter threshold for face matching
      const MATCH_THRESHOLD = 0.45;

      // Compare live face against the specific voter's registered face
      const descriptorArray = Array.isArray(voter.face_descriptor) 
        ? voter.face_descriptor 
        : Object.values(voter.face_descriptor as object);
      
      console.log("Live descriptor (first 5 values):", Array.from(liveDescriptor).slice(0, 5));
      console.log("Stored descriptor (first 5 values):", descriptorArray.slice(0, 5));
      
      const storedDescriptor = arrayToDescriptor(descriptorArray as number[]);
      const result = compareFaces(liveDescriptor, storedDescriptor, MATCH_THRESHOLD);
      
      const similarity = ((1 - result.distance) * 100).toFixed(1);
      console.log(`Comparison result: distance=${result.distance.toFixed(4)}, similarity=${similarity}%, match=${result.match}`);

      if (!result.match) {
        setStatus("failed");
        setMatchProgress(`Face does not match. Similarity: ${similarity}% (need >55%)`);
        return;
      }

      setMatchProgress("Face matched! Verifying eligibility...");

      // Create verification session
      const token = crypto.randomUUID();
      
      const { data: activeElection } = await supabase
        .from('elections')
        .select('id')
        .eq('status', 'active')
        .maybeSingle();

      if (activeElection) {
        await supabase.from('voter_verifications').insert({
          voter_id: voter.id,
          election_id: activeElection.id,
          session_token: token,
          verification_status: 'success'
        });
      }

      setVerifiedVoterId(voter.id);
      setSessionToken(token);
      setStatus("success");

      // Redirect to ballot after short delay
      setTimeout(() => {
        stopCamera();
        navigate('/vote/ballot', { state: { voterId: voter.id, sessionToken: token } });
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

  const handleBackToId = () => {
    stopCamera();
    setStep("id-input");
    setVoter(null);
    setStatus("idle");
    setMatchProgress("");
  };

  const renderStatusContent = () => {
    switch (status) {
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
              <p className="text-white/80 mt-2">Welcome, {voter?.full_name}!</p>
              <p className="text-white/60 text-sm mt-1">Redirecting to ballot...</p>
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
              <p className="text-white/80 mt-2 mb-6">{matchProgress || "Face does not match registered voter"}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="heroOutline" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="ghost" className="text-white/70" onClick={handleBackToId}>
                  Change ID
                </Button>
              </div>
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
      default:
        return null;
    }
  };

  // ID Input Step
  if (step === "id-input") {
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
                <IdCard className="w-8 h-8 text-teal" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">Voter Login</h1>
              <p className="text-muted-foreground mt-2">Enter your ID to proceed to face verification</p>
            </div>

            {/* Already voted status */}
            {status === "already-voted" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Already Voted</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have already cast your vote in the current election.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ID not found status */}
            {status === "id-not-found" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">ID Not Found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This ID is not registered. Please register first before voting.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleIdSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nationalId" className="text-foreground font-medium">National/Registration ID</Label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="nationalId"
                    type="text"
                    placeholder="Enter your registered ID"
                    value={nationalId}
                    onChange={(e) => {
                      setNationalId(e.target.value);
                      if (status === "id-not-found" || status === "already-voted") {
                        setStatus("idle");
                      }
                    }}
                    className="pl-12 h-12 bg-background border-border focus:border-teal"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isCheckingId || !isLoaded}
              >
                {isCheckingId ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : !isLoaded ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue to Face Verification
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full mt-4 text-muted-foreground" 
              onClick={() => navigate('/register')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Not registered? Register here
            </Button>

            {/* Security notice */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-3 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  After entering your ID, you'll verify your identity using face recognition.
                  This ensures only you can cast your vote.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Face Verification Step
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
          {/* Voter info banner */}
          {voter && (
            <div className="mb-6 p-4 bg-teal/10 border border-teal/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center">
                  <IdCard className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{voter.full_name}</p>
                  <p className="text-sm text-muted-foreground">ID: {voter.national_id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal/20 rounded-2xl mb-4">
              <Camera className="w-8 h-8 text-teal" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Face Verification</h1>
            <p className="text-muted-foreground mt-2">Position your face in the frame to verify your identity</p>
          </div>

          {/* Camera View */}
          <div className="relative aspect-[4/3] bg-navy-dark rounded-3xl overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity ${cameraActive ? "opacity-100" : "opacity-0"}`}
            />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                <p className="text-sm">Starting camera...</p>
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

            <canvas ref={canvasRef} className="hidden" />

            {/* Status overlays */}
            <AnimatePresence>
              {status !== "idle" && renderStatusContent()}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {cameraActive && status === "idle" && (
              <Button variant="hero" size="lg" className="w-full" onClick={handleVerify}>
                <Shield className="w-5 h-5 mr-2" />
                Verify My Face
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full text-muted-foreground" 
              onClick={handleBackToId}
            >
              ← Back to ID Entry
            </Button>
          </div>

          {/* Security notice */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your face will be compared against your registered photo.
                We use liveness detection to prevent fraud.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoterVerification;
