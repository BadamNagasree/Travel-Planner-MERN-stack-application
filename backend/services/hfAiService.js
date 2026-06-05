const dotenv = require('dotenv');
dotenv.config();

// Simple In-Memory Cache with TTL (Time To Live)
const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generates a unique cache key based on inputs
 */
const generateCacheKey = (destination, duration, budget, travelers, preferences) => {
  const normalizedDest = destination.trim().toLowerCase();
  const normalizedPref = [...(preferences || [])].sort().join(',').toLowerCase();
  return `${normalizedDest}_${duration}d_${budget || 'moderate'}_${travelers || '1'}_[${normalizedPref}]`;
};

/**
 * Cleans cache entries that have expired
 */
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
};

/**
 * Generates a realistic dynamic booking URL based on platform and destination/activity
 */
const getRealBookingUrl = (platform, destination, query = '') => {
  const encodedDest = encodeURIComponent(destination);
  const encodedQuery = encodeURIComponent(query);
  
  switch (platform) {
    case 'IRCTC':
      return 'https://www.irctc.co.in/nget/train-search';
    case 'redBus':
      return `https://www.redbus.in/bus-tickets/search?fromCity=${encodedDest}`;
    case 'MakeMyTrip':
      if (query.toLowerCase().includes('flight')) {
        return `https://www.makemytrip.com/flights/`;
      }
      return `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodedDest}`;
    case 'Booking.com':
      return `https://www.booking.com/searchresults.html?ss=${encodedDest}`;
    case 'Zostel':
      return 'https://www.zostel.com/character-search/';
    case 'ASI Monument Portal':
      return 'https://asi.payumoney.com/';
    case 'TripAdvisor':
      return `https://www.tripadvisor.in/Search?q=${encodedDest}`;
    default:
      return `https://www.google.com/search?q=book+${encodedQuery}+in+${encodedDest}`;
  }
};

/**
 * Generates an extremely rich, high-quality, realistic domestic Indian itinerary with Rupee currency (₹).
 * Includes authentic ticket-booking options (IRCTC, redBus, MakeMyTrip, ASI portal, etc.)
 */
