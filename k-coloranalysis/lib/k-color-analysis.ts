export type ScreenTab = "home" | "analyze" | "recommendations" | "profile";

export type CaptureIssueCode =
  | "camera_permission_denied"
  | "face_not_found"
  | "multiple_faces"
  | "face_too_small"
  | "face_out_of_frame"
  | "poor_lighting"
  | "image_blurry"
  | "face_detection_unavailable";

export type CaptureIssue = {
  code: CaptureIssueCode;
  message: string;
  severity: "info" | "warning" | "error";
};

export type RegionColor = {
  rgb: [number, number, number];
  hex: string;
  hsl: { h: number; s: number; l: number };
  lab: { l: number; a: number; b: number };
};

export type ColorSwatch = {
  name: string;
  hex: string;
  role: "best" | "neutral" | "accent" | "avoid";
};

export type RecommendationItem = {
  id: string;
  title: string;
  description: string;
  category: "Clothing" | "Jewelry" | "Colors";
  paletteTags: string[];
  image: string;
  reason: string;
};

export type JewelrySuggestion = {
  metal: string;
  finish: string;
  stoneFamily: string;
  reason: string;
};

export type AnalysisResult = {
  analysisId: string;
  capturedAt: string;
  confidence: number;
  primarySeason: "Spring" | "Summer" | "Autumn" | "Winter";
  secondarySeason: "Spring" | "Summer" | "Autumn" | "Winter";
  toneSubtype: string;
  undertone: "Warm" | "Cool" | "Neutral-Warm" | "Neutral-Cool";
  value: "Light" | "Medium" | "Deep";
  chroma: "Soft" | "Balanced" | "Clear";
  contrast: "Low" | "Medium" | "High";
  snapshotDataUrl: string;
  qualitySummary: string;
  explanations: string[];
  skin: RegionColor;
  eyes: RegionColor;
  hair: RegionColor;
  bestColors: ColorSwatch[];
  secondaryBestColors: ColorSwatch[];
  neutralColors: ColorSwatch[];
  accentColors: ColorSwatch[];
  avoidColors: ColorSwatch[];
  clothingRecommendations: RecommendationItem[];
  jewelryRecommendations: JewelrySuggestion[];
  paletteSummary: string;
};

type FaceCandidate = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type AnalysisOptions = {
  hairDyed: boolean;
  wearingMakeup: boolean;
};

const SUBTYPE_TO_SECONDARY: Record<string, AnalysisResult["secondarySeason"]> = {
  "Light Spring": "Summer",
  "True Spring": "Autumn",
  "Bright Spring": "Winter",
  "Light Summer": "Spring",
  "True Summer": "Winter",
  "Soft Summer": "Autumn",
  "Soft Autumn": "Summer",
  "True Autumn": "Spring",
  "Deep Autumn": "Winter",
  "Bright Winter": "Spring",
  "True Winter": "Summer",
  "Deep Winter": "Autumn",
};

const SEASON_DEFAULT_SUBTYPE: Record<AnalysisResult["secondarySeason"], string> = {
  Spring: "True Spring",
  Summer: "True Summer",
  Autumn: "True Autumn",
  Winter: "True Winter",
};


const PALETTES: Record<
  string,
  {
    summary: string;
    best: ColorSwatch[];
    neutrals: ColorSwatch[];
    accents: ColorSwatch[];
    avoid: ColorSwatch[];
    clothing: RecommendationItem[];
    jewelry: JewelrySuggestion[];
  }
