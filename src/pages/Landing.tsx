import { Link } from 'react-router-dom';
import { Sparkles, Users, MessageCircle, Calendar, ArrowRight, CheckCircle, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { ROUTES, APP_CONFIG } from '../lib/constants';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '../components/ui/Motion';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Get matched with the perfect skill partner using Gemini AI',
  },
  {
    icon: Users,
    title: 'Peer-to-Peer Learning',
    description: 'Connect with fellow students who have the skills you need',
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Chat',
    description: 'Communicate instantly with your matches',
  },
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Schedule sessions with just a few clicks',
  },
];

const steps = [
  'Sign in with your campus Google account',
  'Post what skills you can offer or want to learn',
  'Get matched with compatible students',
  'Chat and book a session',
];

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-primary-100)]/30 dark:bg-[var(--color-primary-900)]/10 blur-[120px] animate-blob" />
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-100/30 dark:bg-cyan-900/10 blur-[100px] animate-blob animation-delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-default)]/50 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-[var(--color-primary-600)] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-[var(--text-primary)] tracking-tight">{APP_CONFIG.name}</span>
          </div>
          
          <Link to={isAuthenticated ? ROUTES.dashboard : ROUTES.login}>
            <Button>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <SlideUp>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30 text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)] font-medium text-sm mb-8 border border-[var(--color-primary-100)] dark:border-[var(--color-primary-800)]">
              <GraduationCap className="h-4 w-4" />
              <span>Exclusively for Campus Students</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-[var(--text-primary)] leading-tight tracking-tight mb-8">
              Learn from peers.<br />
              <span className="text-[var(--color-primary-600)]">Share your skills.</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
              {APP_CONFIG.name} connects students on campus who want to learn with those who can teach. 
              Find your perfect skill match today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={ROUTES.login}>
                <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-[var(--color-primary-500)]/20 hover:shadow-[var(--color-primary-500)]/30" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Start Learning
                </Button>
              </Link>
              <Link to={ROUTES.login}>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                  Share Your Skills
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-[var(--text-tertiary)]">
              Requires @{APP_CONFIG.allowedEmailDomains[0]} email
            </p>
          </SlideUp>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-surface-highlight)]/50">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-center text-[var(--text-primary)] mb-16">
              Why students love {APP_CONFIG.name}
            </h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" delay={0.2}>
            {features.map((feature) => (
              <StaggerItem key={feature.title} className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-default)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30 text-[var(--color-primary-600)] mb-6">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-center text-[var(--text-primary)] mb-16">
              How It Works
            </h2>
          </FadeIn>
          <StaggerContainer className="space-y-4">
            {steps.map((step, index) => (
              <StaggerItem key={index} className="flex items-center gap-6 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[var(--color-primary-600)] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  {index + 1}
                </div>
                <p className="text-lg font-medium text-[var(--text-primary)]">{step}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-[var(--color-primary-600)] px-6 py-20 text-center shadow-2xl">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6">
                Ready to start learning?
              </h2>
              <p className="text-xl text-[var(--color-primary-100)] mb-10 max-w-2xl mx-auto">
                Join your campus community and unlock peer-to-peer learning today.
              </p>
              <Link to={ROUTES.login}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-white text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] border-none shadow-xl"
                >
                  Sign In with Google
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-8 w-8 bg-[var(--color-primary-600)] rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)]">{APP_CONFIG.name}</span>
          </div>
          <p className="text-[var(--text-tertiary)] text-sm">
            Built with Firebase + Gemini AI for GDG TechSprint Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}
