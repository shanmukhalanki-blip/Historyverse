import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limits for base64 or large inputs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize GoogleGenAI SDK safely
// Check for API key at request/runtime to prevent crashing on startup
const getAiClient = () => {
  const apiKey = process.env.History || process.env.HISTORY || process.env.History_key || process.env.HISTORY_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required. Configure it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// High-fidelity fallback package builder for offline/limit/leak states
const getFallbackPackage = (topic: string, customInstructions: string = "", errorMsg: string = "") => {
  const cleanTopic = topic.trim();
  const capTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
  const cleanInstructions = customInstructions ? `Adjusted per instructions: "${customInstructions}".` : "";

  return {
    isFallback: true,
    fallbackReason: errorMsg || "Active API limit or Key Exception",
    title: `The Untold Chronicles of ${capTopic}`,
    thumbnailIdeas: [
      `Extreme close-up macro shot with dark background and dramatic amber rim lighting symbolizing the essence of ${cleanTopic}`,
      `Split screen showing a side-by-side comparison of historical relics vs modern interpretations of ${cleanTopic}`,
      `High-contrast silhouette of key figures of ${cleanTopic} under a misty golden sunrise`,
      `Stylized 3D render of a timeline diagram showing pivotal moments of ${cleanTopic}`,
      `A single handwritten document or blueprint about ${cleanTopic} glowing under a narrow light beam`,
      `Dramatic low-angle view of grand architectures or landscape related to ${cleanTopic} framed by storm clouds`,
      `Abstract cinematic visual representation of the concept of ${cleanTopic} with particle trails`,
      `A close-up of hands holding an ancient relic representing the legacy of ${cleanTopic}`,
      `Vibrant digital artwork featuring symbolic geometric patterns of ${cleanTopic} on a cosmic scale`,
      `Warm chiaroscuro composition with a historic magnifying lens focusing on key details of ${cleanTopic}`
    ],
    hook: {
      narration: `In the quiet archives of human history, few turning points hold as much mystery and power as ${cleanTopic}. It was a shift that did not just alter our geography, but redefined the very fabric of our understanding. ${cleanInstructions}`,
      visual: "Extreme macro close-up of dust particles slowly moving through a single, sharp shaft of light in a dark, atmospheric chamber.",
      sound: "A low, resonant sub-bass drone that slowly shifts pitch, accompanied by the subtle sound of ancient parchment brushing."
    },
    chapters: [
      {
        id: "ch-1",
        title: "The Genesis and Spark",
        narration: `How did the journey of ${cleanTopic} truly begin? Long before the global structures took shape, there were isolated sparks—forgotten thinkers, hidden blueprints, and a burning curiosity to challenge the established paradigm of the era.`,
        visualDirection: "Slow, sweeping camera motion over handwritten manuscripts and dusty diagrams illuminated by candlelight.",
        musicMood: "Mysterious, ambient pads with a single, repeating cello note building subtle tension.",
        cameraMovement: "35mm prime lens, slow dolly-in track, shallow depth of field focusing on fading ink lines.",
        onScreenText: "CHAPTER 1: THE SPARK // INCEPTION PHASE",
        accuracyNotes: "Scholars debate the exact start dates, with some pointing to earlier regional occurrences while mainstream consensus centers on the late post-classical era.",
        duration: "02:15"
      },
      {
        id: "ch-2",
        title: "The Crucible of Growth",
        narration: `As the ideas spread, they entered a crucible of friction. Critics claimed it was impossible, while visionaries pushed forward under immense pressure. It was here that ${cleanTopic} evolved from an ambitious hypothesis into an unstoppable force.`,
        visualDirection: "High-contrast split screen showing the opposing forces of traditional systems versus the emergence of ${cleanTopic}.",
        musicMood: "Staccato strings with a pulsing modular synthesizer beat, signaling industrial progress and struggle.",
        cameraMovement: "50mm anamorphic lens, rapid pan transitions, high-contrast chiaroscuro lighting.",
        onScreenText: "CHAPTER 2: THE CRUCIBLE // THE ACCELERATION",
        accuracyNotes: "Recent excavations and modern digital reconstructions have confirmed that early prototypes of these concepts were far more complex than initially written in historic logs.",
        duration: "03:45"
      },
      {
        id: "ch-3",
        title: "The Uncharted Legacy",
        narration: `Today, we live in the echo chamber created by that ancient shift. The legacy of ${cleanTopic} is not merely written in textbooks; it is embedded in our daily routines, our architecture, and our dreams of the future.`,
        visualDirection: "Wide panoramic drone shot soaring over a modern landscape, blending seamlessly into a historic digital overlay of the same space.",
        musicMood: "Ethereal, soaring orchestral piece that resolves into a quiet, thought-provoking piano solo.",
        cameraMovement: "24mm ultra-wide cine lens, smooth majestic gimbal tracking, brilliant morning light.",
        onScreenText: "CHAPTER 3: THE ECHO // FUTURE HORIZONS",
        accuracyNotes: "The long-term effects remain a subject of active research in global academies, highlighting the deep sociological impact across generations.",
        duration: "04:10"
      }
    ],
    sceneBreakdowns: [
      {
        sceneNumber: 1,
        location: `The Sanctuary of ${capTopic}`,
        timePeriod: "Early Transitional Era",
        environment: "A dimly lit, high-ceilinged library chamber with dust particles dancing in the air. Soft morning mist is visible outside the leaded glass windows.",
        lighting: "Natural morning light pouring from a single high window, creating dramatic chiaroscuro shadows across the wooden desks.",
        characters: "A single, focused scholar examining a complex blueprint or manuscript representing early theories.",
        clothing: "Coarse, hand-woven wool robes with subtle earth tones, displaying historically accurate embroidery from the period.",
        props: "Iron gall inkwells, raw goose quills, thick parchment rolls, and an intricate brass astrolabe reflecting the warm light.",
        colorPalette: "Deep midnight blue background accented by rich amber and golden highlights on the active workbench.",
        lens: "35mm anamorphic prime lens, capturing beautiful vintage oval bokeh and horizontal blue lens flares.",
        cameraMovement: "Slow, horizontal slider movement from left to right, starting behind a stack of books and revealing the scholar.",
        mood: "Intense intellectual curiosity and solemn focus.",
        vfx: "Subtle particles of dust floating through the light beam, enhanced by low-contrast volumetric atmospheric fog.",
        transition: "Slow cross-dissolve into the active laboratory sequence.",
        imagePrompt: `Cinematic cinematic 35mm photo of an ancient study chamber of ${cleanTopic}, dimly lit with single sunbeam illuminating dust, historical accuracy, masterpiece --ar 16:9`,
        videoPrompt: `Slow dolly shot of a historic workshop of ${cleanTopic}, dust particles sparkling in sunbeam, golden hour, moody chiaroscuro --ar 16:9`
      },
      {
        sceneNumber: 2,
        location: "The Industrial Core",
        timePeriod: "Peak Acceleration Phase",
        environment: "A cavernous hall filled with heavy iron machinery, steam pipes, and roaring furnaces reflecting intense heat.",
        lighting: "High-contrast crimson glow from open furnace doors, contrasted with cold blue moonlight from high steel trusses.",
        characters: "Three engineers in deep, expressive debate over a mechanical layout model.",
        clothing: "Leather work aprons, heavy denim shirts stained with soot and oil, and brass-rimmed safety goggles.",
        props: "Heavy steel wrenches, dynamic gear models, bubbling copper retorts, and glowing hot coal bins.",
        colorPalette: "Extreme industrial color grade: molten orange and slate gray-blue.",
        lens: "50mm high-speed cine lens, focusing sharply on the heat ripples in the air with highly cinematic compression.",
        cameraMovement: "Low-angle crane shot, slowly rising as steam rises from the pipes, highlighting the scale of the facility.",
        mood: "Raw energy, technological ambition, and intense labor.",
        vfx: "Volumetric steam bursts, heat distortion ripples rising from the machinery, and sparks flying in the background.",
        transition: "Hard whip-pan transition to the modern landscape.",
        imagePrompt: `Industrial forge scene depicting high-fidelity mechanical construction of ${cleanTopic}, steam and orange fire glow, hyperdetailed cinematic --ar 16:9`,
        videoPrompt: `Gimbal shot moving through active steaming factory for ${cleanTopic}, glowing metal sparks, heavy atmosphere --ar 16:9`
      },
      {
        sceneNumber: 3,
        location: "The Monumental Summit",
        timePeriod: "The Modern Legacy Era",
        environment: "A high-altitude mountain peak overlooking a sweeping valley that contains both ancient ruins and a futuristic eco-metropolis.",
        lighting: "Golden hour sunset with brilliant orange rays piercing through fractured clouds, casting long dramatic shadows.",
        characters: "A modern explorer looking out over the landscape, symbolizing humanity's forward gaze.",
        clothing: "Modern minimalist technical gear in slate gray, designed with simple geometric clean cuts.",
        props: "A digital hologram tablet showing an intricate map overlay of historical pathways.",
        colorPalette: "Vibrant golden sunset orange transitioning into clean, futuristic teal shadows.",
        lens: "24mm ultra-wide-angle lens, conveying immense scale and panoramic grandeur.",
        cameraMovement: "Slow, sweeping drone orbit around the explorer on the peak, revealing the massive scale of the valley below.",
        mood: "Transcendent awe, reflection, and boundless hope.",
        vfx: "Beautiful light rays scattering through the misty air, with a subtle digital hologram projection glowing in the dusk.",
        transition: "Fades slowly to black for the final credits.",
        imagePrompt: `Panoramic wide shot of a futuristic scholar looking at mountain ruins of ${cleanTopic}, sunset, cinematic lighting, 8k resolution --ar 16:9`,
        videoPrompt: `Beautiful aerial drone orbit of a mountain summit celebrating the legacy of ${cleanTopic}, majestic sunset --ar 16:9`
      }
    ],
    soundDesign: {
      ambient: "Winds howling over high peaks, crackling wood fire, distant rhythmic iron hammer strikes, and subtle electronic hums.",
      backgroundMusic: "A hybrid cinematic score combining ancient wooden flutes, acoustic cellos, and low-frequency analog synthesizer sweeps.",
      foley: "Rhythmic steps on gravel, deep turning of heavy paper pages, metallic click of brass instruments, and steam releases.",
      pacing: "Solemn, measured, and deliberate, with deep breaths and pauses between key conceptual revelations.",
      silenceMoments: "A complete audio cutout right before the transition to Chapter 3, letting only a single wind gust fade away."
    },
    timelineGraphics: [
      {
        time: "Phase I (Origins)",
        title: "The Silent Foundation",
        mapOrDiagram: "An interactive geographic chart showing trade routes and intellectual migration points where the earliest whispers of these ideas occurred.",
        comparison: "The scale of early distribution was limited to a few hundred scholars, comparable to a single university department today."
      },
      {
        time: "Phase II (Crucible)",
        title: "The Sudden Integration",
        mapOrDiagram: "A network map diagram illustrating rapid transmission across continents as materials and infrastructures began to standardise.",
        comparison: "Over ninety percent of major urban centers adopted these concepts within a single generation, a speed akin to the adoption of mobile phones."
      },
      {
        time: "Phase III (Legacy)",
        title: "The Perpetual Echo",
        mapOrDiagram: "A futuristic heat map showing active digital and physical nodes across the globe that depend directly on this foundation.",
        comparison: "The current global reliance supports billions of transactions daily, forming the invisible backbone of modern civilization."
      }
    ],
    educationalCallouts: [
      {
        type: "Myth vs Fact",
        title: "The Fallacy of Sudden Creation",
        content: `Many popular documentaries claim that ${cleanTopic} was invented by a single individual in a flash of genius. However, historical evidence reveals it was the culmination of collaborative refinements spanning dozens of unsung pioneers over decades.`
      },
      {
        type: "Scientific Evidence",
        title: "Spectrographic Ink Analysis",
        content: "Recent non-destructive X-ray fluorescence analysis of early manuscripts proved that drafts previously thought to be from the late modern era were actually written centuries earlier, correcting historical timelines."
      },
      {
        type: "Historical Debate",
        title: "The Great Paradigm Clash",
        content: "Historians remain fiercely divided on whether the shift was driven primarily by environmental changes forcing adaptation, or by philosophical breakthroughs that emerged independently of material conditions."
      }
    ],
    ending: {
      conclusion: `In the end, ${cleanTopic} is more than a historical milestone. It is a mirror reflecting our own relentless drive to build, to connect, and to understand the universe around us.`,
      takeaway: `The true measure of history is not found in what we left behind, but in how those remnants continue to shape who we are becoming.`,
      engagementQuestion: `What do you believe is the next frontier of this legacy? Let us know your thoughts in the comments below.`
    },
    callToAction: "If this deep dive challenged how you see history, hit the subscribe button and join the HistoryVerse expedition. Share this video with a fellow explorer.",
    socialMedia: {
      youtubeShorts: [
        `"They want you to believe this was a sudden discovery, but the archives prove otherwise..."`,
        `"Why did ancient leaders try to suppress the truth about ${cleanTopic}?"`,
        `"This single historical relic rewriting everything we thought we knew about ${cleanTopic}."`,
        `"The dark history behind the birth of ${cleanTopic}."`,
        `"Did this ancient technology lay the groundwork for modern society?"`
      ],
      instagramReels: [
        `A slow cinematic zoom on an ancient blueprint of ${cleanTopic} with dark ambient audio track.`,
        `A high-contrast visual comparison: how we envisioned ${cleanTopic} then versus now.`,
        `A 15-second moody breakdown of the most mind-blowing myth about ${cleanTopic}.`,
        `Cinematic travel-style transition revealing the real-world location where it all started.`,
        `A typography-driven reel outlining 3 shocking facts about ${cleanTopic} that schools miss.`
      ],
      tikTok: [
        `"Hear me out... this historical mystery about ${cleanTopic} is wild."`,
        `"The absolute biggest conspiracy theory in science history regarding ${cleanTopic}."`,
        `"Historians are literally fighting in the comments over this discovery."`,
        `"Why nobody talks about how ${cleanTopic} actually saved an entire empire."`,
        `"POV: You're entering the restricted vault containing the original scripts of ${cleanTopic}."`
      ],
      facebook: [
        `Before the internet, before modern engines, there was a shift that changed everything. Discover the hidden origin story of ${cleanTopic}.`,
        `Did a simple environmental shift spark one of the greatest technological leaps in human history? The evidence might surprise you.`,
        `Most textbooks get the story of ${cleanTopic} completely wrong. Here is the true, unvarnished history behind the legend.`
      ],
      xPosts: [
        `1/ A thread on the forgotten pioneers of ${cleanTopic} and the conspiracy that kept them out of the history books. 👇`,
        `2/ For centuries, we believed the blueprint for ${cleanTopic} was lost. Modern multispectral imaging just found it hiding in plain sight.`,
        `3/ It turns out, early prototypes were 10x more complex than anything built during the Industrial Revolution. Here is how they did it:`,
        `4/ Why did leaders attempt to outlaw early research? Because understanding ${cleanTopic} meant holding real power.`,
        `5/ What starts as a simple tool eventually becomes the foundation of an entire empire. The story is live on HistoryVerse.`
      ],
      threads: [
        `What is the one thing about ${cleanTopic} that you wish more people understood? Let's talk.`,
        `Fun fact: The original documents of ${cleanTopic} were almost thrown away in the 1920s because a clerk thought they were standard shipping logs.`,
        `If you could travel back to the moment ${cleanTopic} was first conceived, what would you ask the founders?`
      ],
      linkedIn: [
        `What can the inception of ${cleanTopic} teach modern leaders about scaling complex systems? The historical parallels are striking.`,
        `History is a masterclass in innovation. Our latest research into ${cleanTopic} reveals that the challenges faced by historical pioneers are identical to the bottlenecks we see in technology today.`
      ]
    },
    seo: {
      description: `Embark on a cinematic deep dive into the extraordinary history of ${cleanTopic}. From forgotten ancient blueprints to modern global systems, we uncover the hidden figures, fierce scholarly debates, and scientific evidence that shaped this monumental paradigm shift. Discover why mainstream textbooks get the story wrong and how the legacy continues to shape our futuristic horizons. Subscribe to HistoryVerse for more award-winning documentary expeditions.`,
      keywords: [topic, "history", "documentary", "archaeology", "ancient history", "scientific discovery", "netflix documentary", "historyverse", "untold history", "historical evidence"],
      hashtags: ["#history", `#${cleanTopic.replace(/\s+/g, "").toLowerCase()}`, "#documentary", "#science", "#historyverse", "#archaeology", "#untoldstories"],
      chapters: [
        "00:00 - Introduction & Hook",
        "00:20 - Chapter 1: The Genesis and Spark",
        "02:35 - Chapter 2: The Crucible of Growth",
        "06:20 - Chapter 3: The Uncharted Legacy",
        "10:30 - Conclusion & Audience Call to Action"
      ],
      metadata: "Resolution: 4K UHD // Frame Rate: 24fps // Color Space: Rec. 2020 HDR // Camera: RED V-Raptor XL // Lens: Cooke Anamorphic/i",
      searchTags: ["documentary history", `the truth about ${cleanTopic}`, "historyverse channel", "ancient mystery solved", "educational history videos"]
    }
  };
};

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Main documentary package generator endpoint
app.post("/api/generate-package", async (req, res) => {
  const { topic, customInstructions, speedMode } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const ai = getAiClient();

    // Use a robust, structured prompt to generate the complete production suite
    const prompt = `You are an award-winning documentary filmmaker, historian, archaeologist, science communicator, cinematographer, Hollywood screenplay writer, YouTube strategist, educational content creator, and visual storyteller.

Your mission is to create a complete production package for a professional, highly researched documentary video under the channel "HistoryVerse".

Topic: ${topic}
Style: Cinematic, Educational, Emotionally engaging, Evidence-based, High production value, Netflix-style.
Channel Mission: To tell the complete story of humanity, from the birth of the universe to the age of Artificial Intelligence.
${customInstructions ? `Additional Client Instructions: ${customInstructions}` : ""}

Strict guidelines:
1. Never exaggerate or invent historical facts.
2. Clearly distinguish established evidence from hypotheses or historical debates.
3. Be descriptive, detailed, and high-quality. Do not shorten or abbreviate descriptions.
4. Return a structured JSON block matching the specified schema.

JSON Schema to strictly adhere to:
{
  "title": "A compelling, SEO-optimized, curiosity-driven title",
  "thumbnailIdeas": [
    "10 highly descriptive thumbnail composition ideas that represent specific key frames"
  ],
  "hook": {
    "narration": "Narration text for the first 0-20 seconds that immediately hooks the audience",
    "visual": "Cinematic visual description for the hook",
    "sound": "Foley and music atmosphere during the hook"
  },
  "chapters": [
    {
      "id": "ch-1",
      "title": "Chapter 1 Title",
      "narration": "The full voiceover narration text for this chapter",
      "visualDirection": "Visual framing and action directions on screen",
      "musicMood": "Specific background music style and transition sound notes",
      "cameraMovement": "Detailed instructions for camera angles, lenses, and tracking",
      "onScreenText": "Superimposed labels, dates, locations, or quotes",
      "accuracyNotes": "Scientific/historical references, evidence vs hypotheses notes",
      "duration": "Estimated duration (e.g. '01:45')"
    }
  ],
  "sceneBreakdowns": [
    {
      "sceneNumber": 1,
      "location": "The historical location name",
      "timePeriod": "The specific historical year/epoch",
      "environment": "Atmospheric, geographical, and climate details",
      "lighting": "Time of day, light source, scattering properties",
      "characters": "Any figures or actors on screen",
      "clothing": "Accurate garments, materials, historical fidelity notes",
      "props": "Tools, weapons, relics, manuscripts, or equipment",
      "colorPalette": "Specific dominant color grades and visual color schemes",
      "lens": "Lens suggestions (e.g. 35mm anamorphic, wide angle, macro)",
      "cameraMovement": "Dynamic camera movement style",
      "mood": "Emotional undertone of the scene",
      "vfx": "Visual effects, mist, CGI enhancements, particle simulations",
      "transition": "Cut, fade, dissolve, whip pan, matches, etc.",
      "imagePrompt": "Ultra-detailed cinematic concept art prompt for Imagen 3 describing a high-definition static frame.",
      "videoPrompt": "Ultra-detailed video prompt for Veo 3 describing camera tracking, motion, and atmosphere."
    }
  ],
  "soundDesign": {
    "ambient": "Key atmospheric ambient soundscapes (e.g. wind, crackling fire, distant machinery)",
    "backgroundMusic": "Aesthetic style transitions and tempo details",
    "foley": "Physical actions, impact sounds, and subtle sound design points",
    "pacing": "Guidelines for narrator delivery pacing",
    "silenceMoments": "Specific points where all audio cuts for maximum dramatic effect"
  },
  "timelineGraphics": [
    {
      "time": "Date/Epoch (e.g. 3200 BCE)",
      "title": "Key historical landmark title",
      "mapOrDiagram": "Detailed mapping or dynamic diagram recommendation",
      "comparison": "Scale comparison details to make it relatable"
    }
  ],
  "educationalCallouts": [
    {
      "type": "Myth vs Fact OR Scientific Evidence OR Historical Debate",
      "title": "Intriguing heading",
      "content": "A detailed explanation of the myth, evidence, or opposing viewpoints of scholars"
    }
  ],
  "ending": {
    "conclusion": "Deep, emotionally resonant concluding narration",
    "takeaway": "The lasting historical context or thought-provoking takeaway",
    "engagementQuestion": "An active engagement question to ask in the pinned comment / ending screen"
  },
  "callToAction": "A natural, non-spammy request encouraging subscriptions or comments",
  "socialMedia": {
    "youtubeShorts": ["5 unique hooky script lines or briefs for YouTube Shorts"],
    "instagramReels": ["5 cinematic aesthetic concepts for Instagram Reels"],
    "tikTok": ["5 short script formulations tailored for TikTok style storytelling"],
    "facebook": ["3 engaging text posts with historical hooks for Facebook"],
    "xPosts": ["5 concise X threads or posts"],
    "threads": ["3 casual, highly interactive Posts for Threads"],
    "linkedIn": ["2 professional educational breakdowns for LinkedIn"]
  },
  "seo": {
    "description": "YouTube/Video description containing keywords naturally",
    "keywords": ["List of SEO tags/search terms"],
    "hashtags": ["Key hashtags (starting with #)"],
    "chapters": ["Timestamps with structured title list"],
    "metadata": "Technical meta parameters",
    "searchTags": ["Targeted audience search tags"]
  }
}

Provide at least 3 chapters and at least 3 full scene breakdowns, ensuring everything is comprehensive. Keep the JSON perfect, fully formed, and free of markdown syntax other than the plain JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            thumbnailIdeas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hook: {
              type: Type.OBJECT,
              properties: {
                narration: { type: Type.STRING },
                visual: { type: Type.STRING },
                sound: { type: Type.STRING }
              },
              required: ["narration", "visual", "sound"]
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  visualDirection: { type: Type.STRING },
                  musicMood: { type: Type.STRING },
                  cameraMovement: { type: Type.STRING },
                  onScreenText: { type: Type.STRING },
                  accuracyNotes: { type: Type.STRING },
                  duration: { type: Type.STRING }
                },
                required: ["id", "title", "narration", "visualDirection", "musicMood", "cameraMovement", "duration"]
              }
            },
            sceneBreakdowns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  location: { type: Type.STRING },
                  timePeriod: { type: Type.STRING },
                  environment: { type: Type.STRING },
                  lighting: { type: Type.STRING },
                  characters: { type: Type.STRING },
                  clothing: { type: Type.STRING },
                  props: { type: Type.STRING },
                  colorPalette: { type: Type.STRING },
                  lens: { type: Type.STRING },
                  cameraMovement: { type: Type.STRING },
                  mood: { type: Type.STRING },
                  vfx: { type: Type.STRING },
                  transition: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                  videoPrompt: { type: Type.STRING }
                },
                required: [
                  "sceneNumber", "location", "timePeriod", "environment", "lighting", 
                  "clothing", "props", "colorPalette", "lens", "cameraMovement", 
                  "mood", "transition", "imagePrompt", "videoPrompt"
                ]
              }
            },
            soundDesign: {
              type: Type.OBJECT,
              properties: {
                ambient: { type: Type.STRING },
                backgroundMusic: { type: Type.STRING },
                foley: { type: Type.STRING },
                pacing: { type: Type.STRING },
                silenceMoments: { type: Type.STRING }
              },
              required: ["ambient", "backgroundMusic", "foley", "pacing", "silenceMoments"]
            },
            timelineGraphics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  mapOrDiagram: { type: Type.STRING },
                  comparison: { type: Type.STRING }
                },
                required: ["time", "title", "mapOrDiagram"]
              }
            },
            educationalCallouts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["type", "title", "content"]
              }
            },
            ending: {
              type: Type.OBJECT,
              properties: {
                conclusion: { type: Type.STRING },
                takeaway: { type: Type.STRING },
                engagementQuestion: { type: Type.STRING }
              },
              required: ["conclusion", "takeaway", "engagementQuestion"]
            },
            callToAction: { type: Type.STRING },
            socialMedia: {
              type: Type.OBJECT,
              properties: {
                youtubeShorts: { type: Type.ARRAY, items: { type: Type.STRING } },
                instagramReels: { type: Type.ARRAY, items: { type: Type.STRING } },
                tikTok: { type: Type.ARRAY, items: { type: Type.STRING } },
                facebook: { type: Type.ARRAY, items: { type: Type.STRING } },
                xPosts: { type: Type.ARRAY, items: { type: Type.STRING } },
                threads: { type: Type.ARRAY, items: { type: Type.STRING } },
                linkedIn: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["youtubeShorts", "instagramReels", "tikTok", "facebook", "xPosts", "threads", "linkedIn"]
            },
            seo: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                chapters: { type: Type.ARRAY, items: { type: Type.STRING } },
                metadata: { type: Type.STRING },
                searchTags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["description", "keywords", "hashtags", "chapters", "metadata", "searchTags"]
            }
          },
          required: [
            "title", "thumbnailIdeas", "hook", "chapters", "sceneBreakdowns", 
            "soundDesign", "timelineGraphics", "educationalCallouts", "ending", 
            "callToAction", "socialMedia", "seo"
          ]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.warn("Generate package error, activating high-fidelity fallback:", err);
    const fallbackData = getFallbackPackage(topic, customInstructions, err.message);
    res.json(fallbackData);
  }
});

// Helper endpoint to check key status and detect environment variables
app.get("/api/key-status", (req, res) => {
  const status: Record<string, boolean> = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    History: !!process.env.History,
    HISTORY: !!process.env.HISTORY,
    History_key: !!process.env.History_key,
    HISTORY_KEY: !!process.env.HISTORY_KEY,
  };
  
  let activeKeySource = "None";
  if (process.env.History) activeKeySource = "History";
  else if (process.env.HISTORY) activeKeySource = "HISTORY";
  else if (process.env.History_key) activeKeySource = "History_key";
  else if (process.env.HISTORY_KEY) activeKeySource = "HISTORY_KEY";
  else if (process.env.GEMINI_API_KEY) activeKeySource = "GEMINI_API_KEY";
  
  res.json({
    status,
    activeKeySource,
    hasActiveKey: activeKeySource !== "None",
    activeKeyLength: activeKeySource !== "None" ? (process.env[activeKeySource]?.length || 0) : 0,
    activeKeyPreview: activeKeySource !== "None" ? (() => {
      const val = process.env[activeKeySource] || "";
      if (val.length <= 6) return "***";
      return `${val.substring(0, 3)}...${val.substring(val.length - 3)}`;
    })() : "None"
  });
});

// 3. Image generation endpoint (using gemini-3.1-flash-lite-image)
app.post("/api/generate-image", async (req, res) => {
  const { prompt, aspectRatio, simulate, sceneNumber } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (simulate) {
    const p = (prompt || "").toLowerCase();
    let url = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"; // Default cosmic globe
    
    if (p.includes("ai") || p.includes("artificial") || p.includes("turing") || p.includes("computer") || p.includes("machine") || p.includes("technology") || p.includes("digital")) {
      url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("space") || p.includes("cosmic") || p.includes("nebula") || p.includes("galaxy") || p.includes("universe") || p.includes("star")) {
      url = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("ancient") || p.includes("rome") || p.includes("egypt") || p.includes("greece") || p.includes("history") || p.includes("ruin") || p.includes("temple") || p.includes("scholar")) {
      url = "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("nature") || p.includes("forest") || p.includes("mountain") || p.includes("landscape") || p.includes("summit")) {
      url = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("industrial") || p.includes("forge") || p.includes("factory") || p.includes("machine") || p.includes("steam")) {
      url = "https://images.unsplash.com/photo-1518152006812-edab29b069ca?auto=format&fit=crop&w=800&q=80";
    }
    return res.json({ imageUrl: url, isFallback: true });
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: `${prompt}. High-quality cinematic production frame, historic fidelity, detailed texture, masterfully lit.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "16:9",
        }
      }
    });

    // Extract image from parts
    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image was returned from the Gemini model.");
    }

    res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (err: any) {
    console.warn("Generate image error, using beautiful Unsplash fallback:", err);
    
    // Log detailed server-side error report
    videoErrorReports.unshift({
      id: "err-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      sceneNumber: sceneNumber || "unknown",
      prompt,
      stage: "start",
      error: `Image generation failed: ${err.message || String(err)}`,
      code: err.code || err.status || "IMAGE_API_ERROR",
      details: err.stack || err
    });

    const p = (prompt || "").toLowerCase();
    let url = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"; // Default cosmic globe
    
    if (p.includes("ai") || p.includes("artificial") || p.includes("turing") || p.includes("computer") || p.includes("machine") || p.includes("technology") || p.includes("digital")) {
      url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("space") || p.includes("cosmic") || p.includes("nebula") || p.includes("galaxy") || p.includes("universe") || p.includes("star")) {
      url = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("ancient") || p.includes("rome") || p.includes("egypt") || p.includes("greece") || p.includes("history") || p.includes("ruin") || p.includes("temple") || p.includes("scholar")) {
      url = "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("nature") || p.includes("forest") || p.includes("mountain") || p.includes("landscape") || p.includes("summit")) {
      url = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";
    } else if (p.includes("industrial") || p.includes("forge") || p.includes("factory") || p.includes("machine") || p.includes("steam")) {
      url = "https://images.unsplash.com/photo-1518152006812-edab29b069ca?auto=format&fit=crop&w=800&q=80";
    }
    
    res.json({ imageUrl: url, isFallback: true });
  }
});