> = {
  "Light Spring": {
    summary:
      "Warm, fresh, and airy colors keep your face bright without overpowering your features.",
    best: [
      { name: "Apricot Cream", hex: "#F7D2AF", role: "best" },
      { name: "Peach Sorbet", hex: "#F5B08C", role: "best" },
      { name: "Butter Yellow", hex: "#F6E385", role: "best" },
      { name: "Mint Glow", hex: "#B9E7C4", role: "best" },
    ],
    neutrals: [
      { name: "Oat Milk", hex: "#EFE3D2", role: "neutral" },
      { name: "Soft Camel", hex: "#D1B08A", role: "neutral" },
    ],
    accents: [
      { name: "Coral Bloom", hex: "#FF7E6B", role: "accent" },
      { name: "Aqua Pop", hex: "#69D8E3", role: "accent" },
    ],
    avoid: [
      { name: "Charcoal", hex: "#33363B", role: "avoid" },
      { name: "Blue Black", hex: "#0F1A2F", role: "avoid" },
    ],
    clothing: [
      {
        id: "light-spring-knit",
        title: "Soft collared knit",
        description: "A creamy collared knit keeps the focus on your face.",
        category: "Clothing",
        paletteTags: ["Spring", "Light Spring"],
        image: "cream knit polo shirt",
        reason: "Warm light neutrals echo your brightness without draining you.",
      },
      {
        id: "light-spring-cardigan",
        title: "Apricot cardigan",
        description: "An easy topper for light warm palettes.",
        category: "Clothing",
        paletteTags: ["Spring", "Light Spring"],
        image: "Apricot cardigan sweater",
        reason: "Low contrast shapes suit lighter value ranges.",
      },
      {
        id: "light-spring-color",
        title: "Near-face colors",
        description: "Apricot, mint, butter, and clear coral.",
        category: "Colors",
        paletteTags: ["Spring", "Light Spring"],
        image: "Color wheel details",
        reason: "These shades support a gentle warm undertone.",
      },
    ],
    jewelry: [
      {
        metal: "Gold",
        finish: "Light polish",
        stoneFamily: "Peach morganite or pearl",
        reason: "Soft-warm metals blend naturally with your undertone.",
      },
    ],
  },
  "True Spring": {
    summary:
      "Clear warm colors with lively energy give your features lift and warmth.",
    best: [
      { name: "Tomato Coral", hex: "#F9604C", role: "best" },
      { name: "Sunlit Marigold", hex: "#F2B237", role: "best" },
      { name: "Leaf Green", hex: "#74B857", role: "best" },
      { name: "Clear Turquoise", hex: "#34B8C6", role: "best" },
    ],
    neutrals: [
      { name: "Warm Sand", hex: "#DCC39F", role: "neutral" },
      { name: "Camel Latte", hex: "#BE9168", role: "neutral" },
    ],
    accents: [
      { name: "Poppy", hex: "#FF5F45", role: "accent" },
      { name: "Peacock", hex: "#1491A3", role: "accent" },
    ],
    avoid: [
      { name: "Dusty Rose", hex: "#C79AA3", role: "avoid" },
      { name: "Ash Taupe", hex: "#807676", role: "avoid" },
    ],
    clothing: [
      {
        id: "true-spring-polo",
        title: "Warm coral polo shirt",
        description: "A structured collar gives brightness without heaviness.",
        category: "Clothing",
        paletteTags: ["Spring", "True Spring"],
        image: "Warm coral polo shirt",
        reason: "Clear warm shades keep your complexion lively.",
      },
      {
        id: "true-spring-earrings",
        title: "Gold hoop earrings",
        description: "Simple warm-metal jewelry with polished surfaces.",
        category: "Jewelry",
        paletteTags: ["Spring", "True Spring"],
        image: "Gold hoop earrings",
        reason: "High clarity works better than antique finishes here.",
      },
      {
        id: "true-spring-color",
        title: "Best color family",
        description: "Coral, warm green, marigold, and turquoise.",
        category: "Colors",
        paletteTags: ["Spring", "True Spring"],
        image: "Bright spring swatches",
        reason: "These colors reinforce a warm, clear palette.",
      },
    ],
    jewelry: [
      {
        metal: "Yellow gold",
        finish: "Polished",
        stoneFamily: "Citrine or coral",
        reason: "Clear warmth is stronger than muted softness on you.",
      },
    ],
  },
  "Bright Spring": {
    summary:
      "High-energy warm colors and crisp contrast make your features look vivid and awake.",
    best: [
      { name: "Vivid Coral", hex: "#FF6B5C", role: "best" },
      { name: "Lime Splash", hex: "#97D947", role: "best" },
      { name: "Electric Aqua", hex: "#2BC9D7", role: "best" },
      { name: "Clear Peach", hex: "#FFB17A", role: "best" },
    ],
    neutrals: [
      { name: "Warm Ivory", hex: "#F6ECD8", role: "neutral" },
      { name: "Light Camel", hex: "#CAA37D", role: "neutral" },
    ],
    accents: [
      { name: "Hot Papaya", hex: "#FF734D", role: "accent" },
      { name: "Pool Blue", hex: "#00A8C8", role: "accent" },
    ],
    avoid: [
      { name: "Mauve Dust", hex: "#B78F9D", role: "avoid" },
      { name: "Smoky Gray", hex: "#6E6E77", role: "avoid" },
    ],
    clothing: [
      {
        id: "bright-spring-knit",
        title: "Bright knit sweater with contrasting colors",
        description: "Cream base with a bright warm accent near the face.",
        category: "Clothing",
        paletteTags: ["Spring", "Bright Spring"],
        image: "bright knit sweater with contrasting colors",
        reason: "You hold color best when it is bright and clean.",
      },
      {
        id: "bright-spring-chain",
        title: "Shiny necklace",
        description: "Simple hardware with a little shine.",
        category: "Jewelry",
        paletteTags: ["Spring", "Bright Spring"],
        image: "shiny necklace",
        reason: "Reflective finishes match your brighter contrast level.",
      },
      {
        id: "bright-spring-color",
        title: "Signature swatches",
        description: "Coral, aqua, clear peach, and vivid lime.",
        category: "Colors",
        paletteTags: ["Spring", "Bright Spring"],
        image: "Bright spring palette",
        reason: "These colors create sparkle without going cold.",
      },
    ],
    jewelry: [
      {
        metal: "Bright gold",
        finish: "Mirror polish",
        stoneFamily: "Peridot or vibrant enamel",
        reason: "Clean shine works better than antique warmth here.",
      },
    ],
  },
  "Light Summer": {
    summary:
      "Light cool shades with low contrast keep your features soft, clean, and balanced.",
    best: [
      { name: "Powder Blue", hex: "#BED6EE", role: "best" },
      { name: "Cool Pink", hex: "#E9BAC9", role: "best" },
      { name: "Lavender Mist", hex: "#C9BEEB", role: "best" },
      { name: "Seafoam", hex: "#BFD9D2", role: "best" },
    ],
    neutrals: [
      { name: "Soft Pearl", hex: "#F2EFF1", role: "neutral" },
      { name: "Mushroom", hex: "#B9B0AF", role: "neutral" },
    ],
    accents: [
      { name: "Rosewater", hex: "#D790B0", role: "accent" },
      { name: "Foggy Blue", hex: "#8AA6D1", role: "accent" },
    ],
    avoid: [
      { name: "Orange Spice", hex: "#C76733", role: "avoid" },
      { name: "Warm Khaki", hex: "#91805F", role: "avoid" },
    ],
    clothing: [
      {
        id: "light-summer-blouse",
        title: "Light colored knit sweater",
        description: "Soft drape and cool light color near the face.",
        category: "Clothing",
        paletteTags: ["Summer", "Light Summer"],
        image: "light colored knit sweater",
        reason: "Your palette looks best in cool colors with gentle value.",
      },
      {
        id: "light-summer-earrings",
        title: "Pearl earrings",
        description: "A soft luminous finish instead of high-shine metal.",
        category: "Jewelry",
        paletteTags: ["Summer", "Light Summer"],
        image: "Pearl earrings",
        reason: "Low-contrast refinement flatters light summer coloring.",
      },
      {
        id: "light-summer-color",
        title: "Color guide",
        description: "Powder blue, lavender, dusty rose, and cool mint.",
        category: "Colors",
        paletteTags: ["Summer", "Light Summer"],
        image: "Light summer colors",
        reason: "Softness matters more than intensity for your palette.",
      },
    ],
    jewelry: [
      {
        metal: "Silver",
        finish: "Soft satin",
        stoneFamily: "Pearl or pale sapphire",
        reason: "Cool delicate reflectivity mirrors your natural softness.",
      },
    ],
  },
  "True Summer": {
    summary:
      "Cool, refined, and balanced colors give your features the most natural harmony.",
    best: [
      { name: "Dusty Rose", hex: "#D79AAE", role: "best" },
      { name: "Blue Iris", hex: "#7D92D1", role: "best" },
      { name: "Plum Veil", hex: "#9070A9", role: "best" },
      { name: "Cool Teal", hex: "#5EA6A7", role: "best" },
    ],
    neutrals: [
      { name: "Stone Gray", hex: "#B4B6BD", role: "neutral" },
      { name: "Soft Navy", hex: "#4D5E83", role: "neutral" },
    ],
    accents: [
      { name: "Berry Pink", hex: "#CC6E99", role: "accent" },
      { name: "Cornflower", hex: "#7192E2", role: "accent" },
    ],
    avoid: [
      { name: "Orange Red", hex: "#D05037", role: "avoid" },
      { name: "Mustard", hex: "#B18F2C", role: "avoid" },
    ],
    clothing: [
      {
        id: "true-summer-crew",
        title: "Cool crewneck shirt",
        description: "A dusty mauve knit for balanced cool coloring.",
        category: "Clothing",
        paletteTags: ["Summer", "True Summer"],
        image: "Cool crewneck shirt",
        reason: "Cool muted shades feel polished, not loud, on you.",
      },
      {
        id: "true-summer-jewelry",
        title: "Silver pendant necklace",
        description: "Low-gloss silver with clean shapes.",
        category: "Jewelry",
        paletteTags: ["Summer", "True Summer"],
        image: "Silver pendant necklace",
        reason: "Brushed finishes align with a muted cool palette.",
      },
      {
        id: "true-summer-color",
        title: "Best near-face colors",
        description: "Rose, cornflower, plum, and cool teal.",
        category: "Colors",
        paletteTags: ["Summer", "True Summer"],
        image: "Summer swatches",
        reason: "Cool mid-value shades feel naturally harmonious.",
      },
    ],
    jewelry: [
      {
        metal: "Silver",
        finish: "Brushed",
        stoneFamily: "Moonstone or blue sapphire",
        reason: "Soft cool metals repeat your natural color direction.",
      },
    ],
  },
  "Soft Summer": {
    summary:
      "Muted cool tones soften your contrast and make your features look elegant and cohesive.",
    best: [
      { name: "Dusty Sage", hex: "#A3B8A5", role: "best" },
      { name: "Mauve Taupe", hex: "#B99AA0", role: "best" },
      { name: "Blue Gray", hex: "#90A1B5", role: "best" },
      { name: "Rose Brown", hex: "#A77F83", role: "best" },
    ],
    neutrals: [
      { name: "Mushroom Beige", hex: "#B5A89E", role: "neutral" },
      { name: "Soft Charcoal", hex: "#5D6168", role: "neutral" },
    ],
    accents: [
      { name: "Berry Mauve", hex: "#B76988", role: "accent" },
      { name: "Storm Blue", hex: "#7087A0", role: "accent" },
    ],
    avoid: [
      { name: "Bright Orange", hex: "#F36D32", role: "avoid" },
      { name: "Acid Lime", hex: "#A6D635", role: "avoid" },
    ],
    clothing: [
      {
        id: "soft-summer-top",
        title: "Dull halter knit shirt",
        description: "A dusty rose halter for low-contrast cool coloring.",
        category: "Clothing",
        paletteTags: ["Summer", "Soft Summer"],
        image: "Dull halter knit shirt",
        reason: "Your features look polished in softened cool colors.",
      },
      {
        id: "soft-summer-necklace",
        title: "Matte silver necklace",
        description: "Slim cool-metal jewelry with soft reflection.",
        category: "Jewelry",
        paletteTags: ["Summer", "Soft Summer"],
        image: "Matte silver necklace",
        reason: "Subdued shine is more flattering than high gloss.",
      },
      {
        id: "soft-summer-color",
        title: "Muted guide",
        description: "Sage, blue-gray, mauve, and cool taupe.",
        category: "Colors",
        paletteTags: ["Summer", "Soft Summer"],
        image: "Muted summer palette",
        reason: "These tones keep your contrast smooth and harmonious.",
      },
    ],
    jewelry: [
      {
        metal: "Silver",
        finish: "Matte",
        stoneFamily: "Smoky quartz or moonstone",
        reason: "Muted cool surfaces support your softer chroma level.",
      },
    ],
  },
  "Soft Autumn": {
    summary:
      "Muted warmth and earthy softness flatter you more than crisp or icy color.",
    best: [
      { name: "Olive Moss", hex: "#8A9670", role: "best" },
      { name: "Terracotta Rose", hex: "#B67A67", role: "best" },
      { name: "Muted Teal", hex: "#5C8B84", role: "best" },
      { name: "Warm Taupe", hex: "#B4977D", role: "best" },
    ],
    neutrals: [
      { name: "Latte", hex: "#C7A98C", role: "neutral" },
      { name: "Soft Cocoa", hex: "#7B6256", role: "neutral" },
    ],
    accents: [
      { name: "Rust Bloom", hex: "#C16B4B", role: "accent" },
      { name: "Moss Green", hex: "#76844A", role: "accent" },
    ],
    avoid: [
      { name: "Fuchsia", hex: "#D83A8C", role: "avoid" },
      { name: "Icy Blue", hex: "#A5D9FF", role: "avoid" },
    ],
    clothing: [
      {
        id: "soft-autumn-shirt",
        title: "Dull olive green shirt",
        description: "Relaxed tailoring and grounded warm color.",
        category: "Clothing",
        paletteTags: ["Autumn", "Soft Autumn"],
        image: "dull olive green shirt",
        reason: "Soft-warm earthy shades balance your features beautifully.",
      },
      {
        id: "soft-autumn-jewelry",
        title: "Gold hoop earrings",
        description: "Soft gold jewelry instead of bright yellow gold.",
        category: "Jewelry",
        paletteTags: ["Autumn", "Soft Autumn"],
        image: "Gold hoop earrings",
        reason: "A softened finish harmonizes with your muted warmth.",
      },
      {
        id: "soft-autumn-color",
        title: "Best color family",
        description: "Olive, terracotta, muted teal, and warm taupe.",
        category: "Colors",
        paletteTags: ["Autumn", "Soft Autumn"],
        image: "Soft autumn swatches",
        reason: "These colors support low-to-medium contrast warmth.",
      },
    ],
    jewelry: [
      {
        metal: "Champagne gold",
        finish: "Brushed",
        stoneFamily: "Smoky quartz or amber",
        reason: "Muted warm depth is more flattering than icy shine.",
      },
    ],
  },
  "True Autumn": {
    summary:
      "Rich warm shades give your coloring depth and make your features look grounded and healthy.",
    best: [
      { name: "Rust", hex: "#B75D3A", role: "best" },
      { name: "Marigold", hex: "#C99520", role: "best" },
      { name: "Forest Moss", hex: "#596D3B", role: "best" },
      { name: "Petrol Teal", hex: "#2D6870", role: "best" },
    ],
    neutrals: [
      { name: "Camel", hex: "#B48559", role: "neutral" },
      { name: "Espresso", hex: "#4D382D", role: "neutral" },
    ],
    accents: [
      { name: "Brick", hex: "#B74936", role: "accent" },
      { name: "Peacock Green", hex: "#1E7378", role: "accent" },
    ],
    avoid: [
      { name: "Baby Pink", hex: "#F5C6D1", role: "avoid" },
      { name: "Icy Lilac", hex: "#D9D5FF", role: "avoid" },
    ],
    clothing: [
      {
        id: "true-autumn-knit",
        title: "Dull yellow collared knit shirt",
        description: "A warm structured knit close to the face.",
        category: "Clothing",
        paletteTags: ["Autumn", "True Autumn"],
        image: "dull yellow collared knit shirt",
        reason: "Rich warm neutrals highlight your undertone beautifully.",
      },
      {
        id: "true-autumn-jewelry",
        title: "Gold pendant necklace",
        description: "Warm brushed jewelry with earthy stones.",
        category: "Jewelry",
        paletteTags: ["Autumn", "True Autumn"],
        image: "Gold pendant necklace",
        reason: "Depth and warmth are more flattering than icy contrast.",
      },
      {
        id: "true-autumn-color",
        title: "Signature colors",
        description: "Rust, moss, marigold, and warm teal.",
        category: "Colors",
        paletteTags: ["Autumn", "True Autumn"],
        image: "Autumn palette card",
        reason: "These colors hold your warmth without washing you out.",
      },
    ],
    jewelry: [
      {
        metal: "Antique gold",
        finish: "Brushed",
        stoneFamily: "Amber or tiger's eye",
        reason: "Earthy depth and warmth are strongest on this palette.",
      },
    ],
  },
  "Deep Autumn": {
    summary:
      "Deep warm colors and stronger contrast give your features structure without turning too icy.",
    best: [
      { name: "Mahogany", hex: "#6B352B", role: "best" },
      { name: "Deep Olive", hex: "#56603D", role: "best" },
      { name: "Dark Teal", hex: "#205F64", role: "best" },
      { name: "Burnished Copper", hex: "#A65C2F", role: "best" },
    ],
    neutrals: [
      { name: "Dark Camel", hex: "#9A704E", role: "neutral" },
      { name: "Coffee Bean", hex: "#3A2A22", role: "neutral" },
    ],
    accents: [
      { name: "Brick Red", hex: "#8E3B2F", role: "accent" },
      { name: "Deep Moss", hex: "#435332", role: "accent" },
    ],
    avoid: [
      { name: "Ice Pink", hex: "#F6D9E3", role: "avoid" },
      { name: "Powder Blue", hex: "#C6D9ED", role: "avoid" },
    ],
    clothing: [
      {
        id: "deep-autumn-top",
        title: "Olive green button up shirt",
        description: "A grounded dark warm layer with structure.",
        category: "Clothing",
        paletteTags: ["Autumn", "Deep Autumn"],
        image: "olive green button up shirt",
        reason: "You can carry richer warmth and deeper contrast beautifully.",
      },
      {
        id: "deep-autumn-jewelry",
        title: "Dull gold ring",
        description: "Warm dark metal with subtle texture.",
        category: "Jewelry",
        paletteTags: ["Autumn", "Deep Autumn"],
        image: "Dull gold ring",
        reason: "Deeper finishes mirror your stronger natural depth.",
      },
      {
        id: "deep-autumn-color",
        title: "Color guide",
        description: "Mahogany, dark olive, copper, and dark teal.",
        category: "Colors",
        paletteTags: ["Autumn", "Deep Autumn"],
        image: "Deep autumn palette",
        reason: "These colors add drama while staying warm.",
      },
    ],
    jewelry: [
      {
        metal: "Bronze",
        finish: "Soft shine",
        stoneFamily: "Garnet or amber",
        reason: "Depth matters as much as warmth in your palette.",
      },
    ],
  },
  "Bright Winter": {
    summary:
      "Crisp cool color and lively contrast make your features look striking and clean.",
    best: [
      { name: "Fuchsia", hex: "#E1398E", role: "best" },
      { name: "Electric Blue", hex: "#3677F5", role: "best" },
      { name: "Icy Pink", hex: "#F4CBE3", role: "best" },
      { name: "Emerald Pop", hex: "#00A684", role: "best" },
    ],
    neutrals: [
      { name: "Optic White", hex: "#FAFAFD", role: "neutral" },
      { name: "Ink Navy", hex: "#1B2743", role: "neutral" },
    ],
    accents: [
      { name: "Hot Pink", hex: "#FF3D9E", role: "accent" },
      { name: "Royal Blue", hex: "#3256E7", role: "accent" },
    ],
    avoid: [
      { name: "Camel", hex: "#BA8C62", role: "avoid" },
      { name: "Olive", hex: "#7A7A44", role: "avoid" },
    ],
    clothing: [
      {
        id: "bright-winter-shirt",
        title: "Bright Blue polo shirt",
        description: "Bright cool color with a clean neckline.",
        category: "Clothing",
        paletteTags: ["Winter", "Bright Winter"],
        image: "Bright Blue polo shirt",
        reason: "You carry clarity and cool contrast extremely well.",
      },
      {
        id: "bright-winter-jewelry",
        title: "Shiny silver hoop earrings",
        description: "Reflective cool metal with strong clarity.",
        category: "Jewelry",
        paletteTags: ["Winter", "Bright Winter"],
        image: "Shiny silver hoop earrings",
        reason: "Clean cool shine matches your higher contrast.",
      },
      {
        id: "bright-winter-color",
        title: "Signature colors",
        description: "Fuchsia, royal blue, emerald, and icy pink.",
        category: "Colors",
        paletteTags: ["Winter", "Bright Winter"],
        image: "Bright winter palette",
        reason: "These shades give you sharpness without dulling your skin.",
      },
    ],
    jewelry: [
      {
        metal: "Silver",
        finish: "Mirror polish",
        stoneFamily: "Diamond or clear crystal",
        reason: "Crisp reflective coolness suits this palette best.",
      },
    ],
  },
  "True Winter": {
    summary:
      "Cool, saturated, and sharply defined colors create the strongest harmony with your features.",
    best: [
      { name: "Royal Blue", hex: "#224CE0", role: "best" },
      { name: "Magenta Berry", hex: "#B71C77", role: "best" },
      { name: "Pine Green", hex: "#006861", role: "best" },
      { name: "Cherry Red", hex: "#C81E3C", role: "best" },
    ],
    neutrals: [
      { name: "Snow White", hex: "#FCFCFF", role: "neutral" },
      { name: "Black Ink", hex: "#171A22", role: "neutral" },
    ],
    accents: [
      { name: "Cobalt", hex: "#1856FF", role: "accent" },
      { name: "Berry", hex: "#A31B65", role: "accent" },
    ],
    avoid: [
      { name: "Rust", hex: "#A65835", role: "avoid" },
      { name: "Warm Beige", hex: "#D9BF9E", role: "avoid" },
    ],
    clothing: [
      {
        id: "true-winter-top",
        title: "Cool knit shirt",
        description: "A saturated cool top with clean structure.",
        category: "Clothing",
        paletteTags: ["Winter", "True Winter"],
        image: "Cool knit shirt",
        reason: "Strong cool contrast supports your features best.",
      },
      {
        id: "true-winter-jewelry",
        title: "Silver pendant necklace",
        description: "Polished silver with clear contrast.",
        category: "Jewelry",
        paletteTags: ["Winter", "True Winter"],
        image: "Silver pendant necklace",
        reason: "Crisp cool metal keeps the palette feeling deliberate.",
      },
      {
        id: "true-winter-color",
        title: "Best near-face colors",
        description: "Royal blue, magenta berry, pine, and cherry.",
        category: "Colors",
        paletteTags: ["Winter", "True Winter"],
        image: "True winter colors",
        reason: "Deep cool saturation aligns with your contrast level.",
      },
    ],
    jewelry: [
      {
        metal: "Silver",
        finish: "High polish",
        stoneFamily: "Onyx or clear quartz",
        reason: "This palette thrives on cool clarity and contrast.",
      },
    ],
  },
  "Deep Winter": {
    summary:
      "Deep, cool, and dramatic shades frame your features in the most striking way.",
    best: [
      { name: "Black Cherry", hex: "#4A1534", role: "best" },
      { name: "Midnight Blue", hex: "#182747", role: "best" },
      { name: "Deep Emerald", hex: "#00514B", role: "best" },
      { name: "Cranberry", hex: "#8D183B", role: "best" },
    ],
    neutrals: [
      { name: "Jet Black", hex: "#0F1217", role: "neutral" },
      { name: "Winter White", hex: "#F8FAFC", role: "neutral" },
    ],
    accents: [
      { name: "Deep Ruby", hex: "#8B1031", role: "accent" },
      { name: "Dark Teal", hex: "#0B4C51", role: "accent" },
    ],
    avoid: [
      { name: "Peach", hex: "#F4BEA1", role: "avoid" },
      { name: "Camel Gold", hex: "#C9A166", role: "avoid" },
    ],
    clothing: [
      {
        id: "deep-winter-shirt",
        title: "Navy collared shirt",
        description: "Deep cool tailoring adds structure and focus.",
        category: "Clothing",
        paletteTags: ["Winter", "Deep Winter"],
        image: "Navy collared shirt",
        reason: "You support drama best when the tones stay cool.",
      },
      {
        id: "deep-winter-jewelry",
        title: "Black silver ring",
        description: "Sharper lines and deeper cool finish.",
        category: "Jewelry",
        paletteTags: ["Winter", "Deep Winter"],
        image: "Black silver ring",
        reason: "Depth and cool contrast mirror your natural coloring.",
      },
      {
        id: "deep-winter-color",
        title: "Deep palette guide",
        description: "Midnight blue, black cherry, emerald, and cranberry.",
        category: "Colors",
        paletteTags: ["Winter", "Deep Winter"],
        image: "Deep winter palette",
        reason: "These shades give you definition without turning warm.",
      },
    ],
    jewelry: [
      {
        metal: "Silver",
        finish: "High polish or blackened",
        stoneFamily: "Onyx or garnet",
        reason: "Cool depth is the strongest expression of your palette.",
      },
    ],
  },
};

