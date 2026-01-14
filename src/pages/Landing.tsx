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
      {/* Header */}
      <header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 border-b-2 border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-[var(--color-primary-500)] border-2 border-black dark:border-white rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <Sparkles className="h-6 w-6 text-white dark:text-black" />
            </div>
            <span className="font-display font-bold text-3xl text-[var(--text-primary)] tracking-tighter uppercase">{APP_CONFIG.name}</span>
          </div>
          
          <Link to={isAuthenticated ? ROUTES.dashboard : ROUTES.login}>
            <Button>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <SlideUp>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[var(--color-primary-500)] text-white font-bold text-sm mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:border-white dark:text-black uppercase tracking-wider transform -rotate-2">
              <GraduationCap className="h-4 w-4" />
              <span>Campus Exclusive</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-black text-[var(--text-primary)] leading-[0.9] tracking-tighter mb-8">
              SKILL<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] stroke-black" style={{ WebkitTextStroke: '2px var(--border-default)' }}>SWAP</span>
            </h1>
            <p className="text-xl sm:text-2xl text-[var(--text-secondary)] font-medium max-w-lg leading-tight mb-10 border-l-4 border-[var(--color-primary-500)] pl-6">
              Trade knowledge like currency. Connect with peers. Master your craft. No subscriptions. No BS.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to={ROUTES.login}>
                <Button size="lg" className="h-16 px-10 text-xl w-full sm:w-auto" rightIcon={<ArrowRight className="h-6 w-6" />}>
                  Start Learning
                </Button>
              </Link>
              <Link to={ROUTES.login}>
                <Button size="lg" variant="outline" className="h-16 px-10 text-xl w-full sm:w-auto bg-[var(--bg-surface)]">
                  Share Skills
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
              * Requires @{APP_CONFIG.allowedEmailDomains[0]} email
            </p>
          </SlideUp>

          {/* Abstract Graphic */}
          <FadeIn delay={0.2} className="hidden lg:block relative h-[500px]">
             <div className="absolute inset-0 bg-[var(--color-primary-500)] rounded-full blur-[100px] opacity-20 animate-pulse" />
             <div className="relative z-10 grid grid-cols-2 gap-4 h-full">
                <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-default)] rounded-xl shadow-[8px_8px_0px_0px_var(--border-default)] p-6 flex flex-col justify-between transform rotate-2 hover:rotate-0 transition-all duration-300">
                   <div className="h-12 w-12 bg-[var(--color-primary-100)] border-2 border-[var(--border-default)] rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-[var(--color-primary-600)]" />
                   </div>
                   <div>
                      <h3 className="font-display font-bold text-2xl mb-2">Find a Mentor</h3>
                      <p className="text-sm font-mono">Connect with seniors who've been there.</p>
                   </div>
                </div>
                <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-default)] rounded-xl shadow-[8px_8px_0px_0px_var(--border-default)] p-6 flex flex-col justify-between transform -rotate-3 mt-12 hover:rotate-0 transition-all duration-300">
                   <div className="h-12 w-12 bg-cyan-100 border-2 border-[var(--border-default)] rounded-full flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-cyan-600" />
                   </div>
                   <div>
                      <h3 className="font-display font-bold text-2xl mb-2">Skill Match</h3>
                      <p className="text-sm font-mono">AI-powered pairings for best results.</p>
                   </div>
                </div>
             </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-surface-highlight)] border-b-2 border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl sm:text-6xl font-display font-black text-center text-[var(--text-primary)] mb-20 uppercase tracking-tight">
              Why <span className="text-[var(--color-primary-500)] underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Use This?</span>
            </h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" delay={0.2}>
            {features.map((feature, i) => (
              <StaggerItem key={feature.title} className="bg-[var(--bg-surface)] p-8 rounded-xl border-2 border-[var(--border-default)] shadow-[6px_6px_0px_0px_var(--border-default)] hover:shadow-[2px_2px_0px_0px_var(--border-default)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-lg bg-[var(--color-primary-100)] border-2 border-[var(--border-default)] text-[var(--color-primary-600)] mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-display text-[var(--text-primary)] mb-3 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] font-medium leading-relaxed">{feature.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-[var(--border-default)]">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl sm:text-6xl font-display font-black text-center text-[var(--text-primary)] mb-20 uppercase tracking-tight">
              The Protocol
            </h2>
          </FadeIn>
          <StaggerContainer className="space-y-6">
            {steps.map((step, index) => (
              <StaggerItem key={index} className="flex items-center gap-6 p-6 rounded-none bg-[var(--bg-surface)] border-l-8 border-[var(--color-primary-500)] shadow-sm hover:bg-[var(--bg-surface-highlight)] transition-colors">
                <div className="flex-shrink-0 h-16 w-16 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-3xl font-display transform -rotate-6">
                  {index + 1}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display uppercase tracking-tight">{step}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary-500)]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative">
            <h2 className="text-5xl sm:text-7xl font-display font-black text-white mb-8 uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Ready to Level Up?
            </h2>
            <p className="text-2xl text-white font-bold mb-12 font-mono uppercase tracking-widest">
              Join the network. Own your skills.
            </p>
            <Link to={ROUTES.login}>
              <Button
                size="lg"
                className="h-20 px-12 text-2xl bg-white text-black hover:bg-gray-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px]"
              >
                Sign In with Google
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-8 w-8 bg-[var(--color-primary-500)] border border-black rounded flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)] uppercase tracking-wider">{APP_CONFIG.name}</span>
          </div>
          <p className="text-[var(--text-tertiary)] text-sm font-mono">
            BUILT WITH FIREBASE + GEMINI AI // GDG TECHSPRINT HACKATHON
          </p>
        </div>
      </footer>
    </div>
  );
}
