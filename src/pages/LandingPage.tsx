import { motion } from "framer-motion";
import { Shield, Users, Vote, CheckCircle, Camera, Lock, BarChart3, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Face Recognition",
      description: "Advanced biometric authentication ensures only registered voters can access the system."
    },
    {
      icon: Lock,
      title: "One Vote Guarantee",
      description: "Strict enforcement ensures each voter can cast only one vote per election."
    },
    {
      icon: Shield,
      title: "Tamper-Proof",
      description: "Immutable vote records with blockchain-grade security and integrity checks."
    },
    {
      icon: BarChart3,
      title: "Real-Time Results",
      description: "Live monitoring and transparent vote counting for complete election oversight."
    }
  ];

  const steps = [
    { step: 1, title: "Face Verification", description: "Camera captures and verifies your identity" },
    { step: 2, title: "Access Granted", description: "System confirms eligibility and voting status" },
    { step: 3, title: "Cast Your Vote", description: "Select your candidate securely" },
    { step: 4, title: "Confirmation", description: "Receive instant verification of your vote" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen hero-gradient overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal/10 rounded-full blur-3xl float-animation" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/5 rounded-full blur-3xl" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <Vote className="w-8 h-8 text-teal-light" />
            </div>
            <span className="text-xl font-display font-bold text-white">SecureVote</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" onClick={() => navigate('/admin/login')}>
              Admin Portal
            </Button>
            <Button variant="heroOutline" onClick={() => navigate('/vote')}>
              Vote Now
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-32 lg:pt-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 mb-8">
                <Shield className="w-4 h-4 text-teal-light" />
                Secure • Transparent • Trusted
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Face Recognition
              <span className="block text-gradient">Voting System</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Experience the future of democracy with our secure, biometric-authenticated 
              voting platform. Your face is your credential.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button variant="hero" size="xl" onClick={() => navigate('/register')}>
                <UserPlus className="w-5 h-5 mr-2" />
                Register to Vote
              </Button>
              <Button variant="heroOutline" size="xl" onClick={() => navigate('/vote')}>
                <Camera className="w-5 h-5 mr-2" />
                Already Registered? Vote Now
              </Button>
            </motion.div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => navigate('/admin/login')}>
                <Users className="w-4 h-4 mr-2" />
                Admin Portal
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              { value: "100%", label: "Secure" },
              { value: "1 Vote", label: "Per Person" },
              { value: "Real-Time", label: "Results" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(210 20% 98%)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Built for Security & Trust
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our system combines cutting-edge biometric technology with robust security measures
              to ensure fair and transparent elections.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-teal/30 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-teal transition-colors" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-muted/50">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A seamless voting experience in just four simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="relative inline-flex">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-border -translate-y-1/2" />
                  )}
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mt-4 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            className="relative overflow-hidden bg-primary rounded-3xl p-12 md:p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-primary to-teal/50 opacity-90" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <CheckCircle className="w-16 h-16 text-teal-light mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                Register once with your face, then vote securely in any election.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" onClick={() => navigate('/register')}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register Now
                </Button>
                <Button variant="heroOutline" size="xl" onClick={() => navigate('/vote')}>
                  <Camera className="w-5 h-5 mr-2" />
                  Begin Face Verification
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark text-white/60 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Vote className="w-6 h-6 text-teal-light" />
              </div>
              <span className="text-lg font-display font-semibold text-white">SecureVote</span>
            </div>
            <p className="text-sm">
              © 2024 SecureVote. Secure Face Recognition Voting System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