function clamp(value: number, min = 0, max = 255) {
  return Math.min(Math.max(value, min), max);
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value)).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

function rgbToHsl([r, g, b]: [number, number, number]) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
  }

  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    h: ((hue * 60 + 360) % 360) || 0,
    s: saturation * 100,
    l: lightness * 100,
  };
}

function rgbToLab([r, g, b]: [number, number, number]) {
  const [x, y, z] = rgbToXyz(r, g, b);
  const xr = x / 95.047;
  const yr = y / 100;
  const zr = z / 108.883;

  const fx = xyzTransform(xr);
  const fy = xyzTransform(yr);
  const fz = xyzTransform(zr);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function rgbToXyz(r: number, g: number, b: number) {
  const transform = (channel: number) => {
    const normalized = channel / 255;
    return normalized > 0.04045
      ? ((normalized + 0.055) / 1.055) ** 2.4
      : normalized / 12.92;
  };

  const rr = transform(r);
  const gg = transform(g);
  const bb = transform(b);

  return [
    (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) * 100,
    (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) * 100,
    (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) * 100,
  ];
}

function xyzTransform(value: number) {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
}

function luminance([r, g, b]: [number, number, number]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function buildRegionColor(rgb: [number, number, number]): RegionColor {
  return {
    rgb,
    hex: rgbToHex(rgb),
    hsl: rgbToHsl(rgb),
    lab: rgbToLab(rgb),
  };
}

function regionAverage(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const safeX = Math.max(0, Math.floor(x));
  const safeY = Math.max(0, Math.floor(y));
  const safeWidth = Math.max(1, Math.floor(width));
  const safeHeight = Math.max(1, Math.floor(height));
  const imageData = context.getImageData(safeX, safeY, safeWidth, safeHeight).data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let pixels = 0;

  for (let index = 0; index < imageData.length; index += 4) {
    const alpha = imageData[index + 3];
    if (alpha < 32) continue;
    totalR += imageData[index];
    totalG += imageData[index + 1];
    totalB += imageData[index + 2];
    pixels += 1;
  }

  if (!pixels) return [127, 127, 127] as [number, number, number];

  return [
    Math.round(totalR / pixels),
    Math.round(totalG / pixels),
    Math.round(totalB / pixels),
  ] as [number, number, number];
}

function computeBrightness(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const data = context.getImageData(0, 0, width, height).data;
  let sum = 0;
  let count = 0;
  let clippedShadows = 0;
  let clippedHighlights = 0;

  for (let index = 0; index < data.length; index += 16) {
    const pixel = [data[index], data[index + 1], data[index + 2]] as [
      number,
      number,
      number,
    ];
    const light = luminance(pixel);
    sum += light;
    count += 1;
    if (light < 22) clippedShadows += 1;
    if (light > 240) clippedHighlights += 1;
  }

  return {
    average: sum / Math.max(count, 1),
    shadowRatio: clippedShadows / Math.max(count, 1),
    highlightRatio: clippedHighlights / Math.max(count, 1),
  };
}

function computeBlurScore(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const data = context.getImageData(0, 0, width, height).data;
  let edgeEnergy = 0;
  let samples = 0;

  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      const index = (y * width + x) * 4;
      const left = ((y * width + (x - 1)) * 4);
      const right = ((y * width + (x + 1)) * 4);
      const top = (((y - 1) * width + x) * 4);
      const bottom = (((y + 1) * width + x) * 4);

      const current =
        0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
      const horizontal =
        0.299 * data[left] +
        0.587 * data[left + 1] +
        0.114 * data[left + 2] -
        (0.299 * data[right] +
          0.587 * data[right + 1] +
          0.114 * data[right + 2]);
      const vertical =
        0.299 * data[top] +
        0.587 * data[top + 1] +
        0.114 * data[top + 2] -
        (0.299 * data[bottom] +
          0.587 * data[bottom + 1] +
          0.114 * data[bottom + 2]);

      edgeEnergy += Math.abs(horizontal) + Math.abs(vertical) + current * 0.01;
      samples += 1;
    }
  }

  return edgeEnergy / Math.max(samples, 1);
}

