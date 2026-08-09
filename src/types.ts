export interface Hook {
  narration: string;
  visual: string;
  sound: string;
}

export interface Chapter {
  id: string;
  title: string;
  narration: string;
  visualDirection: string;
  musicMood: string;
  cameraMovement: string;
  onScreenText: string;
  accuracyNotes?: string;
  duration: string;
}

export interface SceneBreakdown {
  sceneNumber: number;
  location: string;
  timePeriod: string;
  environment: string;
  lighting: string;
  characters: string;
  clothing: string;
  props: string;
  colorPalette: string;
  lens: string;
  cameraMovement: string;
  mood: string;
  vfx: string;
  transition: string;
  imagePrompt: string;
  videoPrompt: string;
  // Client side transient states for Veo 3 / Imagen 3 generations
  generatedImageUrl?: string;
  generatedVideoOp?: string;
  generatedVideoStatus?: "idle" | "generating" | "done" | "failed";
}

export interface SoundDesign {
  ambient: string;
  backgroundMusic: string;
  foley: string;
  pacing: string;
  silenceMoments: string;
}

export interface TimelineGraphic {
  time: string;
  title: string;
  mapOrDiagram: string;
  comparison: string;
}

export interface EducationalCallout {
  type: string; // e.g., Myth vs Fact, Scientific Evidence, Historical Debate
  title: string;
  content: string;
}

export interface Ending {
  conclusion: string;
  takeaway: string;
  engagementQuestion: string;
}

export interface SocialMediaPackage {
  youtubeShorts: string[];
  instagramReels: string[];
  tikTok: string[];
  facebook: string[];
  xPosts: string[];
  threads: string[];
  linkedIn: string[];
}

export interface SEOPackage {
  description: string;
  keywords: string[];
  hashtags: string[];
  chapters: string[];
  metadata: string;
  searchTags: string[];
}

export interface DocumentaryPackage {
  id: string;
  topic: string;
  timestamp: string;
  title: string;
  thumbnailIdeas: string[];
  hook: Hook;
  chapters: Chapter[];
  sceneBreakdowns: SceneBreakdown[];
  soundDesign: SoundDesign;
  timelineGraphics: TimelineGraphic[];
  educationalCallouts: EducationalCallout[];
  ending: Ending;
  callToAction: string;
  socialMedia: SocialMediaPackage;
  seo: SEOPackage;
  isFallback?: boolean;
  fallbackReason?: string;
}
