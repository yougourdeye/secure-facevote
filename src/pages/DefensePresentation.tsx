import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Loader2, Presentation, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface Slide {
  title: string;
  subtitle?: string;
  content: string[];
  type: "title" | "content" | "stats" | "conclusion";
}

const slides: Slide[] = [
  {
    title: "Design and Implementation of a Secure Online Voting System",
    subtitle: "Using Facial Recognition Technology",
    content: [
      "Master's Thesis Defense",
      "Kigali Independent University ULK",
      "Faculty of Science and Technology",
      "January 2025"
    ],
    type: "title"
  },
  {
    title: "Presentation Outline",
    content: [
      "1. Introduction & Problem Statement",
      "2. Research Objectives",
      "3. Literature Review",
      "4. Methodology",
      "5. System Implementation",
      "6. Results & Findings",
      "7. Conclusions & Recommendations"
    ],
    type: "content"
  },
  {
    title: "Problem Statement",
    content: [
      "Traditional voting systems face critical challenges:",
      "• Voter impersonation and identity fraud",
      "• Long queues causing voter fatigue (72% affected)",
      "• Accessibility barriers for disabled voters",
      "• Manual verification delays and errors",
      "• Declining public trust in electoral integrity"
    ],
    type: "content"
  },
  {
    title: "Research Objectives",
    content: [
      "General Objective:",
      "Design and implement a secure online voting system using facial recognition for voter authentication",
      "",
      "Specific Objectives:",
      "1. Assess current voting system challenges",
      "2. Design comprehensive system architecture",
      "3. Implement facial recognition with liveness detection",
      "4. Evaluate system performance and usability"
    ],
    type: "content"
  },
  {
    title: "Theoretical Framework",
    content: [
      "Technology Acceptance Model (TAM)",
      "• Perceived Usefulness → Behavioral Intention",
      "• Perceived Ease of Use → Actual Use",
      "",
      "Biometric Authentication Principles",
      "• Something you ARE (facial features)",
      "• Uniqueness & Permanence",
      "• Anti-spoofing through liveness detection"
    ],
    type: "content"
  },
  {
    title: "Research Methodology",
    content: [
      "Research Design: Mixed Methods (Quantitative + Qualitative)",
      "",
      "Data Collection:",
      "• Surveys: 200 eligible voters (stratified sampling)",
      "• Interviews: 15 election officials",
      "• System Testing: 500 face samples, 30 usability testers",
      "",
      "Development: Agile methodology with iterative sprints"
    ],
    type: "content"
  },
  {
    title: "Technology Stack",
    content: [
      "Frontend:",
      "• React 18 + TypeScript",
      "• Tailwind CSS + shadcn/ui",
      "",
      "Backend:",
      "• PostgreSQL (Supabase)",
      "• Row Level Security (RLS)",
      "",
      "Face Recognition:",
      "• face-api.js (TensorFlow.js)",
      "• 128-dimensional descriptors"
    ],
    type: "content"
  },
  {
    title: "System Architecture",
    content: [
      "Three-Tier Architecture:",
      "",
      "┌─────────────────────────────────┐",
      "│  Client Layer (React/TS)       │",
      "│  • UI Components               │",
      "│  • Face-api.js processing      │",
      "├─────────────────────────────────┤",
      "│  API Layer (Supabase SDK)      │",
      "├─────────────────────────────────┤",
      "│  Backend (PostgreSQL + RLS)    │",
      "└─────────────────────────────────┘"
    ],
    type: "content"
  },
  {
    title: "Key Performance Results",
    content: [
      "98.0% | Face Recognition Accuracy",
      "0.3% | False Acceptance Rate (FAR)",
      "2.0% | False Rejection Rate (FRR)",
      "94.3% | Liveness Detection Rate",
      "82.5 | SUS Usability Score (Excellent)"
    ],
    type: "stats"
  },
  {
    title: "Face Recognition Accuracy",
    content: [
      "Test Conditions:",
      "• Standard Lighting: 99.0%",
      "• Low Light: 96.0%",
      "• Different Angles (±30°): 97.0%",
      "• With Glasses: 98.0%",
      "• Different Expressions: 100.0%",
      "",
      "Overall: 98.0% (500 tests, 100 individuals)"
    ],
    type: "content"
  },
  {
    title: "Liveness Detection Results",
    content: [
      "Anti-Spoofing Performance:",
      "",
      "• Printed Photo Attacks: 98.0% detected",
      "• Phone Screen Display: 95.0% detected",
      "• Tablet Screen Display: 92.0% detected",
      "• Video Replay Attacks: 88.0% detected",
      "",
      "Overall Detection Rate: 94.3%"
    ],
    type: "content"
  },
  {
    title: "User Acceptance Survey",
    content: [
      "Survey Results (n=200):",
      "",
      "• 90% found system easy to use",
      "• 90% prefer facial over ID verification",
      "• 83% trust system security",
      "• 85% would recommend to others",
      "• 80% prefer over traditional voting"
    ],
    type: "content"
  },
  {
    title: "System Screenshots",
    content: [
      "Key Interfaces Developed:",
      "",
      "1. Landing Page - Modern, responsive design",
      "2. Voter Registration - Two-step wizard",
      "3. Face Verification - Real-time feedback",
      "4. Voting Ballot - Clear candidate selection",
      "5. Admin Dashboard - Election management"
    ],
    type: "content"
  },
  {
    title: "Conclusions",
    content: [
      "✓ Facial recognition is viable for voter authentication",
      "  (98.0% accuracy exceeds industry standards)",
      "",
      "✓ Liveness detection effectively prevents spoofing",
      "  (94.3% attack prevention rate)",
      "",
      "✓ High user acceptance indicates adoption potential",
      "  (SUS score 82.5 = Excellent)",
      "",
      "✓ Client-side processing is feasible on standard devices"
    ],
    type: "conclusion"
  },
  {
    title: "Recommendations",
    content: [
      "To Electoral Bodies:",
      "• Pilot test in controlled environments",
      "• Develop voter education programs",
      "• Establish legal frameworks for biometric voting",
      "",
      "To Developers:",
      "• Enhance liveness detection for video attacks",
      "• Implement accessibility features",
      "• Consider multi-modal biometric integration"
    ],
    type: "content"
  },
  {
    title: "Areas for Further Research",
    content: [
      "1. Multi-modal biometrics (face + fingerprint)",
      "2. Blockchain integration for vote transparency",
      "3. Long-term face template stability studies",
      "4. Cultural factors in facial recognition",
      "5. Rural deployment challenges",
      "6. Accessibility for visual impairments"
    ],
    type: "content"
  },
  {
    title: "Thank You",
    subtitle: "Questions & Discussion",
    content: [
      "SecureVote: Facial Recognition Voting System",
      "",
      "Key Achievements:",
      "• 98.0% Recognition Accuracy",
      "• 94.3% Spoof Detection",
      "• 82.5 SUS Score",
      "",
      "Contact: [student@ulk.ac.rw]"
    ],
    type: "title"
  }
];