async function detectFaces(target: CanvasImageSource) {
  if (typeof window === "undefined" || !("FaceDetector" in window)) {
    return { faces: [] as FaceCandidate[], supported: false };
  }

  try {
    const Detector = window.FaceDetector;
    if (!Detector) {
      return { faces: [] as FaceCandidate[], supported: false };
    }

    const detector = new Detector({
      fastMode: true,
      maxDetectedFaces: 2,
    });
    const detections = await detector.detect(target);
    return {
      supported: true,
      faces: detections.map((detection) => ({
        x: detection.boundingBox.x,
        y: detection.boundingBox.y,
        width: detection.boundingBox.width,
        height: detection.boundingBox.height,
      })),
    };
  } catch {
    return { faces: [] as FaceCandidate[], supported: false };
  }
}

function fallbackFace(width: number, height: number): FaceCandidate {
  const faceWidth = width * 0.42;
  const faceHeight = height * 0.52;
  return {
    x: (width - faceWidth) / 2,
    y: height * 0.18,
    width: faceWidth,
    height: faceHeight,
  };
}

function evaluateFaceIssues(
  face: FaceCandidate,
  width: number,
  height: number,
): CaptureIssue[] {
  const issues: CaptureIssue[] = [];
  const faceAreaRatio = (face.width * face.height) / (width * height);
  const nearEdge =
    face.x < width * 0.04 ||
    face.y < height * 0.04 ||
    face.x + face.width > width * 0.96 ||
    face.y + face.height > height * 0.9;

  if (faceAreaRatio < 0.11) {
    issues.push({
      code: "face_too_small",
      message: "Move closer so your face fills more of the guide frame.",
      severity: "warning",
    });
  }

  if (nearEdge) {
    issues.push({
      code: "face_out_of_frame",
      message: "Center your face fully inside the guide corners before analyzing.",
      severity: "warning",
    });
  }

  return issues;
}

