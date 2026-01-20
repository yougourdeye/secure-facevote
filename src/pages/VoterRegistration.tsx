import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle, User, Vote, Shield, ArrowRight, Upload, IdCard, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFaceRecognition, descriptorToArray } from "@/hooks/useFaceRecognition";

const VoterRegistration = () => {
  const [step, setStep] = useState<"info" | "face" | "success">("info");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceStatus, setFaceStatus] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isLoaded, isLoading, loadModels, detectFace, getFaceDescriptor } = useFaceRecognition();

  // Load face recognition models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

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
        title: "Camera Access Required",
        description: "Please allow camera access to capture your face for registration.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  }, []);

  // Real-time face detection
  useEffect(() => {
    if (cameraActive && isLoaded && videoRef.current && !capturedImage) {
      detectionIntervalRef.current = setInterval(async () => {
        if (videoRef.current) {
          try {
            const detection = await detectFace(videoRef.current);
            if (detection) {
              setFaceDetected(true);
              setFaceStatus("Face detected - Ready to capture");
            } else {
              setFaceDetected(false);
              setFaceStatus("No face detected - Please center your face");
            }
          } catch (e) {
            setFaceDetected(false);
            setFaceStatus("Position your face in the frame");
          }
        }
      }, 500);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraActive, isLoaded, detectFace, capturedImage]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !isLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    
    // Verify face is still detected
    const descriptor = await getFaceDescriptor(canvas);
    if (!descriptor) {
      toast({
        title: "No Face Detected",
        description: "Please ensure your face is clearly visible and try again.",
        variant: "destructive",
      });
      return;
    }

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setFaceDetected(false);
    setFaceStatus("");
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
  };

  // Start camera only after the face step has rendered (so <video> ref exists)
  useEffect(() => {
    if (step === "face" && !capturedImage && !cameraActive) {
      startCamera();
    }
  }, [step, capturedImage, cameraActive, startCamera]);

  const handleFinalSubmit = async () => {
    if (!capturedImage || !canvasRef.current || !isLoaded) return;
    
    setIsSubmitting(true);
    
    try {
      // Get face descriptor from captured image
      const tempImg = new Image();
      tempImg.src = capturedImage;
      await new Promise((resolve) => { tempImg.onload = resolve; });
      
      // Create a canvas for the image
      const imgCanvas = document.createElement('canvas');
      imgCanvas.width = tempImg.width;
      imgCanvas.height = tempImg.height;
      const imgCtx = imgCanvas.getContext('2d');
      if (!imgCtx) throw new Error("Could not get canvas context");
      imgCtx.drawImage(tempImg, 0, 0);
      
      const descriptor = await getFaceDescriptor(imgCanvas);
      if (!descriptor) {
        throw new Error("Could not extract face features. Please retake the photo.");
      }

      // Convert base64 to blob
      const base64Response = await fetch(capturedImage);
      const blob = await base64Response.blob();
      
      // Generate unique filename
      const fileName = `${nationalId}-${Date.now()}.jpg`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('face-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('face-images')
        .getPublicUrl(fileName);

      // Insert voter record with face descriptor
      const { error: insertError } = await supabase
        .from('voters')
        .insert({
          full_name: fullName,
          national_id: nationalId,
          face_image_url: urlData.publicUrl,
          face_registered: true,
          face_descriptor: descriptorToArray(descriptor),
        });

      if (insertError) throw insertError;

      setStep("success");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "There was an error during registration. Please try again.",
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
          {/* Model loading indicator */}
          {isLoading && (
            <div className="mb-4 p-3 bg-teal/10 rounded-lg flex items-center gap-3 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-teal" />
              <span className="text-teal">Loading face recognition models...</span>
            </div>
          )}

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

                <Button type="submit" variant="teal" size="lg" className="w-full" disabled={!isLoaded}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue to Face Capture
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
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

              {/* Face detection status */}
              {cameraActive && !capturedImage && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 text-sm ${
                  faceDetected ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {faceDetected ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{faceStatus || "Initializing face detection..."}</span>
                </div>
              )}

              {/* Camera View */}
              <div className="relative aspect-[4/3] bg-navy-dark rounded-2xl overflow-hidden mb-6">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
                ) : (
                  <>
                    {/* Always mount <video> so refs exist before starting camera */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-opacity ${cameraActive ? "opacity-100" : "opacity-0"}`}
                    />

                    {!cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                        <Camera className="w-16 h-16 mb-4" />
                        <p className="text-sm">Initializing camera...</p>
                      </div>
                    )}

                    {/* Face guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-40 h-52 border-4 rounded-[40%] border-dashed transition-colors ${
                          faceDetected ? "border-success" : "border-teal/50"
                        }`}
                      />
                    </div>
                  </>
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
                    disabled={!cameraActive || !faceDetected}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {faceDetected ? "Capture Photo" : "Waiting for face..."}
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
