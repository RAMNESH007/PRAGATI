import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MinistryOfRailwaysEmblem, IRCTCLogo, PragatiIcon } from '../components/common/Logos';
import { QUICK_LINKS } from '../data/mockData';
import { 
  Sparkles, 
  Sliders, 
  Activity, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Zap,
  Globe,
  Radio,
  Server,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login, switchRoleDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, show quick return banner or redirect
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter username');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    
    const res = await login(username, password);
    setIsLoading(false);
    
    if (res.success) {
      if (username.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/operator/dashboard');
      }
    } else {
      setErrorMessage(res.message || 'Login failed');
    }
  };

  const handleDemoAdmin = async () => {
    setIsLoading(true);
    await login('admin', 'admin123');
    setIsLoading(false);
    navigate('/admin/dashboard');
  };

  const handleDemoOperator = async () => {
    setIsLoading(true);
    await login('operator', 'operator123');
    setIsLoading(false);
    navigate('/operator/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      
      {/* Top Ministry & IRCTC Header matching reference */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          
          {/* Left: Ministry of Railways Emblem & Text */}
          <div className="flex items-center space-x-3">
            <MinistryOfRailwaysEmblem className="w-11 h-11 sm:w-13 sm:h-13" />
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-[#063B7A] tracking-tight leading-tight">
                Ministry of Railways
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Government of India
              </p>
            </div>
          </div>

          {/* Center: Nav links for desktop (Features removed as requested) */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-bold text-slate-600">
            <a href="#hero" className="text-[#FF6B00] hover:text-[#F45100]">Home</a>
            <a href="#about" className="hover:text-[#063B7A] transition">About PRAGATI</a>
            <a href="#workflow" className="hover:text-[#063B7A] transition">How It Works</a>
            <a href="#quick-links" className="hover:text-[#063B7A] transition">Quick Links</a>
          </nav>

          {/* Right: Official IRCTC Logo on right corner & Auth Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <IRCTCLogo className="h-10 sm:h-11" />
            </div>
            {isAuthenticated && (
              <button
                onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/operator/dashboard')}
                className="hidden sm:inline-flex bg-[#063B7A] hover:bg-[#052B5F] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
              >
                Go to Dashboard →
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-white via-[#F5F8FC] to-[#EBF3FF] pt-8 pb-16 lg:pt-12 lg:pb-24">
        
        {/* Background decorative curved wave */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
          <svg viewBox="0 0 1440 600" className="w-full h-full object-cover">
            <path
              d="M0,192L48,208C96,224,192,256,288,250.7C384,245,480,203,576,192C672,181,768,203,864,224C960,245,1056,267,1152,256C1248,245,1344,203,1392,181L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
              fill="#063B7A"
              fillOpacity="0.06"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-6xl font-black text-[#FF6B00] tracking-tight uppercase drop-shadow-sm font-sans">
              PRAGATI
            </h1>
            
            <h2 className="text-base sm:text-xl font-extrabold text-[#063B7A] mt-1 tracking-tight">
              AI-Powered Railway Traffic Management System
            </h2>
            
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-2 max-w-xl mx-auto">
              Intelligent decisions for smoother operations, safer journeys & better throughput.
            </p>
          </div>

          {/* Hero Content: Left Train Visual, Right / Center Login Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            
            {/* Left Column: Sophisticated Vande Bharat / Modern Indian Train Graphic */}
            <div className="lg:col-span-7 relative group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-[#063B7A] to-[#031B3D]">
                <img
                  src="https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=1000&auto=format&fit=crop&q=80"
                  alt="Modern Vande Bharat High Speed Train"
                  className="w-full h-80 sm:h-96 object-cover mix-blend-luminosity opacity-85 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#052B5F]/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right Column: Floating Login Card matching reference image */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-elevated border border-slate-200/80 relative">
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-black text-slate-900">Welcome to PRAGATI</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Login to continue to traffic console</p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleDirectLogin} className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username (admin / operator)"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B00] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B00] focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-[#F45100] to-[#FF6B00] hover:from-[#e04a00] hover:to-[#f06300] text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo Mode: Use "admin" / "admin123" or "operator" / "operator123"'); }} className="text-xs text-slate-500 hover:text-[#063B7A] font-medium">
                      Forgot Password?
                    </a>
                  </div>
                </form>

                {/* Role Switcher Demo Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block text-center">
                    Instant Demo Login (One-Click)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDemoAdmin}
                      className="w-full py-2 px-3 bg-[#063B7A] hover:bg-[#052B5F] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>Login as Admin</span>
                    </button>
                    <button
                      onClick={handleDemoOperator}
                      className="w-full py-2 px-3 bg-[#0878F9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Sliders className="w-3.5 h-3.5 text-white" />
                      <span>Login as Operator</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* About PRAGATI Section matching reference image */}
      <section id="about" className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#063B7A]">
              About PRAGATI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              PRAGATI is an AI-powered decision support system designed to maximize section throughput, reduce delays, optimize track & platform utilization, detect potential conflicts, and assist railway operators with explainable real-time recommendations.
            </p>
          </div>

          {/* 4 Feature Cards matching reference layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1 */}
            <div className="bg-[#F5F8FC] rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-md transition group text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">AI Recommendations</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Smart suggestions for train scheduling, headway spacing, and dynamic route management.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F5F8FC] rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-md transition group text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#063B7A] flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Manual Control</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Operator retains full human-in-the-loop control to review, approve, reject, or modify AI decisions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F5F8FC] rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-md transition group text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Real-time Data</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Live GPS, block section telemetry, and signal status integration for accurate situational awareness.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F5F8FC] rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-md transition group text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Increased Throughput</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Maximize track capacity and platform turnaround without compromising safety buffers.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* How PRAGATI Works Visual Progression */}
      <section id="workflow" className="py-14 bg-[#F5F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#063B7A]">
              How PRAGATI Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              From continuous data ingestion to human-approved execution.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs font-semibold">
            {[
              { step: '1', title: 'Railway Data', icon: Server, color: 'text-blue-600 bg-blue-50' },
              { step: '2', title: 'Real-Time Processing', icon: Zap, color: 'text-amber-600 bg-amber-50' },
              { step: '3', title: 'Digital Network', icon: Layers, color: 'text-purple-600 bg-purple-50' },
              { step: '4', title: 'Conflict Detection', icon: ShieldCheck, color: 'text-red-600 bg-red-50' },
              { step: '5', title: 'Optimization Engine', icon: Cpu, color: 'text-cyan-600 bg-cyan-50' },
              { step: '6', title: 'AI Recommendation', icon: Sparkles, color: 'text-[#FF6B00] bg-orange-50' },
              { step: '7', title: 'Human Review', icon: Sliders, color: 'text-indigo-600 bg-indigo-50' },
              { step: '8', title: 'Updated Plan', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-3 border border-slate-200 shadow-soft flex flex-col items-center justify-center relative">
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Step {item.step}</span>
                  <span className="text-slate-800 text-[11px] font-bold mt-0.5">{item.title}</span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Quick Links Section matching reference image */}
      <section id="quick-links" className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#063B7A]">Quick Links</h2>
              <p className="text-xs text-slate-500 font-medium">Official Indian Railway Portals & External Systems</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border transition-all duration-200 group flex flex-col justify-between ${
                  link.featured 
                    ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 shadow-md hover:border-orange-500' 
                    : 'bg-[#F8FAFC] border-slate-200 hover:border-[#063B7A] hover:bg-white shadow-soft'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      link.featured ? 'bg-[#FF6B00] text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {link.badge}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF6B00] transition" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-[#063B7A] transition">
                    {link.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {link.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#FF6B00] mt-3 block truncate">
                  {link.url.replace('https://', '')}
                </span>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* Official Government Footer matching reference */}
      <footer className="bg-[#052B5F] text-white py-6 border-t border-[#063B7A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-black tracking-wider text-orange-400">PRAGATI</span>
            <span>•</span>
            <span>© 2026 Ministry of Railways, Government of India</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <a href="#privacy" className="hover:text-white transition">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition">Terms of Service</a>
            <a href="#contact" className="hover:text-white transition">Contact CRIS / RailNet</a>
            <span className="text-slate-500 font-mono">All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