function chooseSeason({
  warmScore,
  valueScore,
  chromaScore,
  contrastScore,
}: {
  warmScore: number;
  valueScore: number;
  chromaScore: number;
  contrastScore: number;
}) {
  const undertone =
    warmScore > 7
      ? "Warm"
      : warmScore > 1
        ? "Neutral-Warm"
        : warmScore < -7
          ? "Cool"
          : "Neutral-Cool";
  const value =
    valueScore > 61 ? "Light" : valueScore < 44 ? "Deep" : "Medium";
  const chroma =
    chromaScore > 54 ? "Clear" : chromaScore < 35 ? "Soft" : "Balanced";
  const contrast =
    contrastScore > 88 ? "High" : contrastScore < 52 ? "Low" : "Medium";

  let primarySeason: AnalysisResult["primarySeason"];
  let toneSubtype: string;

  if (warmScore >= 0) {
    if (value === "Light" && contrast !== "High") {
      primarySeason = "Spring";
      toneSubtype = chroma === "Clear" ? "True Spring" : "Light Spring";
    } else if (contrast === "High" && chroma === "Clear") {
      primarySeason = "Spring";
      toneSubtype = "Bright Spring";
    } else if (value === "Deep" || contrast === "High") {
      primarySeason = "Autumn";
      toneSubtype = "Deep Autumn";
    } else if (chroma === "Soft") {
      primarySeason = "Autumn";
      toneSubtype = "Soft Autumn";
    } else {
      primarySeason = "Autumn";
      toneSubtype = "True Autumn";
    }
  } else {
    if (value === "Light" && contrast !== "High") {
      primarySeason = "Summer";
      toneSubtype = "Light Summer";
    } else if (contrast === "High" && chroma === "Clear") {
      primarySeason = "Winter";
      toneSubtype = "Bright Winter";
    } else if (value === "Deep" || contrast === "High") {
      primarySeason = "Winter";
      toneSubtype = "Deep Winter";
    } else if (chroma === "Soft") {
      primarySeason = "Summer";
      toneSubtype = "Soft Summer";
    } else if (chroma === "Clear") {
      primarySeason = "Winter";
      toneSubtype = "True Winter";
    } else {
      primarySeason = "Summer";
      toneSubtype = "True Summer";
    }
  }

  return {
    undertone: undertone as AnalysisResult["undertone"],
    value: value as AnalysisResult["value"],
    chroma: chroma as AnalysisResult["chroma"],
    contrast: contrast as AnalysisResult["contrast"],
    primarySeason,
    toneSubtype,
    secondarySeason: SUBTYPE_TO_SECONDARY[toneSubtype],
  };
}

