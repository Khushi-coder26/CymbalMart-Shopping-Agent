import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Requests will fail if API is called.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Party Planning Generator Endpoint
app.post("/api/plan-party", async (req, res) => {
  try {
    const {
      title,
      eventType,
      theme,
      guestAdults = 10,
      guestKids = 0,
      drinkerCount = 8,
      durationHours = 3,
      dietary = [],
      budgetTier = "balanced",
      targetBudget = 250,
      venueNotes = "",
      customPreferences = "",
    } = req.body;

    const ai = getAI();

    const prompt = `You are the CymbalMart AI Party Planner & Shopping Assistant Agent.
Create a comprehensive, mathematically sound, highly realistic party plan and grocery/supplies shopping list for the following event at CymbalMart:

Event Details:
- Title / Occasion: ${title || eventType}
- Event Type: ${eventType}
- Theme / Atmosphere: ${theme || "Festive & fun"}
- Guests: ${guestAdults} Adults (${drinkerCount} drinkers, ${guestAdults - drinkerCount} non-drinkers), ${guestKids} Kids. Total = ${guestAdults + guestKids} people.
- Party Duration: ${durationHours} hours
- Dietary Restrictions: ${dietary.length > 0 ? dietary.join(", ") : "None specified"}
- Budget Tier: ${budgetTier} (Target budget: $${targetBudget})
- Venue & Kitchen: ${venueNotes || "Standard home kitchen"}
- Special Requests: ${customPreferences || "None"}

Please calculate realistic food and beverage rations using proven host industry formulas:
1. Drinks: ~2 drinks per guest for hour 1, ~1 drink/hour after. Split between beer, wine, cocktails, soda, sparkling water, ice (~1.5 lbs ice per person).
2. Food: 5-6 appetizer bites per person if before dinner, or generous main portions (6-8 oz protein per person, 2-3 sides, rolls/bread, desserts).
3. Organized CymbalMart Shopping List: Categorized into CymbalMart store aisles:
   - Produce (Aisle 1)
   - Bakery & Bread (Aisle 2)
   - Meat & Seafood (Aisle 4)
   - Dairy & Refrigerated (Aisle 5)
   - Pantry & Dry Goods (Aisle 6)
   - Snacks & Sweets (Aisle 7)
   - Beverages & Mixers (Aisle 8)
   - Alcohol & Wine (Aisle 9)
   - Ice & Frozen (Aisle 10)
   - Tableware & Disposables (Aisle 11)
   - Decorations & Ambience (Aisle 12)
4. Realistic estimated CymbalMart prices ($) per item. Include potential savings ($) if selecting CymbalMart Private Label / Great Value brands.
5. Provide a realistic host run-of-show prep timeline (3 days before, 1 day before, day of, 1 hour before).
6. Provide specific budget saving tips and signature party highlights.

Return ONLY valid JSON strictly matching the requested format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            theme: { type: Type.STRING },
            eventType: { type: Type.STRING },
            targetBudget: { type: Type.NUMBER },
            estimatedTotalCost: { type: Type.NUMBER },
            vibesAndHighlights: {
              type: Type.OBJECT,
              properties: {
                colorPalette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 to 5 hex colors or color names",
                },
                musicSuggestion: { type: Type.STRING },
                signatureWelcome: { type: Type.STRING },
                hostTip: { type: Type.STRING },
              },
              required: ["colorPalette", "musicSuggestion", "signatureWelcome", "hostTip"],
            },
            menu: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  course: { type: Type.STRING, description: "Appetizer, Main, Side, Dessert, Beverage" },
                  description: { type: Type.STRING },
                  dietary: { type: Type.ARRAY, items: { type: Type.STRING } },
                  isSignature: { type: Type.BOOLEAN },
                },
                required: ["name", "course", "description", "dietary"],
              },
            },
            drinkCalculations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "e.g. Wine, Beer, Signature Cocktail, Non-Alcoholic, Ice" },
                  recommendedAmount: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  bottlesOrCansEstimate: { type: Type.STRING },
                },
                required: ["category", "recommendedAmount", "notes", "bottlesOrCansEstimate"],
              },
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeframe: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["timeframe", "tasks"],
              },
            },
            shoppingList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: "Produce, Meat & Seafood, Dairy & Refrigerated, Bakery & Bread, Pantry & Dry Goods, Beverages & Mixers, Alcohol & Wine, Ice & Frozen, Tableware & Disposables, Decorations & Ambience, Snacks & Sweets",
                  },
                  aisleNumber: { type: Type.NUMBER, description: "CymbalMart aisle number 1 to 12" },
                  aisleName: { type: Type.STRING, description: "e.g. Aisle 1: Fresh Produce" },
                  quantity: { type: Type.STRING, description: "e.g. 3 lbs, 2 bottles (750ml), 4 packs of 12" },
                  estimatedCost: { type: Type.NUMBER, description: "Estimated USD cost" },
                  isMustHave: { type: Type.BOOLEAN },
                  isCymbalBrand: { type: Type.BOOLEAN, description: "Whether this is CymbalMart Private Label" },
                  cymbalBrandSavings: { type: Type.NUMBER, description: "Dollar savings versus national name brand" },
                  recommendedStore: {
                    type: Type.STRING,
                    description: "CymbalMart Supercenter, CymbalMart Express, CymbalMart Spirits & Beverage, CymbalMart Party Supply",
                  },
                  notes: { type: Type.STRING },
                  unitPortionExplanation: { type: Type.STRING },
                  dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "category", "quantity", "estimatedCost", "isMustHave", "recommendedStore"],
              },
            },
            budgetSavingsTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "title",
            "theme",
            "eventType",
            "estimatedTotalCost",
            "vibesAndHighlights",
            "menu",
            "drinkCalculations",
            "timeline",
            "shoppingList",
            "budgetSavingsTips",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");

    // Add unique IDs and checked flags to shopping items
    if (parsedData.shoppingList && Array.isArray(parsedData.shoppingList)) {
      parsedData.shoppingList = parsedData.shoppingList.map((item: any, idx: number) => ({
        ...item,
        id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        checked: false,
      }));
    }

    res.json({
      success: true,
      plan: {
        id: `plan-${Date.now()}`,
        guestCount: {
          adults: Number(guestAdults),
          kids: Number(guestKids),
          drinkers: Number(drinkerCount),
          nonDrinkers: Number(guestAdults) - Number(drinkerCount),
        },
        durationHours: Number(durationHours),
        dietaryRequirements: dietary,
        budgetTier,
        targetBudget: Number(targetBudget),
        createdAt: new Date().toISOString(),
        ...parsedData,
      },
    });
  } catch (error: any) {
    console.error("Error generating party plan:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate party plan with AI",
    });
  }
});

// Interactive CymbalMart Assistant Chat Endpoint
app.post("/api/chat-agent", async (req, res) => {
  try {
    const { message, planContext, history = [] } = req.body;

    const ai = getAI();

    const systemPrompt = `You are "CymbalMart Assistant", the friendly, knowledgeable, and expert customer service & party shopping AI for CymbalMart.
You interact directly with CymbalMart customers, party hosts, and shoppers.

Customer Event Context (if currently planning an event):
- Title: ${planContext?.title || "Customer Party"}
- Theme: ${planContext?.theme || "General Gathering"}
- Guests: ${planContext?.guestCount?.adults || 10} Adults, ${planContext?.guestCount?.kids || 0} Kids (${planContext?.guestCount?.drinkers || 8} Drinkers)
- Duration: ${planContext?.durationHours || 3} hours
- Target Budget: $${planContext?.targetBudget || 200}
- Current Total: $${planContext?.estimatedTotalCost || 200}
- Dietary restrictions: ${planContext?.dietaryRequirements?.join(", ") || "None"}
- Number of items in shopping list: ${planContext?.shoppingList?.length || 0}

CymbalMart Store Knowledge:
- Aisles:
  * Aisle 1: Fresh Produce (Organic & farm fresh veggies, fruits, herbs, garnishes)
  * Aisle 2: Bakery & Fresh Bread (Buns, artisan sourdough, tortillas, desserts)
  * Aisle 3: Deli & Prepared Foods (Charcuterie cuts, cheese wheels, dips, rotisserie)
  * Aisle 4: Meat & Fresh Seafood (Ribeyes, ground beef, chicken wings, salmon, shrimp)
  * Aisle 5: Dairy, Eggs & Cheese (Milk, butter, shredded cheddar, artisanal cheese)
  * Aisle 6: Pantry, Sauces & Oils (BBQ sauces, olive oil, spices, canned goods, pasta)
  * Aisle 7: Snacks, Chips & Sweets (Tortilla chips, pretzels, nuts, chocolates, cookies)
  * Aisle 8: Beverages & Mixers (Seltzers, sodas, tonics, craft colas, fruit juices)
  * Aisle 9: Spirits, Craft Beer & Wine (Bourbon, tequila, vodka, pinot noir, IPA beers)
  * Aisle 10: Ice & Frozen Goods (Party ice bags 10lb/20lb, cocktail craft cubes, frozen apps)
  * Aisle 11: Tableware & Disposables (Eco compostable plates, cups, cutlery, napkins, tablecloths)
  * Aisle 12: Ambience & Party Supplies (Balloons, banners, string lights, streamers)

- Customer Service Policies:
  * Curbside Pickup: Free on orders over $35, ready in 2 hours with dedicated parking spots #1-8.
  * 1-Hour Express Delivery: $4.99 or free for CymbalMart Plus members.
  * Brand Guarantee: "CymbalMart Great Value" private label offers 100% money-back satisfaction guarantee and saves 20-30% on groceries.
  * Bar Math Standard: 2 drinks per guest for hour 1, 1 drink/hour after. 1.5 lbs of ice per person (coolers + drinks).

Your Objectives:
1. Greet the customer warmly as "CymbalMart Assistant".
2. Provide exact, helpful answers to their questions (recipes, aisle locations, portion sizing, budget cutting, dietary swaps, customer service questions).
3. If recommending specific products or ingredients the customer might want to add to their shopping list, provide them in the suggestedItems array with realistic CymbalMart pricing, aisle number, and whether it has a CymbalMart private label version.
4. Format your markdown response with clean bullet points, bold key terms, and helpful emoji markers.

Return ONLY a JSON object with:
- "reply": Markdown formatted string with your friendly response to the customer.
- "suggestedItems": Array of concrete grocery items (optional, only if customer asks for recommendations or ingredient additions). Each item has: { "name": string, "category": string, "aisleNumber": number, "aisleName": string, "quantity": string, "estimatedCost": number, "isMustHave": boolean, "isCymbalBrand": boolean, "cymbalBrandSavings": number, "recommendedStore": string, "notes": string }
- "suggestedPrompts": Array of 3 short relevant follow-up questions/prompts the customer can click next.
- "topicCategory": One of "aisle", "budget", "bar_math", "dietary", "fulfillment", "recipe", "general".`;

    const chatMessages = [
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: chatMessages as any,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  aisleNumber: { type: Type.NUMBER },
                  aisleName: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  isMustHave: { type: Type.BOOLEAN },
                  isCymbalBrand: { type: Type.BOOLEAN },
                  cymbalBrandSavings: { type: Type.NUMBER },
                  recommendedStore: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ["name", "category", "quantity", "estimatedCost"],
              },
            },
            suggestedPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            topicCategory: { type: Type.STRING },
          },
          required: ["reply", "suggestedPrompts"],
        },
      },
    });

    let resultData: any = {};
    try {
      resultData = JSON.parse(response.text || "{}");
    } catch (e) {
      resultData = { reply: response.text || "How may I help you at CymbalMart today?" };
    }

    res.json({
      success: true,
      reply: resultData.reply || "I am your CymbalMart Assistant, here to help!",
      suggestedItems: resultData.suggestedItems || [],
      suggestedPrompts: resultData.suggestedPrompts || [
        "Where is the organic produce?",
        "How much ice do I need?",
        "Suggest vegan party snacks",
        "How does curbside pickup work?",
      ],
      topicCategory: resultData.topicCategory || "general",
    });
  } catch (error: any) {
    console.error("Error in CymbalMart Assistant chat agent:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get CymbalMart Assistant response",
    });
  }
});

// Quick Recipe / Signature Cocktail Generator
app.post("/api/suggest-cocktail", async (req, res) => {
  try {
    const { theme, spirit, isMocktail = false, guestCount = 10 } = req.body;
    const ai = getAI();

    const prompt = `Create a bespoke signature ${isMocktail ? "Mocktail" : "Cocktail"} recipe tailored for a party with theme: "${theme || "Celebration"}".
Preferred base: ${spirit || "Any crowd-pleasing spirit/base"}.
Scaled for a punch bowl / batch for ${guestCount} guests.

Provide:
1. Creative drink name
2. Flavor profile (e.g. Citrus, Refreshing, Floral, Smoky)
3. Exact batch ingredients with grocery store measurements
4. Simple batch preparation instructions (make-ahead friendly)
5. Garnish & presentation tips`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drinkName: { type: Type.STRING },
            flavorProfile: { type: Type.STRING },
            isMocktail: { type: Type.BOOLEAN },
            servingCount: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  batchAmount: { type: Type.STRING },
                  estCost: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                },
                required: ["name", "batchAmount", "estCost"],
              },
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            garnishTip: { type: Type.STRING },
          },
          required: ["drinkName", "flavorProfile", "ingredients", "instructions", "garnishTip"],
        },
      },
    });

    res.json({
      success: true,
      cocktail: JSON.parse(response.text || "{}"),
    });
  } catch (error: any) {
    console.error("Error generating cocktail:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate drink idea",
    });
  }
});

// Budget Optimizer Endpoint
app.post("/api/optimize-budget", async (req, res) => {
  try {
    const { shoppingList, currentTotal, targetBudget } = req.body;
    const ai = getAI();

    const prompt = `Review this party shopping list with total cost $${currentTotal} and target budget $${targetBudget}.
Shopping items:
${JSON.stringify(shoppingList?.slice(0, 30) || [])}

Provide 4-5 high-impact, clever cost-saving swaps and efficiency tips to bring costs down without hurting guest experience (e.g., bulk store swaps, DIY vs pre-made, seasonal substitutions).
Also identify which 3 items are biggest "Budget Busters" and propose direct alternatives.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            potentialSavings: { type: Type.NUMBER, description: "Estimated dollars saved" },
            budgetBusters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalItem: { type: Type.STRING },
                  proposedSwap: { type: Type.STRING },
                  estimatedSavings: { type: Type.NUMBER },
                  rationale: { type: Type.STRING },
                },
                required: ["originalItem", "proposedSwap", "estimatedSavings", "rationale"],
              },
            },
            smartShoppingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["potentialSavings", "budgetBusters", "smartShoppingTips"],
        },
      },
    });

    res.json({
      success: true,
      optimization: JSON.parse(response.text || "{}"),
    });
  } catch (error: any) {
    console.error("Error optimizing budget:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to optimize budget",
    });
  }
});

