import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  BookOpen, 
  Film, 
  Share2, 
  Hash, 
  Globe, 
  Volume2, 
  Clock, 
  Calendar, 
  Layers, 
  Copy, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Play, 
  AlertTriangle, 
  Loader2, 
  Compass, 
  HelpCircle, 
  Lightbulb,
  ExternalLink,
  Cpu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DocumentaryPackage, SceneBreakdown } from "./types";

const STARTER_TOPICS = [
  {
    title: "The Birth of AI",
    desc: "From Turing's machines to LLMs, the complete history of machine thought.",
    icon: "🧠"
  },
  {
    title: "The Library of Alexandria",
    desc: "The rise and catastrophic loss of antiquity's greatest harbor of knowledge.",
    icon: "🏛️"
  },
  {
    title: "The First Stone Tools",
    desc: "The spark of human technology 3.3 million years ago in the Rift Valley.",
    icon: "🪨"
  },
  {
    title: "The Big Bang",
    desc: "A cinematic voyage tracing the first microseconds of space-time expansion.",
    icon: "💥"
  }
];

const LOADING_STEPS = [
  "Consulting archaeological and historical records...",
  "Formatting Netflix-style cinematic narrator scripts...",
  "Synthesizing scientific consensus and historical debates...",
  "Configuring virtual camera lens properties and focal depth...",
  "Writing ultra-detailed AI scene art and video prompts...",
  "Generating multi-platform social engagement campaigns...",
  "Finalizing foley audio layouts and soundtrack design..."
];