function buildExplanations(
  result: Pick<
    AnalysisResult,
    | "undertone"
    | "value"
    | "chroma"
    | "contrast"
    | "primarySeason"
    | "secondarySeason"
    | "toneSubtype"
  >,
  options: AnalysisOptions,
) {
  const notes = [
    `Your feature balance reads ${result.undertone.toLowerCase()} with a ${result.value.toLowerCase()} overall value.`,
    `${result.toneSubtype} was chosen because your contrast looks ${result.contrast.toLowerCase()} and your color intensity looks ${result.chroma.toLowerCase()}.`,
    `${result.primarySeason} is the strongest match, while ${result.secondarySeason} is your backup season when you want a little more range.`,
  ];

  if (options.hairDyed) {
    notes.push(
      "Hair was weighted more lightly because you marked your current hair color as dyed.",
    );
  }

  if (options.wearingMakeup) {
    notes.push(
      "Makeup can shift perceived undertone slightly, so this result leans more on contrast and eye harmony.",
    );
  }

  return notes;
}

function summarizeQuality(
  issues: CaptureIssue[],
  brightnessAverage: number,
  blurScore: number,
) {
  if (!issues.length) {
    return `Lighting and image detail were strong enough for a confident read. Brightness score ${Math.round(brightnessAverage)} and clarity score ${Math.round(blurScore)} both landed in the target range.`;
  }

  return `The read completed with ${issues.length} caution ${issues.length === 1 ? "flag" : "flags"}. Better front-facing light and a sharper photo will improve confidence.`;
}