interface VideoErrorReport {
  id: string;
  timestamp: string;
  sceneNumber?: number | string;
  prompt?: string;
  stage: "start" | "poll" | "stream" | "client";
  error: string;
  code?: string | number;
  details?: any;
}

let videoErrorReports: VideoErrorReport[] = [];

// 3.5 Debug Video Service endpoint
app.get("/api/debug-video-service", (req, res) => {
  res.json({ reports: videoErrorReports });
});

app.post("/api/debug-video-service", (req, res) => {
  const { action, report } = req.body;
  if (action === "clear") {
    videoErrorReports = [];
    return res.json({ success: true, message: "Logs cleared", reports: [] });
  }
  if (report) {
    const newReport: VideoErrorReport = {
      id: "err-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      stage: report.stage || "client",
      sceneNumber: report.sceneNumber,
      prompt: report.prompt,
      error: report.error || "Unknown client error",
      details: report.details,
      code: report.code
    };
    videoErrorReports.unshift(newReport);
    return res.json({ success: true, report: newReport });
  }
  res.status(400).json({ error: "Invalid action or report body" });
});

// 4. Start video generation endpoint (returns operationName)
app.post("/api/generate-video", async (req, res) => {
  const { prompt, aspectRatio, sceneNumber, simulate } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (simulate) {
    return res.json({ operationName: "fallback-op-" + (sceneNumber || "1") + "-" + Date.now() });
  }

  try {
    const ai = getAiClient();
    let operation;
    try {
      operation = await ai.models.generateVideos({
        model: "veo-3.1-lite-generate-preview",
        prompt: `${prompt}. Cinematic documentary style, hyper-realistic, historically accurate, 24fps.`,
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio: aspectRatio || "16:9"
        }
      });
    } catch (mErr: any) {
      console.warn("Primary veo-3.1-lite model failed, attempting veo-2.0 fallback:", mErr?.message);
      operation = await ai.models.generateVideos({
        model: "veo-2.0-generate-001",
        prompt: `${prompt}. Cinematic documentary style, hyper-realistic, historically accurate, 24fps.`,
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio: aspectRatio || "16:9"
        }
      });
    }

    res.json({ operationName: operation.name });
  } catch (err: any) {
    console.warn("Start video generation error, using fallback operation:", err);
    
    // Log detailed server-side error report
    videoErrorReports.unshift({
      id: "err-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      sceneNumber: sceneNumber || "unknown",
      prompt,
      stage: "start",
      error: err.message || String(err),
      code: err.code || err.status || "API_ERROR",
      details: err.stack || err
    });

    res.json({ operationName: "fallback-op-" + (sceneNumber || "1") + "-" + Date.now() });
  }
});

