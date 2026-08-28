import { CropDiseaseDiagnosis, ExpenseCategory, ParsedAITransaction } from '@/types';

/**
 * Client & Server compatible AI Natural Language Parser for farmer inputs in multiple languages.
 * Extracts: Labour, Harvest, Expenses, Sales, and provides a confirmation contract.
 */
export function parseFarmerVoiceText(rawText: string): ParsedAITransaction {
  const text = rawText.trim().toLowerCase();
  const todayIso = new Date().toISOString().split('T')[0];

  // Number extractors
  const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];

  // Keywords in multiple languages (EN, HI, KN, MR, TE, TA)
  const isLabour =
    /worker|labour|mazdoor|majdoor|alu|kamgar|kooli|aalu|kuligal|मजदूर|मजदूरी|ಆಳು|ಕೂಲಿ|कामगार|మజదూర్|కూలీ|ஆட்கள்|கூலி|picking|weeding|spray/i.test(
      text
    );
  const isExpense =
    /spent|expense|kharcha|kharch|fertili|khat|khata|pesticide|dawa|diesel|seed|khedi|dava|mandhu|selavu|செலவு|ಖರ್ಚು|खर्च|విత్తనాలు|fertilizer/i.test(
      text
    );
  const isHarvest =
    /harvest|picked|tudai|todani|boxes|box|peti|koylu|kota|parith|पेटी|पेटियां|ತೊಡಣಿ|ಕೊಯ್ಲು|కోత|பெட்டி|தக்காளி/i.test(
      text
    );
  const isSale =
    /sold|sale|bikri|marata|ammakam|virpanai|mandi|bhav|rate|price|बिक्री|ಮಾರಾಟ|అమ్మకం|விற்பனை/i.test(
      text
    );

  // Default structure
  const result: ParsedAITransaction = {
    intent: 'unknown',
    confidence: 0.85,
    rawText,
    extracted: {
      date: todayIso,
      crop: 'Tomato',
    },
    suggestedAction: 'Review details below',
  };

  // Case 1: Labour + Harvest combo (e.g. "Today 5 workers came and picked 42 boxes. Rate was 50 rupees.")
  if (isLabour && isHarvest && numbers.length >= 2) {
    result.intent = 'labour';
    result.extracted.workerCount = numbers[0] || 5;
    result.extracted.boxes = numbers[1] || 42;
    result.extracted.dailyWage = numbers[2] || 50;
    result.extracted.labourTotal = (result.extracted.workerCount || 0) * (result.extracted.dailyWage || 0);
    result.extracted.workDescription = 'Tomato picking & sorting';
    result.suggestedAction = `Record ${result.extracted.workerCount} workers (₹${result.extracted.dailyWage}/worker) & ${result.extracted.boxes} boxes harvest`;
    return result;
  }

  // Case 2: Expense (e.g. "Spent 3500 on fertilizer" or "3500 खाद पर खर्च हुआ")
  if (isExpense || (text.includes('spent') || text.includes('खर्च') || text.includes('ಖರ್ಚು') || text.includes('செலவு'))) {
    result.intent = 'expense';
    result.extracted.amount = numbers[0] || 0;

    let category: ExpenseCategory = 'Other';
    if (/fertili|khat|khata|खाद|ಗೊಬ್ಬರ|ఎరువు|உரம்/i.test(text)) category = 'Fertilizer';
    else if (/pesticide|fungicide|dawa|dava|दवा|ಔಷಧಿ|మందు|மருந்து/i.test(text)) category = 'Pesticides';
    else if (/seed|beej|bija|విత్తనాలు|விதை/i.test(text)) category = 'Seeds';
    else if (/diesel|petrol|fuel|डिझेल/i.test(text)) category = 'Diesel';
    else if (/tractor|machine|machinery|ट्रॅक्टर/i.test(text)) category = 'Machinery';
    else if (/transport|trolley|tempo|भाड़ा|വാടക/i.test(text)) category = 'Transport';

    result.extracted.category = category;
    result.suggestedAction = `Add ₹${result.extracted.amount} expense under ${category}`;
    return result;
  }

  // Case 3: Harvest / Sales (e.g. "68 boxes at 270 rupees" or "40 पेटी 250 भाव")
  if (numbers.length >= 2) {
    const boxes = numbers[0];
    const rate = numbers[1];
    const gross = boxes * rate;

    result.intent = isSale ? 'sale' : 'harvest';
    result.extracted.boxes = boxes;
    result.extracted.ratePerBox = rate;
    result.extracted.grossAmount = gross;
    result.extracted.estimatedTotal = gross;
    result.suggestedAction = `${boxes} boxes × ₹${rate} = ₹${gross.toLocaleString('en-IN')}`;
    return result;
  }

  // Fallback single number
  if (numbers.length === 1) {
    if (isExpense) {
      result.intent = 'expense';
      result.extracted.amount = numbers[0];
      result.extracted.category = 'Other';
      result.suggestedAction = `Add ₹${numbers[0]} expense`;
    } else if (isHarvest) {
      result.intent = 'harvest';
      result.extracted.boxes = numbers[0];
      result.suggestedAction = `Record ${numbers[0]} boxes harvest`;
    }
  }

  return result;
}

