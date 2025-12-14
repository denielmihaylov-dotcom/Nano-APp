import React, { useState, useEffect } from 'react';
import { checkHasApiKey, promptSelectApiKey, generateImageContent } from './services/gemini';
import ImageUploader from './components/ImageUploader';
import { GeneratedResult } from './types';
import { Sparkles, Zap, Image as ImageIcon, Loader2, AlertCircle, Info, ExternalLink, Monitor, Smartphone, Square, Scale, Maximize2, Download, HelpCircle, X, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  // State for API Key
  const [hasKey, setHasKey] = useState<boolean>(false);
  
  // State for Inputs
  const [characterFile, setCharacterFile] = useState<File | null>(null);
  const [characterPreview, setCharacterPreview] = useState<string | null>(null);
  
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [resolution, setResolution] = useState<string>("1K");
  
  // State for Generation
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for Installation
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState<boolean>(false);

  useEffect(() => {
    // Initial check for API key
    checkHasApiKey().then(setHasKey);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleConnect = async () => {
    try {
      await promptSelectApiKey();
      // Assume success if no error thrown, check again
      const selected = await checkHasApiKey();
      setHasKey(selected);
    } catch (e) {
      console.error("Failed to select key", e);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleRun = async () => {
    if (!hasKey) {
        await handleConnect();
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const genResult = await generateImageContent(prompt, characterFile, referenceFile, aspectRatio, resolution);
      setResult(genResult);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render aspect ratio icon
  const getRatioIcon = (ratio: string) => {
    if (ratio === "1:1") return <Square size={16} />;
    if (ratio === "16:9") return <Monitor size={16} />;
    if (ratio === "9:16") return <Smartphone size={16} />;
    // Fallback for others
    return <div className="w-4 h-4 border border-current rounded-sm" style={{
        aspectRatio: ratio.replace(':', '/')
    }} />;
  };

  // --------------------------------------------------------------------------
  // Main App Screen (Direct Entry)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
                    Gemini 3 Pro Imagine
                </h1>
                <h1 className="text-lg font-bold text-white sm:hidden">Imagine</h1>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* Install Button */}
                 {deferredPrompt ? (
                    <button 
                        onClick={handleInstallClick} 
                        className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-slate-700"
                    >
                        <Download size={16} /> <span className="hidden lg:inline">Install App</span>
                    </button>
                 ) : (
                    <button 
                        onClick={() => setShowInstallHelp(true)} 
                        className="hidden md:flex items-center gap-1 text-slate-400 hover:text-white transition-colors p-2"
                        title="Installation Help"
                    >
                        <HelpCircle size={18} />
                    </button>
                 )}

                 {/* API Connection Button */}
                 {!hasKey ? (
                    <button
                        onClick={handleConnect}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/25 border border-blue-400/20 animate-pulse"
                    >
                        <Zap size={16} className="fill-white" />
                        <span className="hidden sm:inline">Connect Account</span>
                        <span className="sm:hidden">Connect</span>
                    </button>
                 ) : (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1.5 rounded-lg border border-emerald-400/20 cursor-help" title="Connected to Google Cloud">
                        <ShieldCheck size={14} />
                        <span className="hidden md:inline">API Active</span>
                    </div>
                 )}
            </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <section className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ImageIcon className="text-blue-400" size={20}/>
                    Reference Images
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 xl:grid-cols-2">
                    <ImageUploader 
                        label="Character Reference" 
                        description="Your character to replicate"
                        file={characterFile}
                        previewUrl={characterPreview}
                        onFileChange={(f, url) => { setCharacterFile(f); setCharacterPreview(url); }}
                    />
                    <ImageUploader 
                        label="Style/Structure" 
                        description="Background, pose, or vibe"
                        file={referenceFile}
                        previewUrl={referencePreview}
                        onFileChange={(f, url) => { setReferenceFile(f); setReferencePreview(url); }}
                    />
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4 flex-1">
                
                {/* Not Connected Warning Banner */}
                {!hasKey && (
                     <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                         <div className="flex items-start gap-3">
                             <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                                 <Info size={18} />
                             </div>
                             <div className="text-sm">
                                 <p className="text-blue-100 font-bold">Connect to Start</p>
                                 <p className="text-blue-300/80 text-xs leading-relaxed">
                                     Link your Google Cloud project to use the Gemini 3 Pro model.
                                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1 inline-flex items-center hover:underline">
                                         Billing Info <ExternalLink size={10} className="ml-0.5" />
                                     </a>
                                 </p>
                             </div>
                         </div>
                     </div>
                )}

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Zap className="text-purple-400" size={20}/>
                        Prompt & Settings
                    </h2>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-6 mb-2">
                    {/* Aspect Ratio Selector */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider flex items-center gap-1">
                            <Scale size={12} /> Aspect Ratio
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {["1:1", "16:9", "9:16", "4:3", "3:4"].slice(0, 3).map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    title={ratio}
                                    className={`
                                        flex items-center justify-center p-2 rounded-lg text-sm font-medium border transition-all
                                        ${aspectRatio === ratio
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                                        }
                                    `}
                                >
                                    {getRatioIcon(ratio)}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             {["4:3", "3:4"].map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    title={ratio}
                                    className={`
                                        flex items-center justify-center p-2 rounded-lg text-sm font-medium border transition-all
                                        ${aspectRatio === ratio
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                                        }
                                    `}
                                >
                                    <span className="text-[10px]">{ratio}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resolution Selector */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider flex items-center gap-1">
                             <Maximize2 size={12} /> Resolution
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {["1K", "2K", "4K"].map((res) => (
                                <button
                                    key={res}
                                    onClick={() => setResolution(res)}
                                    className={`
                                        flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-bold border transition-all
                                        ${resolution === res
                                            ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                            : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                                        }
                                    `}
                                >
                                    {res}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to generate. Be specific about how to use the character and reference images..."
                    className="flex-1 min-h-[120px] w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none placeholder:text-slate-600 leading-relaxed"
                />

                <button
                    onClick={handleRun}
                    disabled={loading || (hasKey && !prompt && !characterFile && !referenceFile)}
                    className={`
                        py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                        ${loading || (hasKey && !prompt && !characterFile && !referenceFile)
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:scale-[1.02] shadow-blue-500/25'}
                    `}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Thinking...
                        </>
                    ) : !hasKey ? (
                        <>
                            <Zap className="fill-current" />
                            Connect & Run
                        </>
                    ) : (
                        <>
                            <Sparkles className="fill-current" />
                            Run Generation
                        </>
                    )}
                </button>
                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-200 text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        </section>

        {/* Right Column: Output */}
        <section className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl h-full flex flex-col relative overflow-hidden group">
                
                {/* Result Display Area */}
                <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative">
                    
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    ></div>

                    {!result && !loading && (
                        <div className="text-center p-8 max-w-sm">
                            <div className="w-20 h-20 bg-slate-900 rounded-full mx-auto flex items-center justify-center mb-4 border border-slate-800">
                                <ImageIcon className="text-slate-700 w-10 h-10" />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-1">No Image Generated Yet</h3>
                            <p className="text-slate-600 text-sm">Upload your references and enter a prompt to start imagining.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={20} className="text-blue-500 animate-pulse" />
                                </div>
                            </div>
                            <p className="mt-6 text-blue-200 font-medium animate-pulse">Creating masterpiece...</p>
                        </div>
                    )}

                    {result?.imageUrl && (
                        <img 
                            src={result.imageUrl} 
                            alt="Generated Output" 
                            className="w-full h-full object-contain max-h-[80vh] animate-in fade-in duration-700"
                        />
                    )}
                </div>

                {/* Footer / Actions for Image */}
                {result?.imageUrl && (
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <a 
                            href={result.imageUrl} 
                            download="gemini-creation.png"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            Download
                        </a>
                    </div>
                )}
            </div>
            
            {/* Optional Text Output (if model returns text explanation) */}
            {result?.text && (
                <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 text-sm leading-relaxed">
                    <span className="font-semibold text-blue-400 block mb-1">Model Notes:</span>
                    {result.text}
                </div>
            )}
        </section>
      </main>
      
        {/* Install Help Modal */}
        {showInstallHelp && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInstallHelp(false)}>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowInstallHelp(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
                    
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Download size={20} className="text-blue-400"/> 
                        Install App
                    </h3>
                    
                    <div className="space-y-4 text-slate-300 text-sm">
                        <p>This app can be installed to your home screen or desktop for instant access.</p>
                        
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <p className="font-semibold text-white mb-2 text-xs uppercase tracking-wider">Instructions</p>
                            <ul className="list-disc pl-4 space-y-2 text-slate-400">
                                <li>
                                    <strong className="text-slate-200">Desktop (Chrome/Edge):</strong><br/> 
                                    Click the install icon <Download size={12} className="inline"/> in the address bar (top right).
                                </li>
                                <li>
                                    <strong className="text-slate-200">iPhone (Safari):</strong><br/> 
                                    Tap <strong>Share</strong> (bottom center) → Scroll down → <strong>Add to Home Screen</strong>.
                                </li>
                                <li>
                                    <strong className="text-slate-200">Android (Chrome):</strong><br/> 
                                    Tap <strong>Menu (⋮)</strong> → <strong>Install App</strong> or <strong>Add to Home screen</strong>.
                                </li>
                            </ul>
                        </div>
                        
                        <div className="flex items-start gap-2 text-xs text-yellow-500 bg-yellow-900/10 p-2 rounded border border-yellow-900/30">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            <p>If you don't see these options, make sure you have opened this page in a <strong>new full browser tab</strong>.</p>
                        </div>
                    </div>
                    
                    <button onClick={() => setShowInstallHelp(false)} className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;