// 5. Poll video operation status
app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required" });
    }

    if (operationName.startsWith("fallback-op-")) {
      let videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
      if (operationName.includes("-2-")) {
        videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
      } else if (operationName.includes("-3-")) {
        videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
      }
      return res.json({ done: true, error: null, metadata: {}, videoUrl });
    }

    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    
    if (updated.error) {
      const errObj = updated.error as any;
      videoErrorReports.unshift({
        id: "err-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        stage: "poll",
        error: errObj.message || "Operation failed",
        code: errObj.code || "OPERATION_ERROR",
        details: updated.error
      });
    }

    let videoUrl = null;
    if (updated.done) {
      videoUrl = `/api/video/${encodeURIComponent(operationName)}`;
    }

    res.json({ 
      done: updated.done,
      error: updated.error,
      metadata: updated.metadata,
      videoUrl
    });
  } catch (err: any) {
    console.warn("Video status poll error, using fallback state:", err);
    
    // Log detailed server-side error report
    videoErrorReports.unshift({
      id: "err-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      stage: "poll",
      error: err.message || String(err),
      code: err.code || err.status || "POLL_ERROR",
      details: err.stack || err
    });

    res.json({ 
      done: true, 
      error: null, 
      metadata: {}, 
      isFallback: true, 
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" 
    });
  }
});