export async function analyzePortrait(
  file: File,
  options: AnalysisOptions,
): Promise<{ result?: AnalysisResult; issues: CaptureIssue[] }> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");

  if (!context) {
    return {
      issues: [
        {
          code: "face_detection_unavailable",
          message: "Your browser could not create an analysis canvas.",
          severity: "error",
        },
      ],
    };
  }

  context.drawImage(bitmap, 0, 0);
  const brightness = computeBrightness(context, canvas.width, canvas.height);
  const blurScore = computeBlurScore(context, canvas.width, canvas.height);

  const issues: CaptureIssue[] = [];
  if (brightness.average < 80 || brightness.average > 205) {
    issues.push({
      code: "poor_lighting",
      message: "Use bright, even front lighting for a more accurate result.",
      severity: "warning",
    });
  }

  if (brightness.shadowRatio > 0.24 || brightness.highlightRatio > 0.16) {
    issues.push({
      code: "poor_lighting",
      message: "Heavy shadows or blown highlights are affecting the image.",
      severity: "warning",
    });
  }

  if (blurScore < 42) {
    issues.push({
      code: "image_blurry",
      message: "Hold still and retake the photo with a sharper image.",
      severity: "warning",
    });
  }

  const faceDetection = await detectFaces(canvas);
  if (faceDetection.supported && faceDetection.faces.length === 0) {
    issues.push({
      code: "face_not_found",
      message: "We could not find a clear face. Retake with your full face visible.",
      severity: "error",
    });
  }

  if (faceDetection.faces.length > 1) {
    issues.push({
      code: "multiple_faces",
      message: "Only one face should be visible during analysis.",
      severity: "error",
    });
  }

  if (!faceDetection.supported) {
    issues.push({
      code: "face_detection_unavailable",
      message:
        "Your browser does not support advanced face detection, so this uses a centered portrait estimate.",
      severity: "info",
    });
  }

  const face =
    faceDetection.faces[0] ?? fallbackFace(canvas.width, canvas.height);
  issues.push(...evaluateFaceIssues(face, canvas.width, canvas.height));

  const blockingIssues = issues.filter((issue) => issue.severity === "error");
  if (blockingIssues.length) {
    return { issues };
  }

  const forehead = regionAverage(
    context,
    face.x + face.width * 0.28,
    face.y + face.height * 0.11,
    face.width * 0.44,
    face.height * 0.12,
  );
  const leftCheek = regionAverage(
    context,
    face.x + face.width * 0.18,
    face.y + face.height * 0.42,
    face.width * 0.18,
    face.height * 0.16,
  );
  const rightCheek = regionAverage(
    context,
    face.x + face.width * 0.64,
    face.y + face.height * 0.42,
    face.width * 0.18,
    face.height * 0.16,
  );
  const eyeLeft = regionAverage(
    context,
    face.x + face.width * 0.22,
    face.y + face.height * 0.32,
    face.width * 0.16,
    face.height * 0.08,
  );
  const eyeRight = regionAverage(
    context,
    face.x + face.width * 0.62,
    face.y + face.height * 0.32,
    face.width * 0.16,
    face.height * 0.08,
  );
  const hair = regionAverage(
    context,
    face.x + face.width * 0.18,
    Math.max(0, face.y - face.height * 0.18),
    face.width * 0.64,
    face.height * 0.18,
  );

  const skinRgb = [
    Math.round((forehead[0] + leftCheek[0] + rightCheek[0]) / 3),
    Math.round((forehead[1] + leftCheek[1] + rightCheek[1]) / 3),
    Math.round((forehead[2] + leftCheek[2] + rightCheek[2]) / 3),
  ] as [number, number, number];
  const eyesRgb = [
    Math.round((eyeLeft[0] + eyeRight[0]) / 2),
    Math.round((eyeLeft[1] + eyeRight[1]) / 2),
    Math.round((eyeLeft[2] + eyeRight[2]) / 2),
  ] as [number, number, number];

  const skin = buildRegionColor(skinRgb);
  const eyes = buildRegionColor(eyesRgb);
  const hairColor = buildRegionColor(hair);

  const chromaScore =
    skin.hsl.s * 0.5 + eyes.hsl.s * 0.25 + hairColor.hsl.s * 0.25;
  const valueScore =
    skin.lab.l * 0.55 + eyes.lab.l * 0.15 + hairColor.lab.l * 0.3;
  const contrastScore =
    Math.abs(luminance(skin.rgb) - luminance(hairColor.rgb)) * 0.7 +
    Math.abs(luminance(skin.rgb) - luminance(eyes.rgb)) * 0.3;

  let warmScore = skin.lab.b - skin.lab.a * 0.15 + hairColor.lab.b * 0.2;
  if (options.hairDyed) warmScore -= hairColor.lab.b * 0.12;
  if (options.wearingMakeup) warmScore *= 0.92;

  const season = chooseSeason({
    warmScore,
    valueScore,
    chromaScore,
    contrastScore,
  });

  const palette = PALETTES[season.toneSubtype] ?? PALETTES["True Summer"];
  const confidenceBase =
    0.56 +
    Math.min(0.16, Math.abs(warmScore) / 100) +
    Math.min(0.12, contrastScore / 400) +
    Math.min(0.1, chromaScore / 250);
  const penalty =
    issues.filter((issue) => issue.severity === "warning").length * 0.06 +
    (options.wearingMakeup ? 0.04 : 0) +
    (options.hairDyed ? 0.03 : 0);
  const confidence = Math.max(0.42, Math.min(0.93, confidenceBase - penalty));
 
  const secondaryPalette =
  PALETTES[SEASON_DEFAULT_SUBTYPE[season.secondarySeason]] ??
  PALETTES["True Summer"];

  const result: AnalysisResult = {
    analysisId: crypto.randomUUID(),
    capturedAt: new Date().toISOString(),
    confidence,
    primarySeason: season.primarySeason,
    secondarySeason: season.secondarySeason,
    toneSubtype: season.toneSubtype,
    undertone: season.undertone,
    value: season.value,
    chroma: season.chroma,
    contrast: season.contrast,
    snapshotDataUrl: canvas.toDataURL("image/jpeg", 0.92),
    qualitySummary: summarizeQuality(issues, brightness.average, blurScore),
    explanations: buildExplanations(
      {
        ...season,
      },
      options,
    ),
    skin,
    eyes,
    hair: hairColor,
    bestColors: palette.best,
    secondaryBestColors: secondaryPalette.best,
    neutralColors: palette.neutrals,
    accentColors: palette.accents,
    avoidColors: palette.avoid,
    clothingRecommendations: palette.clothing,
    jewelryRecommendations: palette.jewelry,
    paletteSummary: palette.summary,
  };

  return { issues, result };
}