const DefensePresentation = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        const slide = slides[i];

        // Background gradient simulation
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        // Accent bar
        pdf.setFillColor(20, 184, 166); // teal-500
        pdf.rect(0, 0, 8, pageHeight, "F");

        // Slide number
        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(`${i + 1} / ${slides.length}`, pageWidth - 15, pageHeight - 8);

        if (slide.type === "title") {
          // Title slide
          pdf.setFontSize(32);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont("helvetica", "bold");
          
          const titleLines = pdf.splitTextToSize(slide.title, pageWidth - 60);
          let yPos = 60;
          for (const line of titleLines) {
            pdf.text(line, pageWidth / 2, yPos, { align: "center" });
            yPos += 14;
          }

          if (slide.subtitle) {
            pdf.setFontSize(24);
            pdf.setTextColor(20, 184, 166);
            pdf.text(slide.subtitle, pageWidth / 2, yPos + 10, { align: "center" });
            yPos += 25;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(148, 163, 184);
          pdf.setFont("helvetica", "normal");
          for (const line of slide.content) {
            yPos += 10;
            pdf.text(line, pageWidth / 2, yPos, { align: "center" });
          }
        } else if (slide.type === "stats") {
          // Stats slide
          pdf.setFontSize(28);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont("helvetica", "bold");
          pdf.text(slide.title, 25, 30);

          let yPos = 55;
          for (const stat of slide.content) {
            const [value, label] = stat.split(" | ");
            
            pdf.setFontSize(36);
            pdf.setTextColor(20, 184, 166);
            pdf.setFont("helvetica", "bold");
            pdf.text(value, 35, yPos);

            pdf.setFontSize(16);
            pdf.setTextColor(226, 232, 240);
            pdf.setFont("helvetica", "normal");
            pdf.text(label, 90, yPos);

            yPos += 28;
          }
        } else {
          // Content slide
          pdf.setFontSize(28);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont("helvetica", "bold");
          pdf.text(slide.title, 25, 30);

          // Underline
          pdf.setDrawColor(20, 184, 166);
          pdf.setLineWidth(1);
          pdf.line(25, 35, 120, 35);

          pdf.setFontSize(14);
          pdf.setFont("helvetica", "normal");
          
          let yPos = 50;
          for (const line of slide.content) {
            if (line === "") {
              yPos += 6;
              continue;
            }

            if (line.startsWith("•") || line.startsWith("✓")) {
              pdf.setTextColor(20, 184, 166);
              pdf.text(line.charAt(0), 30, yPos);
              pdf.setTextColor(226, 232, 240);
              pdf.text(line.substring(2), 38, yPos);
            } else if (line.match(/^\d+\./)) {
              pdf.setTextColor(20, 184, 166);
              pdf.text(line.split(".")[0] + ".", 30, yPos);
              pdf.setTextColor(226, 232, 240);
              pdf.text(line.substring(line.indexOf(".") + 2), 38, yPos);
            } else if (line.includes(":") && !line.startsWith(" ")) {
              pdf.setTextColor(255, 255, 255);
              pdf.setFont("helvetica", "bold");
              pdf.text(line, 25, yPos);
              pdf.setFont("helvetica", "normal");
            } else {
              pdf.setTextColor(226, 232, 240);
              pdf.text(line, 25, yPos);
            }
            yPos += 12;
          }
        }

        // Footer
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text("SecureVote: Facial Recognition Voting System | ULK Master's Thesis Defense", 25, pageHeight - 8);
      }

      pdf.save("SecureVote_Defense_Presentation.pdf");
      toast.success("Presentation PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate presentation");
    } finally {
      setIsGenerating(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Slide Preview */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
              {/* Accent bar */}
              <div className="w-2 bg-teal-500" />
              
              {/* Slide content */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                {currentSlideData.type === "title" ? (
                  <div className="text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                      {currentSlideData.title}
                    </h1>
                    {currentSlideData.subtitle && (
                      <h2 className="text-xl md:text-2xl text-teal-400 mb-8">
                        {currentSlideData.subtitle}
                      </h2>
                    )}
                    <div className="space-y-2 text-slate-400">
                      {currentSlideData.content.map((line, idx) => (
                        <p key={idx} className="text-sm md:text-base">{line}</p>
                      ))}
                    </div>
                  </div>
                ) : currentSlideData.type === "stats" ? (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                      {currentSlideData.title}
                    </h2>
                    <div className="space-y-4">
                      {currentSlideData.content.map((stat, idx) => {
                        const [value, label] = stat.split(" | ");
                        return (
                          <div key={idx} className="flex items-center gap-6">
                            <span className="text-3xl md:text-4xl font-bold text-teal-400 w-24">
                              {value}
                            </span>
                            <span className="text-slate-300 text-lg">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {currentSlideData.title}
                    </h2>
                    <div className="w-24 h-1 bg-teal-500 mb-6" />
                    <div className="space-y-2">
                      {currentSlideData.content.map((line, idx) => {
                        if (line === "") return <div key={idx} className="h-3" />;
                        
                        if (line.startsWith("•") || line.startsWith("✓")) {
                          return (
                            <p key={idx} className="text-slate-300 text-sm md:text-base flex">
                              <span className="text-teal-400 mr-2">{line.charAt(0)}</span>
                              {line.substring(2)}
                            </p>
                          );
                        }
                        
                        if (line.match(/^\d+\./) ) {
                          return (
                            <p key={idx} className="text-slate-300 text-sm md:text-base flex">
                              <span className="text-teal-400 mr-2">{line.split(".")[0]}.</span>
                              {line.substring(line.indexOf(".") + 2)}
                            </p>
                          );
                        }
                        
                        if (line.includes(":") && !line.startsWith(" ") && !line.startsWith("•")) {
                          return (
                            <p key={idx} className="text-white font-semibold text-sm md:text-base mt-2">
                              {line}
                            </p>
                          );
                        }
                        
                        return (
                          <p key={idx} className="text-slate-300 text-sm md:text-base">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-700/50 text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-700/50 text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Slide number */}
              <div className="absolute bottom-4 right-4 text-slate-500 text-sm">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slide thumbnails */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-4">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`flex-shrink-0 w-32 h-20 rounded border-2 transition-all ${
                idx === currentSlide
                  ? "border-teal-500 bg-slate-700"
                  : "border-slate-600 bg-slate-800 hover:border-slate-500"
              }`}
            >
              <div className="p-2 h-full flex flex-col justify-center">
                <p className="text-[8px] text-white font-medium truncate">
                  {slide.title}
                </p>
                <p className="text-[7px] text-slate-400">Slide {idx + 1}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <Presentation className="h-5 w-5 text-teal-500 mr-2" />
          <p className="text-slate-400 text-sm">
            Use arrow keys or click arrows to navigate • Download PDF for the full presentation
          </p>
        </div>
      </div>
    </div>
  );
};

export default DefensePresentation;
