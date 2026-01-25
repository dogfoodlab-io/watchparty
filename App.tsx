
import React from 'react';
import { Play, Tv, Users, MessageSquare, ChevronRight, Github, Twitter, Menu, X } from 'lucide-react';
import TimelineDemo from './components/TimelineDemo';
import Features from './components/Features';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">ASYNC <span className="text-indigo-500">PARTY</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">How it Works</a>
          <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all">
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-900 border-b border-white/5 p-6 space-y-4 animate-in slide-in-from-top">
          <a href="#features" className="block text-zinc-400 hover:text-white">Features</a>
          <a href="#" className="block text-zinc-400 hover:text-white">How it Works</a>
          <a href="#" className="block text-zinc-400 hover:text-white">Pricing</a>
          <button className="w-full bg-white text-black px-5 py-3 rounded-xl text-sm font-bold">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider mb-8 uppercase animate-pulse">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Now supporting Netflix & Disney+
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
          Watch together.<br />
          <span className="text-gradient">Whenever you want.</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The async social network for movie lovers. Comment on every moment, share your reaction timeline, and watch with friends across different timezones.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2">
            Start a Party <ChevronRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 glass text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all border border-white/10">
            Install Extension
          </button>
        </div>

        {/* Demo Visualization */}
        <TimelineDemo />
      </div>
    </section>
  );
};

const Stats: React.FC = () => {
  return (
    <div className="border-y border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">2M+</div>
          <div className="text-zinc-500 text-sm">Timelines Created</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">150+</div>
          <div className="text-zinc-500 text-sm">Platforms Supported</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">45k</div>
          <div className="text-zinc-500 text-sm">Active Watch Groups</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">4.9/5</div>
          <div className="text-zinc-500 text-sm">Extension Rating</div>
        </div>
      </div>
    </div>
  );
};

const CTA: React.FC = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-4xl mx-auto glass border border-white/10 p-12 md:p-20 rounded-[3rem] text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to stop scheduling?</h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
          Join thousands of friends who watch on their own time, but still stay closer than ever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all">
            Join the beta
          </button>
          <button className="w-full sm:w-auto px-10 py-4 border border-white/20 rounded-full font-black hover:bg-white/5 transition-all">
            Browse Trending
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-black tracking-tighter">ASYNC <span className="text-indigo-500">PARTY</span></span>
          </div>
          <p className="text-zinc-500 max-w-sm mb-6">
            Building the future of social entertainment, one timestamp at a time. No more "Wait for me!" or "Are you here yet?"
          </p>
          <div className="flex gap-4">
            <Twitter className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" />
            <Github className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" />
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Product</h4>
          <ul className="space-y-4 text-zinc-500">
            <li className="hover:text-white cursor-pointer">Extension</li>
            <li className="hover:text-white cursor-pointer">Mobile App</li>
            <li className="hover:text-white cursor-pointer">Web Importer</li>
            <li className="hover:text-white cursor-pointer">Roadmap</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-zinc-500">
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Privacy</li>
            <li className="hover:text-white cursor-pointer">Terms</li>
            <li className="hover:text-white cursor-pointer">Blog</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-zinc-600 text-sm">© 2024 Async Watch Party Inc. All rights reserved.</p>
        <div className="flex items-center gap-2 text-zinc-600 text-sm">
          Made with <span className="text-red-500">❤️</span> by Movie Lovers
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-indigo-500/30">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        
        {/* Testimonial Featurette */}
        <section className="py-24 px-6 overflow-hidden">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2">
                <div className="relative">
                   <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600/20 blur-[60px] rounded-full"></div>
                   <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
                     "It finally feels like we're watching together <span className="text-purple-400">on our own time.</span>"
                   </h2>
                   <div className="flex items-center gap-4 mb-8">
                      <img src="https://picsum.photos/seed/sarah/100" className="w-16 h-16 rounded-full ring-4 ring-zinc-900 shadow-xl" alt="User" />
                      <div>
                        <div className="font-bold text-lg text-white">Sarah Jenkins</div>
                        <div className="text-zinc-500">Power user since 2023</div>
                      </div>
                   </div>
                   <p className="text-zinc-400 text-lg leading-relaxed">
                     I live in London, my best friend is in Tokyo. We could never sync up for live parties. Now, I wake up to her hilarious reaction timeline and I feel like she's sitting right next to me while I have my morning coffee.
                   </p>
                </div>
              </div>
              <div className="w-full md:w-1/2 relative">
                 <div className="glass aspect-[4/3] rounded-3xl p-4 overflow-hidden shadow-2xl border border-white/10 group">
                    <img 
                      src="https://picsum.photos/seed/friends/800/600" 
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700" 
                      alt="Friends Reacting"
                    />
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-2">
                       <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 float">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-bold text-white/60">LIVE REACTION</span>
                         </div>
                         <p className="text-sm">"WAIT WHAT?! SHE WAS THE GHOST THE WHOLE TIME?"</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
