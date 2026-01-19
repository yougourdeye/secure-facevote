import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, XCircle, AlertTriangle, Vote, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type VerificationStatus = "idle" | "scanning" | "success" | "failed" | "already-voted";

const VoterVerification = () => {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

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
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  }, []);

  const handleVerify = () => {
    setStatus("scanning");
    
    // Simulate face verification process
    setTimeout(() => {
      // Random result for demo - in real app, this would call the face recognition API
      const results: VerificationStatus[] = ["success", "failed", "already-voted"];
      const randomResult = results[Math.floor(Math.random() * 3)];
      setStatus(randomResult);
      
      if (randomResult === "success") {
        setTimeout(() => {
          stopCamera();
          navigate('/vote/ballot');
        }, 2000);
      }
    }, 3000);
  };

  const handleRetry = () => {
    setStatus("idle");
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