export default function App() {
  // State managers
  const [topic, setTopic] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [packages, setPackages] = useState<DocumentaryPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<DocumentaryPackage | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "script" | "storyboard" | "social" | "graphics">("dashboard");
  const [activeSocialTab, setActiveSocialTab] = useState<"shorts" | "reels" | "tiktok" | "facebook" | "x" | "threads" | "linkedin">("shorts");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Asset generation status mapped by scene number
  const [sceneAssets, setSceneAssets] = useState<Record<number, {
    imageUrl?: string;
    videoOp?: string;
    videoUrl?: string;
    videoStatus: "idle" | "generating" | "done" | "failed";
  }>>({});

  // Diagnostics reports for Veo 3 rendering errors
  const [debugReports, setDebugReports] = useState<any[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);
  const [showGoogleVidsModal, setShowGoogleVidsModal] = useState<boolean>(false);
  const [simulateMode, setSimulateMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("veo3_simulate_mode");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [keyStatus, setKeyStatus] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("veo3_simulate_mode", JSON.stringify(simulateMode));
  }, [simulateMode]);

  const fetchKeyStatus = async () => {
    try {
      const res = await fetch("/api/key-status");
      if (res.ok) {
        const data = await res.json();
        setKeyStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch key status:", err);
    }
  };

  const fetchDebugReports = async () => {
    try {
      const res = await fetch("/api/debug-video-service");
      if (res.ok) {
        const data = await res.json();
        setDebugReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to fetch debug reports:", err);
    }
  };

  const clearDebugReports = async () => {
    try {
      const res = await fetch("/api/debug-video-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" })
      });
      if (res.ok) {
        setDebugReports([]);
      }
    } catch (err) {
      console.error("Failed to clear debug reports:", err);
    }
  };

  // Poll server-side diagnostics when activeTab is storyboard
  useEffect(() => {
    if (activeTab === "storyboard") {
      fetchDebugReports();
      fetchKeyStatus();
      const interval = setInterval(() => {
        fetchDebugReports();
        fetchKeyStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Fetch saved projects from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("historyverse_docs");
      if (saved) {
        const parsed = JSON.parse(saved);
        setPackages(parsed);
        if (parsed.length > 0) {
          setSelectedPackage(parsed[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load local storage projects", err);
    }
  }, []);

  // Save projects to localStorage
  const savePackagesToLocal = (newPackages: DocumentaryPackage[]) => {
    setPackages(newPackages);
    localStorage.setItem("historyverse_docs", JSON.stringify(newPackages));
  };

  // Cycling loaded messages during package generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Utility to handle text copying
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Format full documentary package into Google Vids structured prompt
  const generateGoogleVidsPrompt = (pkg: DocumentaryPackage) => {
    const scenesText = pkg.sceneBreakdowns.map((s, i) => {
      const chapter = pkg.chapters[i] || pkg.chapters[0];
      return `Scene ${s.sceneNumber} (${s.timePeriod || "Historical Era"}):
- Narration: "${chapter?.narration || s.mood}"
- Visual Direction: ${s.environment}, ${s.lighting}, ${s.characters || "Documentary focus"}, ${s.cameraMovement}
- Camera Lens: ${s.lens}
- Text on Slide / Screen: "${chapter?.onScreenText || s.props || pkg.title}"
- Sound Atmosphere: ${s.vfx || pkg.soundDesign?.ambient || "Cinematic ambient"}`;
    }).join("\n\n");

    return `Create a high-impact documentary video titled "${pkg.title}".

PROJECT OUTLINE & TONE:
- Tone: Cinematic historical documentary with high-fidelity pacing and atmospheric visuals.
- Hook (0:00 - 0:10): "${pkg.hook.narration}"
- Visual Cue: ${pkg.hook.visual}
- Soundtrack: ${pkg.hook.sound}

SCENE-BY-SCENE STORYBOARD & SCRIPT:
${scenesText}

CONCLUSION & ENGAGEMENT:
- Closing Narration: "${pkg.ending.conclusion}"
- Resonant Takeaway: "${pkg.ending.takeaway}"
- Engagement Question: "${pkg.ending.engagementQuestion}"`;
  };

  // Trigger package generation
  const handleGeneratePackage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/generate-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, customInstructions })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Internal Server Error");
      }

      const newPackageData = await res.json();
      
      const completePackage: DocumentaryPackage = {
        ...newPackageData,
        id: `pkg-${Date.now()}`,
        topic,
        timestamp: new Date().toLocaleString()
      };

      const updated = [completePackage, ...packages];
      savePackagesToLocal(updated);
      setSelectedPackage(completePackage);
      setActiveTab("dashboard");
      // Reset generated assets for the new project
      setSceneAssets({});
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong while compiling the document. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Select starter topic
  const handleSelectStarter = (starterTopic: string) => {
    setTopic(starterTopic);
  };

  // Delete project
  const handleDeletePackage = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = packages.filter(p => p.id !== id);
    savePackagesToLocal(updated);
    if (selectedPackage?.id === id) {
      setSelectedPackage(updated.length > 0 ? updated[0] : null);
    }
  };

  // Trigger Imagen 3 concept art generation for a scene
  const generateSceneImage = async (sceneNumber: number, prompt: string) => {
    setSceneAssets(prev => ({
      ...prev,
      [sceneNumber]: {
        ...prev[sceneNumber],
        videoStatus: "generating"
      }
    }));

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "16:9", simulate: simulateMode, sceneNumber })
      });

      if (!res.ok) throw new Error("Image failed");
      const data = await res.json();

      setSceneAssets(prev => ({
        ...prev,
        [sceneNumber]: {
          imageUrl: data.imageUrl,
          videoStatus: "idle"
        }
      }));
    } catch (err) {
      console.error(err);
      setSceneAssets(prev => ({
        ...prev,
        [sceneNumber]: {
          ...prev[sceneNumber],
          videoStatus: "failed"
        }
      }));
      fetchDebugReports();
    }
  };

  // Poll Veo 3 video operation progress
  const pollVideoOperation = async (opName: string, sceneNumber: number) => {
    try {
      const res = await fetch("/api/video-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName })
      });

      const data = await res.json();

      if (data.done) {
        setSceneAssets(prev => ({
          ...prev,
          [sceneNumber]: {
            ...prev[sceneNumber],
            videoStatus: "done",
            videoOp: opName,
            videoUrl: data.videoUrl
          }
        }));
        // If there was any error or info, sync diagnostics
        fetchDebugReports();
      } else if (data.error) {
        setSceneAssets(prev => ({
          ...prev,
          [sceneNumber]: {
            ...prev[sceneNumber],
            videoStatus: "failed"
          }
        }));
        fetchDebugReports();
      } else {
        // Continue polling after 8 seconds
        setTimeout(() => pollVideoOperation(opName, sceneNumber), 8000);
      }
    } catch (err) {
      console.error(err);
      setSceneAssets(prev => ({
        ...prev,
        [sceneNumber]: {
          ...prev[sceneNumber],
          videoStatus: "failed"
        }
      }));
      fetchDebugReports();
    }
  };

  // Trigger Veo 3 cinematic video rendering
  const generateSceneVideo = async (sceneNumber: number, prompt: string) => {
    setSceneAssets(prev => ({
      ...prev,
      [sceneNumber]: {
        ...prev[sceneNumber],
        videoStatus: "generating"
      }
    }));

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "16:9", sceneNumber, simulate: simulateMode })
      });

      if (!res.ok) throw new Error("Video start failed");
      const data = await res.json();

      if (data.operationName) {
        setSceneAssets(prev => ({
          ...prev,
          [sceneNumber]: {
            ...prev[sceneNumber],
            videoOp: data.operationName,
            videoStatus: "generating"
          }
        }));
        pollVideoOperation(data.operationName, sceneNumber);
      } else {
        throw new Error("No operation returned");
      }
    } catch (err) {
      console.error(err);
      setSceneAssets(prev => ({
        ...prev,
        [sceneNumber]: {
          ...prev[sceneNumber],
          videoStatus: "failed"
        }
      }));
      fetchDebugReports();
    }
  };

  // Helper to resolve decorative color swatches for each scene's color grade description
  const getColorPaletteSwatches = (colorGrade?: string) => {
    const desc = (colorGrade || "").toLowerCase();
    if (desc.includes("warm") || desc.includes("amber") || desc.includes("golden") || desc.includes("fire")) {
      return ["#1b120c", "#d97706", "#f59e0b", "#fde047"];
    }
    if (desc.includes("cool") || desc.includes("blue") || desc.includes("teal") || desc.includes("neon")) {
      return ["#0c1a30", "#1d4ed8", "#0d9488", "#99f6e4"];
    }
    if (desc.includes("monochrome") || desc.includes("black") || desc.includes("silver") || desc.includes("grey")) {
      return ["#0f172a", "#475569", "#94a3b8", "#f1f5f9"];
    }
    if (desc.includes("emerald") || desc.includes("green") || desc.includes("forest") || desc.includes("sage")) {
      return ["#062f1a", "#15803d", "#22c55e", "#bbf7d0"];
    }
    if (desc.includes("purple") || desc.includes("violet") || desc.includes("neon") || desc.includes("cosmic")) {
      return ["#1e1b4b", "#6d28d9", "#a855f7", "#f3e8ff"];
    }
    // Default cinematic theme colors (slate & amber highlights)
    return ["#1e293b", "#475569", "#94a3b8", "#f59e0b"];
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-300 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar with high-end documentary branding */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center font-bold text-slate-950 text-xl tracking-tighter italic shadow-[0_0_15px_rgba(245,158,11,0.3)]">HV</div>
          <div>
            <h1 className="text-sm md:text-base font-semibold text-slate-100 leading-tight">
              HistoryVerse <span className="text-slate-500 font-normal ml-2">| Production Suite</span>
            </h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold font-mono">
              {selectedPackage ? selectedPackage.topic : "PRE-PRODUCTION ENGINE"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User & AI Engine Avatars in production */}
          <div className="hidden sm:flex -space-x-2 mr-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-100" title="Producer: shanmukhalanki@gmail.com">JD</div>
            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-100" title="VEA-3 Render Host">AL</div>
            <div className="w-8 h-8 rounded-full bg-amber-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-100" title="Imagen 3 Engine">MK</div>
          </div>

          {selectedPackage && (
            <button 
              onClick={() => {
                setSelectedPackage(null);
                setTopic("");
                setCustomInstructions("");
              }}
              className="px-3 py-1.5 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-amber-500 rounded text-xs transition duration-200 flex items-center gap-1 font-mono uppercase font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Package</span>
            </button>
          )}

          {selectedPackage && (
            <button 
              onClick={() => setShowGoogleVidsModal(true)}
              className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 hover:text-white rounded text-xs transition duration-200 flex items-center gap-1.5 font-mono uppercase font-bold shadow-sm"
              title="Export formatted script to Google Vids"
            >
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Google Vids</span>
              <span className="sm:hidden">Vids</span>
            </button>
          )}

          {selectedPackage && (
            <button 
              onClick={() => {
                const projectJson = JSON.stringify(selectedPackage, null, 2);
                copyToClipboard(projectJson, "pkg-copy");
              }}
              className="px-4 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-sm hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition duration-200"
            >
              {copiedKey === "pkg-copy" ? "COPIED JSON" : "EXPORT PACKAGE"}
            </button>
          )}
        </div>
      </header>

      {/* Main Container Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar: Production Modules & History Vault */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/30 flex flex-col p-4 gap-4 shrink-0 overflow-y-auto">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 px-2 font-mono font-bold">PROJECT MODULES ({packages.length})</div>
            <div className="flex flex-col gap-1">
              {packages.length === 0 ? (
                <div className="text-center py-6 px-3 border border-dashed border-slate-800/80 rounded bg-slate-900/10">
                  <p className="text-[11px] text-slate-500 leading-normal">Your production vault is currently empty. Generate a document to save scripts.</p>
                </div>
              ) : (
                packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setActiveTab("dashboard");
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded transition-all duration-200 flex flex-col gap-0.5 relative group border-l-2 ${
                      selectedPackage?.id === pkg.id 
                        ? "bg-amber-500/10 text-amber-500 border-amber-500 rounded-r-sm" 
                        : "text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-display font-semibold truncate pr-4 text-[12px]">
                        {pkg.topic}
                      </span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePackage(pkg.id, e);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition ml-auto p-0.5 shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {pkg.timestamp.split(",")[0]}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Sidebar decorative metadata stats panel */}
          {selectedPackage && (
            <div className="mt-auto p-3 bg-slate-800/50 rounded-lg border border-slate-700/80">
              <div className="text-[10px] text-slate-500 uppercase mb-1 font-mono">Estimated Duration</div>
              <div className="text-xl font-mono text-slate-100 font-bold tracking-tight">
                {selectedPackage.chapters ? `00:${selectedPackage.chapters.length * 8}:15` : "00:42:15"}
              </div>
              <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-1 w-3/4 rounded-full"></div>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-500/5 rounded border border-amber-500/10 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Use the <strong className="text-slate-300">Veo 3</strong> engine inside the visual storyboard tab to render cinematic video loops dynamically.
            </p>
          </div>
        </aside>

        {/* Central Editor Canvas */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950/50">
          
          <AnimatePresence mode="wait">
            {isGenerating ? (
              /* Highly-polished cinematic loading state */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[500px]"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full filter blur-xl animate-pulse" />
                  <Loader2 className="w-16 h-16 text-amber-500 animate-spin relative stroke-[1.5]" />
                  <Cpu className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>

                <h3 className="font-display text-xl font-bold tracking-wider mb-2 text-slate-100">
                  Synthesizing Documentary Core
                </h3>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed font-mono min-h-[40px] text-amber-400">
                  {LOADING_STEPS[currentStep]}
                </p>

                <div className="w-64 h-1 bg-slate-900 rounded-full mt-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                  />
                </div>

                <div className="mt-8 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <span>SYSTEM FEEDBACK</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>GENERATING PRODUCTION DECK</span>
                </div>
              </motion.div>
            ) : !selectedPackage ? (
              /* Welcome Pre-Production Blueprint Screen */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto py-12 px-6 w-full space-y-8"
              >
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase bg-amber-500/10 px-3 py-1 rounded">
                    HistoryVerse Engine
                  </span>
                  <h2 className="font-display font-bold text-3xl tracking-tight text-slate-100">
                    Draft a Cinematic Masterpiece
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    Transform any historical event, scientific era, or technological milestone into a comprehensive, ready-to-produce Netflix-quality documentary suite.
                  </p>
                </div>

                <form onSubmit={handleGeneratePackage} className="space-y-6 bg-slate-900/40 p-6 rounded-lg border border-slate-800">
                  {/* Starter blueprints */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-slate-500 tracking-wider block uppercase font-bold">
                      Select a Starter Blueprint
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {STARTER_TOPICS.map((t) => (
                        <button
                          key={t.title}
                          type="button"
                          onClick={() => handleSelectStarter(t.title)}
                          className={`p-4 rounded border text-left transition duration-200 flex gap-3 group relative ${
                            topic === t.title
                              ? "bg-amber-500/5 border-amber-500/40"
                              : "bg-slate-900/30 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                          }`}
                        >
                          <span className="text-2xl mt-1 select-none">{t.icon}</span>
                          <div>
                            <h4 className="font-display font-semibold text-xs text-slate-200 group-hover:text-amber-400 transition">
                              {t.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {t.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 tracking-wider block uppercase font-bold">
                      Or Define Your Historical Focus
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. The Library of Alexandria, Roman Empire, Birth of AI..."
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 rounded px-4 py-3 pl-11 outline-none text-xs transition font-mono"
                        required
                      />
                      <Sparkles className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                    </div>
                  </div>

                  {/* Advanced directives */}
                  <div className="bg-slate-900/20 border border-slate-800/80 rounded p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-mono font-semibold text-slate-300 uppercase tracking-wider">
                        Director Custom Directives
                      </span>
                    </div>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g. Include scholarly debates about the dates. Tailor the narration to be incredibly solemn, atmospheric, and highly technical. Focus on climate and technological shifts."
                      className="w-full h-24 bg-slate-950/40 border border-slate-800/80 focus:border-amber-500/50 rounded p-3 outline-none text-xs text-slate-300 transition resize-none font-sans"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded flex items-start gap-2 text-rose-400 text-xs leading-relaxed">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Compilation Error:</strong> {errorMsg}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!topic.trim()}
                    className="w-full py-3 bg-amber-500 text-slate-950 hover:bg-amber-400 font-display font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition duration-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Compile Complete Documentary Suite</span>
                  </button>
                </form>
              </motion.div>
            ) : (
              /* Highly-Polished Production workspace dashboard */
              <div className="flex flex-col h-full">
                
                {/* Visual Direction Subheader bar */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-800 bg-slate-900/10">
                  <div className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-300 border border-slate-700 font-mono">
                    {selectedPackage.title}
                  </div>
                  <div className="h-4 w-px bg-slate-700"></div>
                  <div className="text-xs text-slate-400 font-mono hidden md:block">
                    Camera setup: <span className="text-slate-200">{selectedPackage.sceneBreakdowns[0]?.lens || "35mm Prime"} Lens, {selectedPackage.sceneBreakdowns[0]?.lighting || "Chiaroscuro"}</span>
                  </div>
                </div>

                {/* Workspace content tab header */}
                <div className="px-6 border-b border-slate-800 bg-slate-900/30 flex overflow-x-auto gap-2">
                  {[
                    { id: "dashboard", label: "1. Core & SEO", icon: Compass },
                    { id: "script", label: "2. Script Screenplay", icon: BookOpen },
                    { id: "storyboard", label: "3. Visual Storyboard", icon: Film },
                    { id: "social", label: "4. Social Engagement", icon: Share2 },
                    { id: "graphics", label: "5. Graphics & Sound", icon: Layers }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 border-b-2 font-display text-xs tracking-wider font-bold uppercase flex items-center gap-2 shrink-0 transition duration-150 ${
                          activeTab === tab.id
                            ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main panel view */}
                <div className="p-6 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full flex-1">
                  
                  {activeTab === "dashboard" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {selectedPackage.isFallback && (
                        <div className="p-4 rounded border border-amber-500/20 bg-amber-500/5 relative overflow-hidden space-y-2 shadow-lg">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                          <div className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider font-mono">
                              Pre-Production Engine Enabled (Active API Exception)
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            Your Gemini API key was reported as leaked or blocked by the server, or the API limit was exceeded. To maintain uninterrupted workspace access, HistoryVerse has automatically activated its High-Fidelity Pre-Production Engine to synthesize this complete structured documentary package for you.
                          </p>
                          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 pt-1">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>System exception captured: {selectedPackage.fallbackReason || "PERMISSION_DENIED"}</span>
                            <span>•</span>
                            <span className="text-slate-400">Please provide a valid API key in Settings &gt; Secrets.</span>
                          </div>
                        </div>
                      )}

                      {/* Narration Hook callout (matches core scripting aesthetic) */}
                      <div className="p-6 rounded border border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden space-y-3 shadow-inner">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] font-mono">
                          Documentary Opening Hook (0:00 - 0:20)
                        </div>
                        <p className="text-xl font-serif leading-relaxed text-slate-100 italic">
                          "{selectedPackage.hook.narration}"
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
                          <div>
                            <span className="text-slate-500 block uppercase tracking-wider mb-1 font-bold">Visual Cues</span>
                            <span className="text-slate-200 font-sans">{selectedPackage.hook.visual}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase tracking-wider mb-1 font-bold">Acoustic Layout</span>
                            <span className="text-slate-200 font-sans">{selectedPackage.hook.sound}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Thumbnail ideas list */}
                        <div className="lg:col-span-2 space-y-4">
                          <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-amber-500" />
                            <span>Cinematic Thumbnail Concepts</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedPackage.thumbnailIdeas.map((idea, idx) => (
                              <div key={idx} className="p-4 bg-slate-900/30 border border-slate-800 rounded space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-amber-500 font-bold">CONCEPT #{idx + 1}</span>
                                  <span className="text-[9px] font-mono text-slate-500">READY</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans italic">"{idea}"</p>
                                <button
                                  onClick={() => {
                                    setActiveTab("storyboard");
                                  }}
                                  className="text-[10px] font-mono text-slate-500 hover:text-amber-500 flex items-center gap-1 mt-1 self-start transition"
                                >
                                  <span>Test Render in Storyboard</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SEO Package panel */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Hash className="w-4 h-4 text-amber-500" />
                            <span>Distribution SEO Metadata</span>
                          </h3>
                          <div className="bg-slate-900/40 border border-slate-800 rounded p-5 space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Video Description</span>
                                <button 
                                  onClick={() => copyToClipboard(selectedPackage.seo.description, "seo-desc")}
                                  className="text-slate-500 hover:text-amber-500 transition text-[9px] flex items-center gap-1 font-mono uppercase"
                                >
                                  {copiedKey === "seo-desc" ? <Check className="w-3 text-emerald-500" /> : <Copy className="w-3" />}
                                  <span>{copiedKey === "seo-desc" ? "Copied" : "Copy"}</span>
                                </button>
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                                {selectedPackage.seo.description}
                              </p>
                            </div>

                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Hashtags</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedPackage.seo.hashtags.map((tag) => (
                                  <span key={tag} className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Keywords</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedPackage.seo.keywords.map((kw) => (
                                  <span key={kw} className="text-[10px] font-mono bg-amber-500/5 text-amber-500/80 px-2 py-0.5 rounded border border-amber-500/10">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Chapters (Timestamps)</span>
                              <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 font-mono text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {selectedPackage.seo.chapters.join("\n")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "script" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                        <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-500" />
                          <span>Screenplay Chapter Deck</span>
                        </h3>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowGoogleVidsModal(true)}
                            className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white text-[10px] font-mono flex items-center gap-1.5 transition font-bold shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>Export for Google Vids</span>
                          </button>
                          <span className="text-[10px] font-mono text-slate-500">PRODUCTION STANDARD V2</span>
                        </div>
                      </div>

                      <div className="space-y-6 max-w-4xl mx-auto">
                        {selectedPackage.chapters.map((ch, idx) => (
                          <div key={ch.id} className="bg-slate-900/10 border border-slate-800 rounded overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                  Chapter {idx + 1}
                                </span>
                                <h4 className="font-display font-bold text-sm text-slate-100">
                                  {ch.title}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                {ch.duration}
                              </span>
                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left column: Narration voice */}
                              <div className="lg:col-span-7 space-y-4">
                                <div className="space-y-1.5">
                                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] font-mono">Narration</div>
                                  <p className="text-lg font-serif leading-relaxed text-slate-100 italic">
                                    "{ch.narration}"
                                  </p>
                                </div>

                                {ch.accuracyNotes && (
                                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded text-xs leading-relaxed text-slate-400">
                                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider font-bold block mb-1">Evidence & Verification</span>
                                    {ch.accuracyNotes}
                                  </div>
                                )}
                              </div>

                              {/* Right column: Scene directives */}
                              <div className="lg:col-span-5 space-y-3 p-4 bg-slate-900/80 border border-slate-800 rounded shadow-inner text-xs font-mono">
                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1">Visual Sequence</div>
                                <ul className="space-y-2.5 text-slate-300">
                                  <li className="flex gap-2">
                                    <span className="text-slate-500 shrink-0">•</span>
                                    <span><strong className="text-slate-200">Composition:</strong> {ch.visualDirection}</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <span className="text-slate-500 shrink-0">•</span>
                                    <span><strong className="text-slate-200">Camera:</strong> {ch.cameraMovement}</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <span className="text-slate-500 shrink-0">•</span>
                                    <span><strong className="text-slate-200">Acoustic Mood:</strong> {ch.musicMood}</span>
                                  </li>
                                  {ch.onScreenText && (
                                    <li className="flex flex-col gap-1 pt-1.5 border-t border-slate-800">
                                      <span className="text-[9px] uppercase text-slate-500 tracking-wider">On-Screen overlay</span>
                                      <span className="text-amber-500 font-sans italic">{ch.onScreenText}</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "storyboard" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                        <div>
                          <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Film className="w-4 h-4 text-amber-500" />
                            <span>Cinematic Scenes Storyboard</span>
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowGoogleVidsModal(true)}
                            className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white text-[10px] font-mono flex items-center gap-1.5 transition font-bold shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>Open in Google Vids</span>
                          </button>
                          <span className="text-[10px] font-mono text-slate-500">GOOGLE VEO & IMAGEN 3 ACTIVE</span>
                        </div>
                      </div>

                      {/* On-Screen Diagnostics Console */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded overflow-hidden max-w-4xl mx-auto backdrop-blur-sm shadow-xl shadow-black/40">
                        <div className="bg-slate-900/60 px-4 py-3 flex items-center justify-between border-b border-slate-850 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Cpu className={`w-3.5 h-3.5 ${debugReports.length > 0 ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
                              On-Screen Diagnostics Console
                            </span>
                            {debugReports.length > 0 ? (
                              <span className="bg-rose-500/10 text-rose-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                                {debugReports.length} {debugReports.length === 1 ? "Error" : "Errors"} Logged
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">
                                System Status: Clear
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* Simulation Mode Toggle Pill */}
                            <button
                              onClick={() => setSimulateMode(!simulateMode)}
                              className={`text-[10px] font-mono px-2.5 py-0.5 rounded border transition flex items-center gap-1.5 ${
                                simulateMode 
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" 
                                  : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                              }`}
                              title="Toggle between Live API Generation and High-Fidelity Local Simulation"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${simulateMode ? "bg-amber-400 animate-pulse" : "bg-slate-500"}`} />
                              <span>Simulation: {simulateMode ? "ON" : "OFF"}</span>
                            </button>

                            <button 
                              onClick={fetchDebugReports}
                              className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800/50 transition flex items-center gap-1 border border-transparent hover:border-slate-700"
                              title="Refetch recent server-side error reports"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Sync Logs</span>
                            </button>
                            {debugReports.length > 0 && (
                              <button 
                                onClick={clearDebugReports}
                                className="text-[10px] font-mono text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded hover:bg-rose-950/20 transition flex items-center gap-1 border border-transparent hover:border-rose-900/20"
                                title="Clear error reports history"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Clear History</span>
                              </button>
                            )}
                            <button
                              onClick={() => setShowDiagnostics(!showDiagnostics)}
                              className="text-slate-400 hover:text-amber-400 transition"
                            >
                              <span className="text-[10px] font-mono font-bold bg-slate-800/50 hover:bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                {showDiagnostics ? "Hide [-]" : "Show [+]"}
                              </span>
                            </button>
                          </div>
                        </div>

                        {showDiagnostics && (
                          <div className="p-4 bg-black/60 font-mono text-xs border-t border-slate-900">
                            
                            {/* Server Environment Variables Status */}
                            {keyStatus && (
                              <div className="mb-4 bg-slate-900/50 border border-slate-800 rounded p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-sans">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-slate-400 font-mono text-[10px]">SERVER CONFIG:</span>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {Object.entries(keyStatus.status || {}).map(([keyName, exists]) => (
                                      <span 
                                        key={keyName} 
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                          exists 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold" 
                                            : "bg-slate-950/40 border-slate-800 text-slate-600"
                                        }`}
                                      >
                                        {keyName}: {exists ? "DETECTED" : "NOT SET"}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-850 font-mono text-[10px]">
                                  <span className="text-slate-400">ACTIVE KEY:</span>
                                  <span className="text-amber-400 font-bold bg-amber-950/20 px-1 rounded border border-amber-500/20">
                                    {keyStatus.activeKeySource}
                                  </span>
                                  {keyStatus.activeKeyPreview && keyStatus.activeKeyPreview !== "None" && (
                                    <span className="text-slate-500 text-[9px]">({keyStatus.activeKeyPreview})</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Leaked API Key Warning Banner */}
                            {debugReports.some(r => 
                              String(r.code) === "403" || 
                              (r.error && (
                                r.error.toLowerCase().includes("leaked") || 
                                r.error.toLowerCase().includes("api key") || 
                                r.error.toLowerCase().includes("permission")
                              ))
                            ) && (
                              <div className="mb-4 bg-amber-950/25 border border-amber-500/30 rounded p-4 text-xs font-sans leading-relaxed space-y-2.5">
                                <div className="flex items-center gap-2 text-amber-400 font-bold">
                                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>ACTION REQUIRED: GOOGLE GEMINI API KEY HAS BEEN REVOKED / LEAKED</span>
                                </div>
                                <p className="text-slate-300 text-[11px]">
                                  Google has automatically deactivated your current <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code> because it was flagged as leaked on public repos or shared publicly. To fix this and generate real videos, rotate your API key:
                                </p>
                                <div className="space-y-1.5 bg-black/40 p-3 rounded border border-slate-800 font-mono text-[10px] text-slate-300">
                                  <div className="font-bold text-amber-500 uppercase tracking-wider mb-1">Steps to Rotate Your API Key:</div>
                                  <ol className="list-decimal pl-4 space-y-1">
                                    <li>Open your <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">Google AI Studio Console</a>.</li>
                                    <li>Click <strong>"Get API key"</strong> on the side-panel and generate a new key.</li>
                                    <li>In the top-right corner of this AI Studio preview tab, click the <strong>Settings (Gear) icon</strong>.</li>
                                    <li>Navigate to <strong>"Secrets & API Keys"</strong>, update <code className="text-amber-300 font-bold">GEMINI_API_KEY</code> with your new key, and save.</li>
                                  </ol>
                                </div>
                                <div className="text-[10px] text-slate-400 italic">
                                  💡 <strong>Tip:</strong> Toggle <strong>Simulation: ON</strong> above to test the visual storyboard with high-fidelity pre-rendered loops immediately without a configured key!
                                </div>
                              </div>
                            )}

                            {debugReports.length === 0 ? (
                              <div className="py-5 text-center text-slate-500 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400">● Core Render Thread Online & Standby</span>
                                <p className="text-[9px] text-slate-600 max-w-lg mx-auto">
                                  No Veo 3 rendering errors reported in this session. Server-side stack trace logs, API responses, and exception payloads will stream here automatically upon generation or poll timeout. Try toggling Simulation Mode above if you experience key issues.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 divide-y divide-slate-900">
                                {debugReports.map((report, idx) => (
                                  <div key={report.id || idx} className={`pt-3 ${idx === 0 ? "pt-0" : ""} space-y-1.5`}>
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] text-slate-500">[{new Date(report.timestamp).toLocaleTimeString()}]</span>
                                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                                          report.stage === "start" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                                          report.stage === "poll" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : 
                                          "bg-slate-800 text-slate-400 border border-slate-700"
                                        }`}>
                                          Stage: {report.stage}
                                        </span>
                                        {report.sceneNumber && (
                                          <span className="text-[10px] text-slate-300 font-bold bg-slate-900 border border-slate-850 px-1.5 py-0.2 rounded">Scene #{report.sceneNumber}</span>
                                        )}
                                        {report.code && (
                                          <span className="text-[9px] text-amber-400 border border-amber-500/15 px-1.5 py-0.2 rounded bg-slate-950">Code: {report.code}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-rose-400 font-sans text-xs leading-relaxed break-words bg-rose-950/15 px-3 py-2 rounded border border-rose-500/15">
                                      <strong className="font-mono text-[10px] block text-rose-300 uppercase mb-1">Error Trace:</strong>
                                      {report.error}
                                    </div>
                                    {report.prompt && (
                                      <div className="text-[10px] text-slate-400 pl-2 border-l border-slate-800 italic break-words py-0.5">
                                        Prompt Context: "{report.prompt}"
                                      </div>
                                    )}
                                    {report.details && (
                                      <div className="mt-1 pl-2">
                                        <details className="group">
                                          <summary className="text-[9px] text-slate-500 hover:text-slate-300 cursor-pointer select-none">
                                            [View detailed JSON debug trace & stack]
                                          </summary>
                                          <pre className="mt-1.5 p-2 bg-slate-950 border border-slate-900 rounded text-[9px] text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-40">
                                            {typeof report.details === "object" ? JSON.stringify(report.details, null, 2) : String(report.details)}
                                          </pre>
                                        </details>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-8 max-w-4xl mx-auto">
                        {selectedPackage.sceneBreakdowns.map((scene) => {
                          const assetState = sceneAssets[scene.sceneNumber] || { videoStatus: "idle" };
                          const paletteSwatches = getColorPaletteSwatches(scene.colorPalette);
                          
                          return (
                            <div key={scene.sceneNumber} className="bg-slate-900/20 border border-slate-800 rounded overflow-hidden grid grid-cols-1 lg:grid-cols-12 hover:border-slate-700 transition">
                              
                              {/* Left Side: Monitor screen */}
                              <div className="lg:col-span-5 bg-slate-950 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-800 min-h-[240px] relative">
                                {assetState.videoStatus === "generating" ? (
                                  <div className="text-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                                    <p className="text-[10px] font-mono text-slate-500">Rendering high-fidelity preview frames...</p>
                                  </div>
                                ) : assetState.videoStatus === "done" && (assetState.videoOp || assetState.videoUrl) ? (
                                  <div className="w-full h-full flex flex-col justify-between">
                                    <video 
                                      src={assetState.videoUrl || `/api/video/${encodeURIComponent(assetState.videoOp || "")}`} 
                                      controls 
                                      className="w-full aspect-video rounded border border-slate-800"
                                      poster={assetState.imageUrl}
                                      autoPlay
                                      muted
                                      playsInline
                                      loop
                                    />
                                    <div className="mt-2 flex justify-between items-center text-[9px] font-mono text-slate-500">
                                      <span>VEA-3 Model loop</span>
                                      <span className="text-green-500">RENDER COMPLETE</span>
                                    </div>
                                  </div>
                                ) : assetState.imageUrl ? (
                                  <div className="w-full h-full flex flex-col justify-between">
                                    <img 
                                      src={assetState.imageUrl} 
                                      alt="Generated Concept Frame" 
                                      referrerPolicy="no-referrer"
                                      className="w-full aspect-video rounded object-cover border border-slate-800"
                                    />
                                    <div className="mt-2 flex justify-between items-center text-[9px] font-mono text-slate-500">
                                      <span>IMAGEN-3 Concept</span>
                                      <span className="text-amber-500">FRAME CACHED</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center p-6 space-y-3">
                                    <Film className="w-8 h-8 text-slate-800 mx-auto" />
                                    <p className="text-[10px] text-slate-500 max-w-[180px] leading-relaxed font-mono">
                                      MONITOR SCREEN IDLE. RENDER CINEMATIC ARTIFACTS BELOW.
                                    </p>
                                  </div>
                                )}

                                {assetState.videoStatus === "failed" && (
                                  <div className="absolute inset-0 bg-rose-950/10 flex items-center justify-center p-4">
                                    <div className="bg-slate-900 border border-rose-500/30 p-4 rounded text-center space-y-1">
                                      <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto" />
                                      <span className="text-[10px] font-mono text-rose-400 block font-bold">RENDER FAILED</span>
                                      <p className="text-[9px] text-slate-500">Rate limit or service unavailable. Try rendering again.</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right Side: Scene directives */}
                              <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                                    <div>
                                      <span className="text-[9px] font-mono text-amber-500 font-bold tracking-widest">SCENE #{scene.sceneNumber}</span>
                                      <h4 className="font-display font-bold text-sm text-slate-200 mt-0.5">
                                        {scene.location}
                                      </h4>
                                    </div>
                                    <span className="text-[9px] font-mono bg-slate-850 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                                      {scene.timePeriod}
                                    </span>
                                  </div>

                                  {/* Render beautiful dynamic color palette swatches from theme */}
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-slate-500 block font-mono font-bold uppercase tracking-wider">COLOR PALETTE PREVIEW ({scene.colorPalette})</label>
                                    <div className="flex gap-1 h-6">
                                      {paletteSwatches.map((col, cIdx) => (
                                        <div 
                                          key={cIdx} 
                                          style={{ backgroundColor: col }} 
                                          className="flex-1 rounded-sm border border-slate-950/40" 
                                          title={`Swatch color: ${col}`}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-[11px] font-mono text-slate-400">
                                    <div>
                                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Environment</span>
                                      <span className="text-slate-300">{scene.environment}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Lighting</span>
                                      <span className="text-slate-300">{scene.lighting}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Clothing</span>
                                      <span className="text-slate-300">{scene.clothing}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Lens Properties</span>
                                      <span className="text-slate-300">{scene.lens}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Atmospheric Transition</span>
                                      <span className="text-slate-300">{scene.transition}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Mood Tonality</span>
                                      <span className="text-slate-300">{scene.mood}</span>
                                    </div>
                                  </div>

                                  <div className="pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-sans">
                                    <span className="font-mono text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Action & Foley movements</span>
                                    {scene.cameraMovement}
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                                  <div className="flex-1 min-w-[200px]">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-bold">AI Video Prompt Directives</span>
                                    <input 
                                      type="text" 
                                      defaultValue={scene.videoPrompt}
                                      onChange={(e) => {
                                        scene.videoPrompt = e.target.value;
                                      }}
                                      className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none text-slate-300 focus:border-amber-500 font-mono"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      disabled={assetState.videoStatus === "generating"}
                                      onClick={() => generateSceneImage(scene.sceneNumber, scene.imagePrompt)}
                                      className="px-3.5 py-2 border border-slate-700 hover:border-amber-500 hover:bg-amber-500/5 text-slate-300 text-[11px] font-mono rounded transition active:scale-[0.98] disabled:opacity-40"
                                    >
                                      Render Image
                                    </button>
                                    <button
                                      disabled={assetState.videoStatus === "generating"}
                                      onClick={() => generateSceneVideo(scene.sceneNumber, scene.videoPrompt)}
                                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-mono font-bold rounded transition active:scale-[0.98] disabled:opacity-40 flex items-center gap-1 shadow-md shadow-amber-500/10"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                      <span>Render Video</span>
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "social" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-amber-500" />
                            <span>Social Media Content Kit</span>
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">7 CHANNELS SYNCED</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 border border-slate-800 rounded h-fit lg:col-span-1">
                          {[
                            { id: "shorts", label: "YouTube Shorts" },
                            { id: "reels", label: "Instagram Reels" },
                            { id: "tiktok", label: "TikTok Video" },
                            { id: "facebook", label: "Facebook Posts" },
                            { id: "x", label: "X / Twitter" },
                            { id: "threads", label: "Threads App" },
                            { id: "linkedin", label: "LinkedIn Article" }
                          ].map((platform) => (
                            <button
                              key={platform.id}
                              onClick={() => setActiveSocialTab(platform.id as any)}
                              className={`w-full text-left px-3 py-2 rounded text-[11px] font-mono transition ${
                                activeSocialTab === platform.id
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                  : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {platform.label}
                            </button>
                          ))}
                        </div>

                        <div className="lg:col-span-3 space-y-4">
                          <div className="bg-slate-900/40 border border-slate-800 rounded p-6 min-h-[300px] flex flex-col justify-between space-y-4">
                            
                            <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider">
                                  {activeSocialTab.toUpperCase()} COPYBLOCK DECK
                                </span>
                                <button
                                  onClick={() => {
                                    const textToCopy = getSocialContentList().join("\n\n");
                                    copyToClipboard(textToCopy, `social-${activeSocialTab}`);
                                  }}
                                  className="px-3 py-1.5 border border-slate-700 hover:border-amber-500 hover:text-amber-500 rounded bg-slate-950 text-[10px] font-mono transition flex items-center gap-1.5 font-bold uppercase"
                                >
                                  {copiedKey === `social-${activeSocialTab}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      <span className="text-emerald-500">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Deck</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="space-y-4">
                                {getSocialContentList().map((item, idx) => (
                                  <div key={idx} className="bg-slate-950/40 p-4 border border-slate-800 rounded relative group">
                                    <span className="text-[9px] font-mono text-slate-500 absolute top-2.5 right-3 font-bold">BLOCK #0{idx + 1}</span>
                                    <p className="text-xs text-slate-300 leading-relaxed font-sans pr-8 whitespace-pre-line">
                                      {item}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-amber-500/5 p-3 rounded border border-amber-500/10">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              <p>
                                Automated copy decks are pre-optimized with semantic hooks, visual transitions, and high-pacing layouts direct to algorithmic timelines.
                              </p>
                            </div>

                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "graphics" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        
                        {/* Interactive visual Timelines / Diagrams */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4 text-amber-500" />
                            <span>Animated Timelines & Infographics</span>
                          </h3>
                          <div className="space-y-4">
                            {selectedPackage.timelineGraphics.map((item, idx) => (
                              <div key={idx} className="p-5 rounded border border-slate-800 bg-slate-900/10 relative overflow-hidden">
                                <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
                                <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                                  <span className="text-xs font-mono font-bold text-amber-500">
                                    {item.time}
                                  </span>
                                  <span className="text-[9px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">
                                    INFOGRAPHIC #{idx + 1}
                                  </span>
                                </div>
                                <h4 className="font-display font-bold text-xs text-slate-200 mb-1 uppercase tracking-wide">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                  <strong>Visual mapping direction:</strong> {item.mapOrDiagram}
                                </p>
                                {item.comparison && (
                                  <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2.5 bg-slate-950/45 p-2 rounded border border-slate-800/60 italic">
                                    <strong>Scale comparison analogy:</strong> {item.comparison}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sound Design blueprint details */}
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-amber-500" />
                              <span>Educational Dialogues & Scholarly Debates</span>
                            </h3>
                            <div className="space-y-3.5">
                              {selectedPackage.educationalCallouts.map((item, idx) => (
                                <div key={idx} className="bg-slate-900/30 border border-slate-800 p-5 rounded space-y-2">
                                  <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded font-bold uppercase tracking-wide">
                                    {item.type}
                                  </span>
                                  <h4 className="font-display font-bold text-xs text-slate-200 uppercase tracking-wide">{item.title}</h4>
                                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-amber-500" />
                              <span>Acoustic & Foley Layout</span>
                            </h3>
                            <div className="bg-slate-900/40 border border-slate-800 rounded p-5 space-y-4 text-xs font-mono">
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Ambient soundscapes</span>
                                <span className="text-slate-300 font-sans block mt-0.5">{selectedPackage.soundDesign.ambient}</span>
                              </div>
                              <div className="pt-2 border-t border-slate-800">
                                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Soundtrack background score</span>
                                <span className="text-slate-300 font-sans block mt-0.5">{selectedPackage.soundDesign.backgroundMusic}</span>
                              </div>
                              <div className="pt-2 border-t border-slate-800">
                                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Foley layout</span>
                                <span className="text-slate-300 font-sans block mt-0.5">{selectedPackage.soundDesign.foley}</span>
                              </div>
                              <div className="pt-2 border-t border-slate-800">
                                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Narrator delivery pacing</span>
                                <span className="text-slate-300 font-sans block mt-0.5">{selectedPackage.soundDesign.pacing}</span>
                              </div>
                              <div className="pt-2 border-t border-slate-800">
                                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Key dramatic silences</span>
                                <span className="text-slate-300 font-sans block mt-0.5">{selectedPackage.soundDesign.silenceMoments}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Ending Sequence Panel */}
                      <div className="p-6 bg-amber-500/5 rounded border border-amber-500/10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="md:col-span-2 space-y-2">
                          <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-widest block">Documentary Ending Conclusion</span>
                          <h4 className="font-display font-bold text-xs text-slate-100 uppercase tracking-wide">Takeaway Narrative</h4>
                          <p className="text-xs text-slate-300 italic leading-relaxed font-serif">
                            "{selectedPackage.ending.conclusion}"
                          </p>
                        </div>
                        <div className="bg-slate-950/40 p-4 rounded border border-slate-850 flex flex-col justify-between space-y-3 text-xs">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Resonant Takeaway</span>
                            <p className="text-slate-300 font-sans mt-1 leading-relaxed">{selectedPackage.ending.takeaway}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-800">
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Audience engagement call</span>
                            <p className="text-amber-400 font-sans italic mt-1 font-semibold">"{selectedPackage.ending.engagementQuestion}"</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>
              </div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Google Vids Studio & Exporter Modal */}
      {showGoogleVidsModal && selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-950/80 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Google Vids Workflow & Exporter</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">Workspace Guide</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Convert storyboard & screenplay into Google Vids</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGoogleVidsModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto font-sans text-xs">
              {/* Architecture Clarification Banner */}
              <div className="bg-blue-950/20 border border-blue-500/30 rounded p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold font-mono text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Google Vids vs Google Veo Explained</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Google Vids</strong> (<code className="text-blue-300 font-mono text-[10px]">vids.google.com</code>) is Google Workspace's collaborative video creator for presentations, slide timelines, and AI avatars. Google does <em>not</em> provide an open public API for third-party programs to trigger video rendering inside Google Vids.
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Google's official developer API for generative video is <strong>Google Veo</strong>, which is already integrated in our Storyboard tab. To produce this video inside Google Vids, use the 3-step bridge below:
                </p>
              </div>

              {/* 3 Step Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  <span className="text-amber-500 font-mono font-bold block mb-1">STEP 1</span>
                  <span className="text-slate-200 font-semibold block">Copy Vids Prompt</span>
                  <p className="text-slate-400 text-[10px] mt-0.5">Copies the pre-formatted structured documentary script & cues.</p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  <span className="text-blue-400 font-mono font-bold block mb-1">STEP 2</span>
                  <span className="text-slate-200 font-semibold block">Open Google Vids</span>
                  <p className="text-slate-400 text-[10px] mt-0.5">Launches vids.google.com with your Workspace or Google account.</p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  <span className="text-emerald-400 font-mono font-bold block mb-1">STEP 3</span>
                  <span className="text-slate-200 font-semibold block">Paste & Generate</span>
                  <p className="text-slate-400 text-[10px] mt-0.5">Click "Help me create", paste the prompt, and select your AI voice!</p>
                </div>
              </div>

              {/* Formatted Script Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                    Formatted Google Vids Prompt ({selectedPackage.sceneBreakdowns.length} Scenes)
                  </span>
                  <button
                    onClick={() => copyToClipboard(generateGoogleVidsPrompt(selectedPackage), "vids-modal-copy")}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiedKey === "vids-modal-copy" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={generateGoogleVidsPrompt(selectedPackage)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[10px] text-slate-300 leading-relaxed resize-none focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-950/80 px-5 py-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => setShowGoogleVidsModal(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-mono transition"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(generateGoogleVidsPrompt(selectedPackage), "vids-modal-copy-btn")}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition"
                >
                  {copiedKey === "vids-modal-copy-btn" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Vids Prompt</span>
                    </>
                  )}
                </button>
                <a
                  href="https://vids.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded flex items-center gap-1.5 transition shadow-lg shadow-blue-600/30"
                >
                  <span>Launch Google Vids</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bar: Status Indicators */}
      <footer className="h-8 border-t border-slate-800 bg-slate-900 flex items-center px-4 justify-between text-[10px] text-slate-500 font-mono uppercase shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 
            Assets Synced
          </span>
          <span>Production: Active</span>
        </div>
        <div className="hidden sm:block">
          PROJECT ID: HV-2026-0012 // SESSION: ACTIVE
        </div>
      </footer>
    </div>
  );

  // Helper function to return active social media array
  function getSocialContentList(): string[] {
    if (!selectedPackage) return [];
    switch (activeSocialTab) {
      case "shorts": return selectedPackage.socialMedia.youtubeShorts;
      case "reels": return selectedPackage.socialMedia.instagramReels;
      case "tiktok": return selectedPackage.socialMedia.tikTok;
      case "facebook": return selectedPackage.socialMedia.facebook;
      case "x": return selectedPackage.socialMedia.xPosts;
      case "threads": return selectedPackage.socialMedia.threads;
      case "linkedin": return selectedPackage.socialMedia.linkedIn;
      default: return [];
    }
  }
}