const generateFallbackItinerary = (destination, duration, budget, travelers, preferences) => {
  const days = [];
  const prefString = preferences && preferences.length > 0 ? preferences.join(', ') : 'Sightseeing & Culture';
  const isBudget = budget.toLowerCase() === 'budget';
  const isLuxury = budget.toLowerCase() === 'luxury';

  // Budget calculations in INR (₹)
  const mealCost = isBudget ? 150 : isLuxury ? 1200 : 450;
  const stayCost = isBudget ? 600 : isLuxury ? 8000 : 2500;
  const localCabCost = isBudget ? 150 : isLuxury ? 2500 : 900; // Auto-rickshaw vs Private Innova vs Ola/Uber

  // Generate activities custom tailored to popular Indian tourist destinations
  const destLower = destination.toLowerCase();
  
  let morningTemplate = [];
  let afternoonTemplate = [];
  let eveningTemplate = [];

  if (destLower.includes('goa')) {
    morningTemplate = [
      { activity: 'Relax at Baga & Calangute Beach and enjoy shacks', loc: 'North Goa Beaches', price: 0, plat: 'Booking.com', desc: 'Sip on fresh coconut water and walk along the sandy coastline of North Goa.' },
      { activity: 'Visit the historic Aguada Fort & lighthouse', loc: 'Sinquerim, Goa', price: 50, plat: 'ASI Monument Portal', desc: 'Explore the 17th-century Portuguese fort overlooking the Arabian Sea.' },
      { activity: 'Witness the majestic Dudhsagar Waterfalls', loc: 'Mollem National Park', price: 500, plat: 'MakeMyTrip', desc: 'Take a thrilling 4x4 forest jeep safari to the spectacular four-tiered falls.' }
    ];
    afternoonTemplate = [
      { activity: 'Water Sports activities (Jet Ski & Parasailing)', loc: 'Calangute Beach', price: 1500, plat: 'TripAdvisor', desc: 'Indulge in adrenaline-pumping water sports with certified local operators.' },
      { activity: 'Spice Plantation Tour with traditional buffet lunch', loc: 'Ponda', price: 600, plat: 'MakeMyTrip', desc: 'Take a guided walk amongst fresh cardamom, pepper, and vanilla trees, followed by a local Goan buffet.' },
      { activity: 'Explore Latin Quarter of Fontainhas', loc: 'Panaji', price: 0, plat: 'TripAdvisor', desc: 'Stroll past bright yellow, blue, and red Portuguese-style colonial houses and heritage bakeries.' }
    ];
    eveningTemplate = [
      { activity: 'Sunset Mandovi River Cruise with Goan folk dance', loc: 'Panaji Jetty', price: 700, plat: 'MakeMyTrip', desc: 'Sail down the Mandovi river enjoying live music, DJ, and cultural performances.' },
      { activity: 'Explore Anjuna Flea Market and local shacks', loc: 'Anjuna', price: 200, plat: 'TripAdvisor', desc: 'Browse handcrafted jewelry, beachwear, and spices under the stars.' },
      { activity: 'Candlelight Dinner at Thalassa or Curlies beach shack', loc: 'Vagator / Anjuna', price: 1800, plat: 'Booking.com', desc: 'Enjoy excellent seafood, cocktails, and music with panoramic sunset views.' }
    ];
  } else if (destLower.includes('jaipur') || destLower.includes('udaipur') || destLower.includes('rajasthan')) {
    morningTemplate = [
      { activity: 'Explore the grand Amber Fort & Elephant/Jeep ride', loc: 'Amer, Jaipur', price: 200, plat: 'ASI Monument Portal', desc: 'Witness Rajput military architecture and the stunning Sheesh Mahal (Mirror Palace).' },
      { activity: 'Visit the City Palace & museum', loc: 'Old City, Jaipur', price: 300, plat: 'TripAdvisor', desc: 'See royal costumes, weapons, and grand courtyards still inhabited by the royal family.' },
      { activity: 'Scenic Boat ride on Lake Pichola', loc: 'Udaipur', price: 400, plat: 'MakeMyTrip', desc: 'Cruising past the Lake Palace and Jag Mandir island during the cool morning hours.' }
    ];
    afternoonTemplate = [
      { activity: 'See the intricate Hawa Mahal (Palace of Winds)', loc: 'Jaipur Center', price: 50, plat: 'ASI Monument Portal', desc: 'Photograph the famous pink sandstone honeycomb facade with 953 small casements.' },
      { activity: 'Shopping at Johari Bazar & Bapu Bazar', loc: 'Jaipur', price: 0, plat: 'TripAdvisor', desc: 'Shop for authentic bandhani textiles, blue pottery, and silver Rajasthani jewelry.' },
      { activity: 'Visit Jantar Mantar Observatory', loc: 'Jaipur', price: 100, plat: 'ASI Monument Portal', desc: 'Examine the world\'s largest stone sundial and astronomical instruments built in 1734.' }
    ];
    eveningTemplate = [
      { activity: 'Traditional Rajasthani dinner at Chokhi Dhani ethnic village', loc: 'Tonk Road', price: 1100, plat: 'MakeMyTrip', desc: 'Experience puppet shows, camel rides, folk dancing, and an unlimited authentic Rajasthani thali.' },
      { activity: 'Sunset views from Nahargarh Fort', loc: 'Aravalli Hills', price: 100, plat: 'TripAdvisor', desc: 'Catch the breathtaking golden hour skyline view of the entire Pink City.' },
      { activity: 'Cultural folk dance show at Bagore Ki Haveli', loc: 'Gangaur Ghat, Udaipur', price: 150, plat: 'TripAdvisor', desc: 'Watch Rajasthani women performing the famous Dharani and Ghoomar dances with pots.' }
    ];
  } else {
    // General Indian Destination (Kerala, Manali, Varanasi, Munnar, etc.)
    morningTemplate = [
      { activity: `Explore the scenic beauty and prime viewpoints of ${destination}`, loc: `${destination} Hills`, price: 100, plat: 'TripAdvisor', desc: 'Wake up early to catch the misty vistas and crisp mountain/coastal air.' },
      { activity: `Visit historic temples and cultural monuments`, loc: `Heritage Center, ${destination}`, price: 40, plat: 'ASI Monument Portal', desc: 'Pay respects and marvel at the intricate Dravidian or Himalayan wooden architecture.' },
      { activity: `Take a local organic plantation tour`, loc: `Rural ${destination}`, price: 200, plat: 'MakeMyTrip', desc: 'Learn about local agricultural heritage, spices, tea leaves, or local crops.' }
    ];
    afternoonTemplate = [
      { activity: `Enjoy traditional lunch and shopping at local markets`, loc: `Main Bazar, ${destination}`, price: 300, plat: 'redBus', desc: 'Taste local spices and purchase hand-woven woolens, silk, or regional souvenirs.' },
      { activity: `Scenic boat ride or mountain cable car ride`, loc: `${destination} Transit`, price: 450, plat: 'MakeMyTrip', desc: 'Get a bird\'s eye perspective of the lush valleys or waterways.' },
      { activity: `Visit a nearby waterfall and wildlife sanctuary`, loc: `Outskirts of ${destination}`, price: 150, plat: 'TripAdvisor', desc: 'Unwind in nature and observe indigenous Indian flora and fauna.' }
    ];
    eveningTemplate = [
      { activity: `Sunset walk followed by a traditional cultural show`, loc: `${destination} Lake/Riverfront`, price: 250, plat: 'TripAdvisor', desc: 'Experience local evening rituals, aarti, or performing arts.' },
      { activity: `Authentic dinner at a highly-rated regional eatery`, loc: `Downtown ${destination}`, price: 500, plat: 'Booking.com', desc: 'Feast on traditional local culinary masterpieces under local ambient lighting.' },
      { activity: `Campfire session or relaxing stroll under the stars`, loc: `Resort / Stay area`, price: 0, plat: 'Zostel', desc: 'Gather around with fellow travelers to share travel stories and local folklore.' }
    ];
  }

  for (let i = 1; i <= duration; i++) {
    const dayTheme = i === 1 ? 'Arrival & Sightseeing' : i === duration ? 'Final Souvenirs & Departure' : 'Explore & Adventure';
    
    // Pick activities using index cycling
    const morningAct = morningTemplate[i % morningTemplate.length];
    const afternoonAct = afternoonTemplate[i % afternoonTemplate.length];
    const eveningAct = eveningTemplate[i % eveningTemplate.length];

    days.push({
      day: i,
      theme: dayTheme,
      schedule: [
        {
          time: 'Morning',
          activity: morningAct.activity,
          location: morningAct.loc,
          description: morningAct.desc,
          bookingInfo: {
            bookingPlatform: morningAct.plat,
            estimatedCostINR: morningAct.price,
            bookingUrl: getRealBookingUrl(morningAct.plat, destination, morningAct.activity)
          }
        },
        {
          time: 'Afternoon',
          activity: afternoonAct.activity,
          location: afternoonAct.loc,
          description: afternoonAct.desc,
          bookingInfo: {
            bookingPlatform: afternoonAct.plat,
            estimatedCostINR: afternoonAct.price,
            bookingUrl: getRealBookingUrl(afternoonAct.plat, destination, afternoonAct.activity)
          }
        },
        {
          time: 'Evening',
          activity: eveningAct.activity,
          location: eveningAct.loc,
          description: eveningAct.desc,
          bookingInfo: {
            bookingPlatform: eveningAct.plat,
            estimatedCostINR: eveningAct.price,
            bookingUrl: getRealBookingUrl(eveningAct.plat, destination, eveningAct.activity)
          }
        }
      ],
      budgetTip: `Opt for public transportation like KSRTC/HRTC buses (book via redBus) or local shared auto-rickshaws to optimize your local transport cost (est. ₹${localCabCost} saved per day).`
    });
  }

  // Calculate estimated total trip cost
  const estimatedStayTotal = stayCost * duration;
  const estimatedFoodTotal = mealCost * 3 * duration;
  const estimatedActivityTotal = days.reduce((acc, d) => {
    return acc + d.schedule.reduce((sum, s) => sum + s.bookingInfo.estimatedCostINR, 0);
  }, 0);
  const totalTripCostINR = estimatedStayTotal + estimatedFoodTotal + estimatedActivityTotal + (localCabCost * duration);

  return {
    tripTitle: `Ultimate ${duration}-Day Getaway to ${destination}`,
    destination,
    duration,
    budget,
    travelers,
    preferences,
    currency: 'INR (₹)',
    costSummary: {
      estimatedStayTotalINR: estimatedStayTotal,
      estimatedFoodTotalINR: estimatedFoodTotal,
      estimatedActivitiesTotalINR: estimatedActivityTotal,
      estimatedLocalTransportINR: localCabCost * duration,
      estimatedGrandTotalINR: totalTripCostINR
    },
    bookingPartners: {
      trains: 'IRCTC',
      buses: 'redBus',
      flightsAndHotels: 'MakeMyTrip / Booking.com',
      monuments: 'Archaeological Survey of India (ASI)'
    },
    aiGenerated: false,
    aiNote: 'Generated via localized Indian Travel Planner Fallback service.',
    days
  };
};

