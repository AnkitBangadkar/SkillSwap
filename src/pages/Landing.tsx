import { Link } from 'react-router-dom';
import { Sparkles, Users, MessageCircle, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { ROUTES, APP_CONFIG } from '../lib/constants';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">{APP_CONFIG.name}</span>
          </div>
          
          <Link to={isAuthenticated ? ROUTES.dashboard : ROUTES.login}>
            <Button>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Learn from peers.{' '}
            <span className="text-indigo-600">Share your skills.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            {APP_CONFIG.name} connects students on campus who want to learn with those who can teach. 
            Find your perfect skill match today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.login}>
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start Learning
              </Button>
            </Link>
            <Link to={ROUTES.login}>
              <Button size="lg" variant="outline">
                Share Your Skills
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Only for students with @{APP_CONFIG.allowedEmailDomains[0]} email
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why {APP_CONFIG.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-lg text-gray-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start learning?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join your campus community and unlock peer-to-peer learning.
          </p>
          <Link to={ROUTES.login}>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              Sign In with Google
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span className="font-bold text-white">{APP_CONFIG.name}</span>
          </div>
          <p className="text-gray-400 text-sm">
            Built with Firebase + Gemini AI for GDG TechSprint Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}