/** Plain-language farming help for the in-app voice assistant. */
export function getAgricultureHelpAnswer(question: string): string {
  const text = question.toLowerCase();
  if (/yellow|yellowing|पीला|पीली|ಹಳದಿ|పసుపు|மஞ்சள்/.test(text)) return 'Yellow leaves may be caused by waterlogging, nitrogen shortage, or leaf disease. Check whether the soil is wet for more than a day and whether older leaves have dark circular spots. Improve drainage and take a clear photo to the Crop Doctor or your local KVK before applying any chemical.';
  if (/pest|insect|worm|borer|whitefly|aphid|कीट|कीड़ा|ಕೀಟ|పురుగు|பூச்சி/.test(text)) return 'First identify the insect and check how many plants are affected. Remove badly damaged leaves or fruits, use yellow sticky traps for sucking pests, and inspect plants in the early morning. Use only a pesticide registered for your crop and pest, follow its label and pre-harvest interval, and ask the local KVK for area-specific advice.';
  if (/water|irrig|drip|rain|drainage|पानी|सिंचाई|ನೀರು|ನೀರಾವರಿ|నీరు|నీటిపారుదల|நீர்|பாசனம்/.test(text)) return 'Keep soil moisture even, not waterlogged. With drip irrigation, use shorter regular cycles and check soil 5 to 8 cm below the surface before watering again. After rain, clear drainage channels and avoid spraying until foliage dries. Adjust the exact schedule for your crop stage, soil, and weather.';
  if (/fertili|manure|npk|nutrient|nitrogen|urea|खाद|उर्वरक|ಗೊಬ್ಬರ|ಎರೆವು|ఎరువు|உரம்/.test(text)) return 'Use a soil test and crop stage to decide nutrition. Do not apply fertilizer only because leaves look weak—overuse can damage roots and reduce flowering. Apply smaller balanced doses through the season, keep irrigation regular, and consult your agriculture officer for the correct product and dose.';
  if (/harvest|pick|storage|market|price|mandi|sale|बाज़ार|मंडी|कटाई|ಕೊಯ್ಲು|ಮಾರುಕಟ್ಟೆ|కోత|మార్కెట్|அறுவடை|சந்தை/.test(text)) return 'Harvest in the cool part of the day, keep produce shaded, sort damaged produce separately, and use clean ventilated crates. Check nearby mandi prices before transport and record transport and commission costs. For long travel, harvest at the maturity stage suitable for the buyer and distance.';
  if (/seed|sow|plant|transplant|nursery|बीज|रोपाई|ಬೀज|ನೆಡುವ|విత్తన|నాట|விதை|நடவு/.test(text)) return 'Start with quality seed or healthy seedlings, use a clean nursery medium, and transplant only after seedlings are hardened. Keep recommended crop spacing so air moves through the plants. During the first week after transplanting, keep soil moist but never waterlogged.';
  return 'I can help with crop problems, pests, irrigation, fertilizer planning, planting, harvesting, storage, mandi prices, farm records, and using this app. Tell me the crop name, the problem, and how long it has been happening. For urgent disease outbreaks or chemical decisions, contact your local Krishi Vigyan Kendra, also called KVK, or agriculture officer.';
}

/**
 * AI Crop Disease Knowledgebase & Diagnostic Expert
 */
