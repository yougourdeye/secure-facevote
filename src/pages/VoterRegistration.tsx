import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle, User, Vote, Shield, ArrowRight, Upload, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VoterRegistration = () => {
  const [step, setStep] = useState<"info" | "face" | "success">("info");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        title: "Camera Access Required",
        description: "Please allow camera access to capture your face for registration.",
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

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if national ID already exists
    const { data: existingVoter } = await supabase
      .from('voters')
      .select('id')
      .eq('national_id', nationalId)
      .maybeSingle();

    if (existingVoter) {
      toast({
        title: "Already Registered",
        description: "This National ID is already registered. You can proceed to vote.",
        variant: "destructive",
      });
      return;
    }

    setStep("face");
    startCamera();
  };

  const handleFinalSubmit = async () => {
    if (!capturedImage) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert base64 to blob
      const base64Response = await fetch(capturedImage);
      const blob = await base64Response.blob();
      
      // Generate unique filename
      const fileName = `${nationalId}-${Date.now()}.jpg`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('face-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('face-images')
        .getPublicUrl(fileName);

      // Insert voter record
      const { error: insertError } = await supabase
        .from('voters')
        .insert({
          full_name: fullName,
          national_id: nationalId,
          face_image_url: urlData.publicUrl,
          face_registered: true,
        });

      if (insertError) throw insertError;

      setStep("success");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full glass-card rounded-3xl p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Registration Complete!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your face has been registered successfully. You can now vote in any active election using face verification.
          </p>
          <div className="bg-muted rounded-xl p-4 mb-8 text-left">
            <p className="text-xs text-muted-foreground mb-1">Your Voter ID</p>
            <p className="font-mono text-lg font-bold text-foreground">{nationalId}</p>
          </div>
          <div className="space-y-3">
            <Button variant="hero" size="lg" className="w-full" onClick={() => navigate('/vote')}>
              <Camera className="w-5 h-5 mr-2" />
              Proceed to Vote
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/')}>
              Return Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === "info" ? "text-teal" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "info" ? "bg-teal text-white" : "bg-muted"
              }`}>1</div>
              <span className="text-sm font-medium hidden sm:block">Your Info</span>
            </div>
            <div className="w-8 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step === "face" ? "text-teal" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "face" ? "bg-teal text-white" : "bg-muted"
              }`}>2</div>
              <span className="text-sm font-medium hidden sm:block">Face Capture</span>
            </div>
          </div>

          {step === "info" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal/20 rounded-2xl mb-4">
                  <User className="w-8 h-8 text-teal" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">Voter Registration</h1>
                <p className="text-muted-foreground mt-2">Enter your information to register as a voter</p>
              </div>

              <form onSubmit={handleInfoSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12 h-12 bg-background border-border focus:border-teal"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="text-foreground font-medium">National/Registration ID</Label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="nationalId"
                      type="text"
                      placeholder="Enter your unique ID"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="pl-12 h-12 bg-background border-border focus:border-teal"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="teal" size="lg" className="w-full">
                  Continue to Face Capture
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </motion.div>
          )}

          {step === "face" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal/20 rounded-2xl mb-4">
                  <Camera className="w-8 h-8 text-teal" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">Capture Your Face</h1>
                <p className="text-muted-foreground mt-2">Look directly at the camera for best results</p>
              </div>

              {/* Camera View */}
              <div className="relative aspect-[4/3] bg-navy-dark rounded-2xl overflow-hidden mb-6">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
                ) : cameraActive ? (
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
                      <div className="w-40 h-52 border-4 border-teal/50 rounded-[40%] border-dashed" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                    <Camera className="w-16 h-16 mb-4" />
                    <p className="text-sm">Initializing camera...</p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              {/* Controls */}
              <div className="space-y-4">
                {capturedImage ? (
                  <>
                    <div className="flex gap-3">
                      <Button variant="outline" size="lg" className="flex-1" onClick={retakePhoto}>
                        Retake Photo
                      </Button>
                      <Button 
                        variant="hero" 
                        size="lg" 
                        className="flex-1" 
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Registering...
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mr-2" />
                            Complete Registration
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full" 
                    onClick={capturePhoto}
                    disabled={!cameraActive}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full text-muted-foreground" 
                  onClick={() => {
                    stopCamera();
                    setCapturedImage(null);
                    setStep("info");
                  }}
                >
                  Back to Info
                </Button>
              </div>
            </motion.div>
          )}

          {/* Security notice */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your facial data is encrypted and stored securely. It will only be used 
                for voter verification purposes.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoterRegistration;