/**
 * Generate itinerary using Hugging Face Inference API with strict Indian contextual prompt instructions
 */
const generateItinerary = async (destination, duration, budget, travelers, preferences) => {
  cleanExpiredCache();

  const cacheKey = generateCacheKey(destination, duration, budget, travelers, preferences);
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cachedItem = cache.get(cacheKey);
    if (Date.now() - cachedItem.timestamp < CACHE_TTL_MS) {
      console.log('Serving localized Indian itinerary from cache for:', cacheKey);
      return cachedItem.data;
    }
  }

  const hfApiKey = process.env.HF_API_KEY;
  const hfModel = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  if (!hfApiKey || hfApiKey === 'your_huggingface_api_key_here' || hfApiKey.trim() === '') {
    console.warn('Hugging Face API key is missing. Deploying high-fidelity domestic Indian fallback planner.');
    const fallback = generateFallbackItinerary(destination, duration, budget, travelers, preferences);
    cache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return fallback;
  }

  // Advanced Prompt targeting Indian Travel Booking ecosystem & Rupees Currency
  const prefText = preferences && preferences.length > 0 ? preferences.join(', ') : 'sightseeing, local food';
  const prompt = `[INST] You are a premium Indian travel planner and ticket broker. Generate a highly detailed, realistic daily travel itinerary for a domestic trip inside India to the destination "${destination}".

Constraints:
1. Destination must be treated as a location in India.
2. All costs, ticket estimates, and budgets must be strictly calculated and output in Indian Rupees (INR, ₹).
3. The itinerary MUST combine scheduling and booking recommendations. 
4. Include a dedicated "bookingInfo" JSON object for every schedule item.
5. Utilize real-world Indian booking platforms:
   - For trains: "IRCTC" (e.g. Shatabdi, Rajdhani, local express)
   - For buses: "redBus" (e.g. KSRTC, UPSRTC, private Volvo sleeper)
   - For flights/hotels/holiday packages: "MakeMyTrip" or "Booking.com" or "Zostel"
   - For heritage sites (Taj Mahal, Qutub Minar, Forts): "ASI Monument Portal"
   - For cab rental / experiences: "MakeMyTrip" or "TripAdvisor"

Provide the output strictly as a JSON object, without any conversational introduction or markdown fences (do NOT wrap in \`\`\`json). The JSON structure MUST exactly match this format:
{
  "tripTitle": "A catchy descriptive title in Rupees (e.g. Incredible 3-Day Journey to Goa)",
  "destination": "${destination}",
  "duration": ${duration},
  "budget": "${budget}",
  "travelers": "${travelers}",
  "preferences": [${preferences && preferences.length > 0 ? preferences.map(p => `"${p}"`).join(', ') : ''}],
  "currency": "INR (₹)",
  "costSummary": {
    "estimatedStayTotalINR": 4500,
    "estimatedFoodTotalINR": 2400,
    "estimatedActivitiesTotalINR": 1800,
    "estimatedLocalTransportINR": 1500,
    "estimatedGrandTotalINR": 10200
  },
  "bookingPartners": {
    "trains": "IRCTC",
    "buses": "redBus",
    "flightsAndHotels": "MakeMyTrip / Booking.com",
    "monuments": "Archaeological Survey of India (ASI)"
  },
  "aiGenerated": true,
  "days": [
    {
      "day": 1,
      "theme": "Theme of the day (e.g. Heritage & Street Food)",
      "schedule": [
        {
          "time": "Morning / Afternoon / Evening",
          "activity": "Activity name (e.g. Guided tour of Amber Fort)",
          "location": "Exact landmark location",
          "description": "Engaging description customized for an Indian domestic tourist, referencing local details, transport (auto-rickshaw, cab, walk) and experiences.",
          "bookingInfo": {
            "bookingPlatform": "ASI Monument Portal / IRCTC / redBus / MakeMyTrip / Booking.com / TripAdvisor / Pay on Spot",
            "estimatedCostINR": 200,
            "bookingUrl": "https://asi.payumoney.com/"
          }
        }
      ],
      "budgetTip": "A money-saving tip in Indian Rupees, suggesting street foods, local transit, or ticket deals."
    }
  ]
}
[/INST]`;

  try {
    console.log(`Requesting Indian travel itinerary from Hugging Face model: ${hfModel}...`);
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1800,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    let generatedText = '';

    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      generatedText = result[0].generated_text.trim();
    } else if (result.generated_text) {
      generatedText = result.generated_text.trim();
    } else if (typeof result === 'string') {
      generatedText = result.trim();
    } else {
      throw new Error('Unexpected response format from Hugging Face API');
    }

    // Strip markdown JSON wrapper block tags if present
    let jsonString = generatedText;
    if (jsonString.includes('```')) {
      const match = jsonString.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        jsonString = match[1].trim();
      } else {
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      }
    }

    try {
      const parsedItinerary = JSON.parse(jsonString);
      
      // Inject standard domestic booking URLs if not already present or dynamic
      if (parsedItinerary.days) {
        parsedItinerary.days.forEach(d => {
          if (d.schedule) {
            d.schedule.forEach(s => {
              if (s.bookingInfo && (!s.bookingInfo.bookingUrl || s.bookingInfo.bookingUrl.startsWith('http'))) {
                s.bookingInfo.bookingUrl = getRealBookingUrl(
                  s.bookingInfo.bookingPlatform, 
                  destination, 
                  s.activity
                );
              }
            });
          }
        });
      }

      cache.set(cacheKey, { data: parsedItinerary, timestamp: Date.now() });
      return parsedItinerary;
    } catch (parseError) {
      console.error('Failed to parse AI-generated JSON. Content was:', generatedText);
      console.warn('Parsing failed. Falling back to the localized Indian procedural generator...');
      const fallback = generateFallbackItinerary(destination, duration, budget, travelers, preferences);
      return fallback;
    }

  } catch (err) {
    console.error('Error generating Indian itinerary via Hugging Face:', err.message);
    console.log('Deploying high-quality domestic Indian procedural generator.');
    
    const fallback = generateFallbackItinerary(destination, duration, budget, travelers, preferences);
    cache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return fallback;
  }
};

module.exports = {
  generateItinerary,
  generateFallbackItinerary
};