export const CROP_DISEASES: Record<string, CropDiseaseDiagnosis> = {
  early_blight: {
    diseaseName: 'Early Blight (Alternaria solani)',
    confidencePercent: 94,
    severity: 'moderate',
    symptoms: [
      'Brown to black concentric rings on older lower leaves (target-board spots)',
      'Yellowing (chlorosis) surrounding the dark spots',
      'Premature defoliation starting from the bottom of the plant canopy',
    ],
    cause: 'Fungal pathogen Alternaria solani, thrives in warm temperatures (24-29°C) with alternating wet and dry periods.',
    organicRemedy: [
      'Spray 5ml/L Neem seed kernel extract (NSKE 5%) or cold-pressed neem oil.',
      'Apply Trichoderma viride / Pseudomonas fluorescens (10g/L) to foliage and root zone.',
      'Remove and safely burn severely affected bottom leaves to prevent spore dispersion.',
    ],
    recommendedChemicalControl: [
      'Spray Mancozeb 75% WP @ 2.5g/L or Chlorothalonil 75% WP @ 2g/L as protective spray.',
      'For active infection: Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L or Nativo (Tebuconazole + Trifloxystrobin) @ 0.7g/L.',
      '⚠️ Strictly follow recommended pre-harvest intervals (PHI) of 3-5 days before picking.',
    ],
    preventiveMeasures: [
      'Avoid overhead sprinkler irrigation; use drip to keep foliage dry.',
      'Maintain proper plant spacing (60cm x 45cm) for good air circulation.',
      'Mulch soil around plants to prevent fungal spores splashing from soil to leaves.',
    ],
    expertDisclaimer:
      'AI image diagnosis is an estimate. Always follow pesticide label instructions, local Krishi Vigyan Kendra (KVK) guidance, and adhere strictly to safe chemical withholding periods.',
  },
  leaf_curl: {
    diseaseName: 'Tomato Leaf Curl Virus (ToLCV)',
    confidencePercent: 91,
    severity: 'high',
    symptoms: [
      'Upward and downward curling of leaf margins',
      'Stunting of plant growth with bushy appearance and shortened internodes',
      'Leathery texture and yellowing of vein margins (vein clearing)',
    ],
    cause: 'Begomovirus transmitted by Whiteflies (Bemisia tabaci).',
    organicRemedy: [
      'Install 20-25 Yellow Sticky Traps per acre at canopy height to capture whiteflies.',
      'Spray 2% fish oil rosin soap or neem oil (10,000 ppm @ 2ml/L) on undersides of leaves.',
      'Rogue out and destroy infected viral plants immediately to protect surrounding crop.',
    ],
    recommendedChemicalControl: [
      'Vector control: Spray Diafenthiuron 50% WP @ 1.25g/L or Acetamiprid 20% SP @ 0.4g/L.',
      'Alternate with Pyriproxyfen 10% EC @ 1.5ml/L to break whitefly breeding cycle.',
    ],
    preventiveMeasures: [
      'Grow border crops of Maize or Jowar (4-5 rows) as natural whitefly barriers.',
      'Use 40-mesh insect-proof nylon nets in nursery beds before transplanting.',
    ],
    expertDisclaimer:
      'AI diagnosis is an advisory estimate. Consult your local agriculture extension officer for area-specific pest thresholds.',
  },
  fruit_borer: {
    diseaseName: 'Tomato Fruit Borer (Helicoverpa armigera)',
    confidencePercent: 96,
    severity: 'high',
    symptoms: [
      'Circular entry boreholes in green and ripening tomatoes with dark fecal pellets (frass)',
      'Fruit rotting and premature dropping',
      'Caterpillars feeding partially inside the tomato fruit',
    ],
    cause: 'Larvae of Helicoverpa armigera moth.',
    organicRemedy: [
      'Install 8-10 Pheromone Traps (Helilure) per acre for monitoring and mass trapping.',
      'Spray Bacillus thuringiensis (Bt kurstaki) @ 2g/L during early larval instar stage.',
      'Release Trichogramma chilonis egg parasitoid cards @ 50,000 eggs/acre.',
    ],
    recommendedChemicalControl: [
      'Spray Chlorantraniliprole 18.5% SC (Coragen) @ 0.3ml/L or Flubendiamide 39.35% SC @ 0.25ml/L.',
      'Emamectin Benzoate 5% SG (Proclaim) @ 0.4g/L in rotation.',
    ],
    preventiveMeasures: [
      'Plant African Marigold (1 row for every 16 rows of tomato) as trap crop.',
      'Handpick and destroy bored fruits during early morning picking rounds.',
    ],
    expertDisclaimer:
      'Always follow proper protective equipment (PPE) guidelines when applying crop protection chemicals.',
  },
  blossom_end_rot: {
    diseaseName: 'Blossom End Rot (Calcium Deficiency / Moisture Stress)',
    confidencePercent: 92,
    severity: 'moderate',
    symptoms: [
      'Water-soaked circular spot at the blossom end (bottom) of the green tomato fruit',
      'Lesion enlarges, darkens, and becomes leathery, sunken, and flat',
      'No fungal spores or insect boreholes observed',
    ],
    cause: 'Physiological disorder caused by localized Calcium (Ca) deficiency in developing fruit tissues, often triggered by irregular irrigation.',
    organicRemedy: [
      'Maintain consistent soil moisture through regular scheduled drip irrigation cycles.',
      'Foliar spray of fermented eggshell-vinegar solution (water-soluble calcium) @ 5ml/L.',
      'Apply organic compost and wood ash around root zones.',
    ],
    recommendedChemicalControl: [
      'Foliar spray of Calcium Nitrate (100% water-soluble) @ 4-5g/L during early flowering and fruit set.',
      'Ensure soil pH is balanced between 6.0 - 6.8 for optimal calcium uptake.',
    ],
    preventiveMeasures: [
      'Mulch beds with silver-black plastic mulch to prevent moisture fluctuation.',
      'Avoid excessive nitrogen fertilizers (especially ammonium forms) which compete with calcium absorption.',
    ],
    expertDisclaimer:
      'Blossom end rot is non-infectious and physiological. Adjust irrigation regularity and calcium fertigation.',
  },
};
