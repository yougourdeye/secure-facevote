import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Loader2,
  Headphones,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface NarrationSection {
  id: string;
  title: string;
  text: string;
  duration: string;
}

const narrationSections: NarrationSection[] = [
  {
    id: "intro",
    title: "Introduction",
    text: `Welcome to SecureVote, a comprehensive secure online voting system using facial recognition technology. This project was developed as a Master's thesis at Kigali Independent University ULK, addressing critical challenges in traditional voting systems including voter impersonation, identity fraud, and accessibility barriers. The system leverages cutting-edge biometric authentication to ensure that only verified voters can participate in elections, while maintaining a seamless and user-friendly experience.`,
    duration: "~45 sec"
  },
  {
    id: "problem",
    title: "Problem Statement",
    text: `Traditional voting systems face significant challenges that undermine electoral integrity. Studies show that 72% of voters experience fatigue from long queues, while manual verification processes are prone to errors and delays. Voter impersonation remains a serious threat, with documented cases affecting election outcomes. Additionally, accessibility barriers exclude many disabled voters from participating. These issues have led to declining public trust in electoral systems, with surveys indicating that confidence in election security has dropped significantly in recent years.`,
    duration: "~50 sec"
  },
  {
    id: "solution",
    title: "Our Solution",
    text: `SecureVote implements a three-tier architecture combining React and TypeScript on the frontend, PostgreSQL with Supabase on the backend, and face-api.js for biometric processing. The system uses 128-dimensional facial descriptors for identity verification, with liveness detection to prevent spoofing attacks. Row Level Security policies protect sensitive voter data, while the responsive design ensures accessibility across all devices. The registration process captures facial biometrics in a two-step wizard, and verification happens in real-time during the voting process.`,
    duration: "~55 sec"
  },
  {
    id: "technology",
    title: "Technology Stack",
    text: `The frontend is built with React 18 and TypeScript, using Tailwind CSS and shadcn/ui for a modern, accessible interface. Framer Motion provides smooth animations throughout the user experience. The backend leverages PostgreSQL through Supabase, with comprehensive Row Level Security policies ensuring data protection. Face recognition is powered by face-api.js, which is built on TensorFlow.js. This enables client-side processing of facial features, extracting 128-dimensional descriptors that uniquely identify each voter. The system computes Euclidean distance between face descriptors to verify identity with high accuracy.`,
    duration: "~60 sec"
  },
  {
    id: "features",
    title: "Key Features",
    text: `SecureVote offers a complete election management platform. Voters can register with their national ID and facial biometrics through an intuitive wizard interface. The face verification process provides real-time feedback, guiding users to position their face correctly. The voting interface displays candidates clearly and confirms vote submission securely. For administrators, the dashboard provides comprehensive election management including creating and scheduling elections, managing candidates, and viewing real-time results with visual analytics. The system supports multiple simultaneous elections and tracks voter participation to prevent double voting.`,
    duration: "~65 sec"
  },
  {
    id: "results",
    title: "Performance Results",
    text: `Extensive testing validated the system's effectiveness. Face recognition achieved 98% accuracy across 500 tests with 100 individuals. The False Acceptance Rate was just 0.3%, meaning the system rarely accepts imposters. The False Rejection Rate of 2% indicates high reliability for legitimate users. Liveness detection successfully prevented 94.3% of spoofing attempts, including printed photos, phone screens, and video replays. Usability testing with 30 participants yielded a System Usability Scale score of 82.5, classified as excellent. User surveys showed 90% found the system easy to use, and 83% trust its security.`,
    duration: "~60 sec"
  },
  {
    id: "conclusion",
    title: "Conclusion",
    text: `SecureVote demonstrates that facial recognition is a viable solution for secure voter authentication. The high accuracy rates exceed industry standards, while liveness detection effectively prevents common spoofing attacks. Strong user acceptance indicates real potential for adoption in electoral systems. Future enhancements could include multi-modal biometrics combining face and fingerprint recognition, blockchain integration for vote transparency, and improved accessibility features. This research contributes to the ongoing effort to modernize electoral systems while maintaining the security and trust that democracy requires.`,
    duration: "~55 sec"
  }
];

const ProjectAudioNarration = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAudio = async (text: string): Promise<string> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error(`TTS request failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  };

  const playSection = async (sectionIndex: number) => {
    const section = narrationSections[sectionIndex];
    setIsLoading(true);
    setCurrentSection(sectionIndex);

    try {
      let audioUrl = audioCache.get(section.id);
      
      if (!audioUrl) {
        audioUrl = await generateAudio(section.text);
        setAudioCache(prev => new Map(prev).set(section.id, audioUrl!));
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audio.muted = isMuted;
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(100);
        // Auto-play next section
        if (sectionIndex < narrationSections.length - 1) {
          setTimeout(() => playSection(sectionIndex + 1), 1000);
        }
      });

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("Failed to generate audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      playSection(currentSection);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSection = () => {
    if (currentSection < narrationSections.length - 1) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setProgress(0);
      playSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setProgress(0);
      playSection(currentSection - 1);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const downloadFullAudio = async () => {
    setIsDownloading(true);
    toast.info("Generating full audio... This may take a few minutes.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts-batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            sections: narrationSections.map(s => ({ title: s.title, text: s.text }))
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "SecureVote_Audio_Explanation.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Audio downloaded successfully!");
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast.error("Failed to generate audio. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Cleanup URLs
      audioCache.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const currentNarration = narrationSections[currentSection];
  const totalDuration = "~7 minutes";

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Headphones className="h-5 w-5 text-teal-400" />
          Audio Project Explanation
          <span className="text-sm font-normal text-slate-400 ml-auto">
            Total: {totalDuration}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Section selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {narrationSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setIsPlaying(false);
                setProgress(0);
                setCurrentSection(index);
              }}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${
                index === currentSection
                  ? "bg-teal-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Current section info */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{currentNarration.title}</h3>
            <span className="text-xs text-slate-400">{currentNarration.duration}</span>
          </div>
          <p className="text-sm text-slate-300 line-clamp-3">
            {currentNarration.text}
          </p>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-2" />

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSection}
            disabled={currentSection === 0 || isLoading}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700 h-14 w-14 rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSection}
            disabled={currentSection === narrationSections.length - 1 || isLoading}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>

        {/* Download button and section counter */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Section {currentSection + 1} of {narrationSections.length}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadFullAudio}
            disabled={isDownloading}
            className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Full MP3
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectAudioNarration;