export function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

export function groupRecommendations(result: AnalysisResult) {
  const colors: RecommendationItem[] = [
    {
      id: `${result.analysisId}-best-colors`,
      title: "Best color direction",
      description: `${result.bestColors.map((color) => color.name).join(", ")}.`,
      category: "Colors",
      paletteTags: [result.primarySeason, result.toneSubtype],
      image: "Personal palette",
      reason: "These shades are strongest near your face.",
    },
  ];

  return {
    clothing: result.clothingRecommendations.filter(
      (item) => item.category === "Clothing",
    ),
    jewelry: result.clothingRecommendations
      .filter((item) => item.category === "Jewelry")
      .concat(
        result.jewelryRecommendations.map((item, index) => ({
          id: `${result.analysisId}-jewelry-${index}`,
          title: `${item.finish} ${item.metal}`,
          description: `${item.stoneFamily} details work especially well.`,
          category: "Jewelry" as const,
          paletteTags: [result.primarySeason, result.toneSubtype],
          image: "Jewelry match",
          reason: item.reason,
        })),
      ),
    colors: result.clothingRecommendations
      .filter((item) => item.category === "Colors")
      .concat(colors),
  };
}

declare global {
  interface Window {
    FaceDetector?: new (options?: {
      fastMode?: boolean;
      maxDetectedFaces?: number;
    }) => {
      detect(
        source: CanvasImageSource,
      ): Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  }
}