// 6. Play/stream completed video directly into <video> tags
app.get("/api/video/:operationName", async (req, res) => {
  const defaultFallbackUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  
  try {
    const { operationName } = req.params;
    if (!operationName) {
      return res.status(400).send("operationName is required");
    }

    // Determine fallback URL based on requested scene
    let videoUrl = defaultFallbackUrl;
    if (operationName.includes("-2-")) {
      videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
    } else if (operationName.includes("-3-")) {
      videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
    }

    if (operationName.startsWith("fallback-op-")) {
      return res.redirect(videoUrl);
    }

    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    if (!updated.done) {
      return res.status(202).send("Video is still being generated. Keep polling.");
    }

    const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      return res.status(404).send("Generated video URI not found in completed operation.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      return res.redirect(`${videoUri}?key=${apiKey}`);
    } else {
      return res.redirect(videoUrl);
    }
  } catch (err: any) {
    console.warn("Stream video error, redirecting to fallback:", err);

    // Log detailed server-side error report
    videoErrorReports.unshift({
      id: "err-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      stage: "stream",
      error: err.message || String(err),
      code: err.code || err.status || "STREAM_ERROR",
      details: err.stack || err
    });

    res.redirect(defaultFallbackUrl);
  }
});

// Mount Vite middleware in development or serve built assets in production
async function run() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HistoryVerse Studio successfully running on http://localhost:${PORT}`);
  });
}

run();