// Voice Control Intent Parser Endpoint
app.post("/api/voice-command", async (req, res) => {
  try {
    const { transcript, planContext, currentTab } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ success: false, error: "Transcript is required" });
    }

    const ai = getAI();

    const prompt = `You are the CymbalMart AI Voice Control Agent.
The user is speaking a voice command hands-free while planning or shopping for a party at CymbalMart.
Current Active Tab: "${currentTab || "review"}"
Current Party Context:
- Plan Title: ${planContext?.title || "None"}
- Target Budget: $${planContext?.targetBudget || 200}
- Current Total: $${planContext?.estimatedTotalCost || 200}
- Guest Count: ${planContext?.guestCount?.adults || 10} Adults, ${planContext?.guestCount?.kids || 0} Kids
- Items in Shopping List (${planContext?.shoppingList?.length || 0} items):
${JSON.stringify(
  (planContext?.shoppingList || []).slice(0, 25).map((i: any) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    cost: i.estimatedCost,
    checked: i.checked,
    category: i.category,
    aisleNumber: i.aisleNumber,
  }))
)}

User Spoken Command: "${transcript}"

Analyze what the user wants to accomplish and output structured JSON instructions to execute their intent hands-free.

Possible Action Types:
1. "NAVIGATE_TAB": payload { "tab": "define" | "review" | "refine_checkout" | "menu" | "timeline" | "overview" }
2. "CREATE_OR_UPDATE_PLAN": payload { "title": string, "eventType": string, "guestAdults": number, "guestKids": number, "drinkerCount": number, "durationHours": number, "targetBudget": number, "dietary": string[], "theme": string }
3. "SET_TARGET_BUDGET": payload { "targetBudget": number }
4. "SET_GUEST_COUNT": payload { "adults": number, "kids": number }
5. "ADD_SHOPPING_ITEM": payload { "name": string, "quantity": string, "category": string, "aisleNumber": number, "estimatedCost": number, "isMustHave": boolean, "isCymbalBrand": boolean, "notes": string }
6. "REMOVE_SHOPPING_ITEM": payload { "itemNameOrId": string }
7. "TOGGLE_ITEM_CHECK": payload { "itemNameOrId": string, "checked": boolean }
8. "STEP_ITEM_QUANTITY": payload { "itemNameOrId": string, "direction": "inc" | "dec", "amount": number }
9. "SWITCH_ALL_CYMBAL_BRAND": payload {}
10. "SCALE_ALL_ITEMS": payload { "multiplier": number } (e.g. 0.9 for 10% trim, 1.15 for 15% buffer)
11. "CHECK_ALL_ITEMS": payload { "checked": boolean }
12. "SELECT_FULFILLMENT": payload { "method": "pickup" | "delivery", "timeSlot"?: string, "address"?: string, "storeName"?: string }
13. "COMPLETE_CHECKOUT": payload {}
14. "OPEN_MODAL": payload { "modal": "create_party" | "add_custom_item" | "budget_optimizer" | "print_export" | "chat_assistant" | "voice_help" | "close_all" }
15. "APPLY_DIETARY_SUB": payload { "restriction": "Gluten-Free" | "Vegetarian" | "Dairy-Free" }
16. "ANSWER_QUESTION": payload { "answer": string }

Generate:
1. "spokenReply": A crisp, friendly 1-2 sentence spoken reply to be read aloud via Text-To-Speech (e.g. "I added 2 packs of Brioche Buns to Aisle 2 and updated your total.", "Navigating to your CymbalMart shopping list.", "Your order for Curbside Pickup has been placed!").
2. "detectedIntent": A short human-readable label (e.g. "Added Brioche Buns", "Switched to Curbside Pickup", "Checked off items").
3. "actions": Array of action objects { "type": string, "payload": object }.
4. "suggestedFollowUps": Array of 2-3 short voice follow-ups the user might say next.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spokenReply: { type: Type.STRING },
            detectedIntent: { type: Type.STRING },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  payload: {
                    type: Type.OBJECT,
                    properties: {
                      tab: { type: Type.STRING },
                      title: { type: Type.STRING },
                      eventType: { type: Type.STRING },
                      guestAdults: { type: Type.NUMBER },
                      guestKids: { type: Type.NUMBER },
                      drinkerCount: { type: Type.NUMBER },
                      durationHours: { type: Type.NUMBER },
                      targetBudget: { type: Type.NUMBER },
                      theme: { type: Type.STRING },
                      adults: { type: Type.NUMBER },
                      kids: { type: Type.NUMBER },
                      name: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      category: { type: Type.STRING },
                      aisleNumber: { type: Type.NUMBER },
                      estimatedCost: { type: Type.NUMBER },
                      isMustHave: { type: Type.BOOLEAN },
                      isCymbalBrand: { type: Type.BOOLEAN },
                      notes: { type: Type.STRING },
                      itemNameOrId: { type: Type.STRING },
                      checked: { type: Type.BOOLEAN },
                      direction: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      multiplier: { type: Type.NUMBER },
                      method: { type: Type.STRING },
                      timeSlot: { type: Type.STRING },
                      address: { type: Type.STRING },
                      storeName: { type: Type.STRING },
                      modal: { type: Type.STRING },
                      restriction: { type: Type.STRING },
                      answer: { type: Type.STRING },
                    },
                  },
                },
                required: ["type"],
              },
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["spokenReply", "detectedIntent", "actions"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    res.json({
      success: true,
      spokenReply: result.spokenReply || "Command processed.",
      detectedIntent: result.detectedIntent || "Voice Command",
      actions: result.actions || [],
      suggestedFollowUps: result.suggestedFollowUps || [],
    });
  } catch (error: any) {
    console.error("Error in voice command intent parser:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process voice command",
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Party Planner Shopping Agent running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
