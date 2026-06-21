import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { z } from "zod";
import { askGeminiPro, askGeminiVision } from "./gemini";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const auth = admin.auth();

db.settings({ ignoreUndefinedProperties: true });

interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  role: "citizen" | "admin";
}

/**
 * Authentication helper verifying ID Tokens in Authorization header (doesn't abort response on fail)
 */
async function verifyRequestUser(req: any): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = (decodedToken.role as "citizen" | "admin") || "citizen";
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role,
    };
  } catch (error) {
    console.error("Token verification failed in Functions:", error);
    return null;
  }
}

// ==========================================
// 1. Session & Registration Endpoint
// ==========================================
export const session = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const user = await verifyRequestUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const RegistrationSchema = z.object({
      displayName: z.string().min(1).max(100).optional(),
    });
    const parsed = RegistrationSchema.safeParse(req.body || {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload format", details: parsed.error.issues });
      return;
    }

    const userRef = db.collection("users").doc(user.uid);
    const doc = await userRef.get();
    let userRole = user.role;
    let userData = {};

    if (!doc.exists) {
      userData = {
        uid: user.uid,
        email: user.email || "",
        displayName: parsed.data.displayName || user.name || "Eco Citizen",
        role: "citizen",
        createdAt: new Date(),
      };
      await userRef.set(userData);
      userRole = "citizen";
    } else {
      userData = doc.data() || {};
      userRole = (userData as { role?: "citizen" | "admin" }).role || "citizen";
    }

    res.json({
      message: "Session authenticated successfully",
      user: {
        uid: user.uid,
        email: user.email,
        role: userRole,
        ...userData,
      },
    });
  } catch (error) {
    console.error("Session Function error:", error);
    res.status(500).json({ error: "Internal server registry error" });
  }
});

// ==========================================
// 2. Carbon Calculator Endpoint
// ==========================================
export const calculateCarbon = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const user = await verifyRequestUser(req);

  try {
    const CalculatorSchema = z.object({
      transport: z.object({
        carType: z.enum(["ice", "ev", "none"]),
        carMiles: z.number().nonnegative(),
        transitMiles: z.number().nonnegative(),
        flightHours: z.number().nonnegative(),
      }),
      electricity: z.object({
        kwh: z.number().nonnegative(),
        renewablePct: z.number().min(0).max(100),
      }),
      water: z.object({
        gallons: z.number().nonnegative(),
      }),
      food: z.object({
        dietType: z.enum(["meat-heavy", "balanced", "vegetarian", "vegan"]),
      }),
      shopping: z.object({
        spendAmount: z.number().nonnegative(),
      }),
      waste: z.object({
        bags: z.number().nonnegative(),
        recycled: z.boolean(),
        composted: z.boolean(),
      }),
    });

    const parsed = CalculatorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid calculation input data", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;

    let transportEmissions = 0;
    if (data.transport.carType === "ice") {
      transportEmissions += (data.transport.carMiles * 0.4) / 30;
    } else if (data.transport.carType === "ev") {
      transportEmissions += (data.transport.carMiles * 0.12) / 30;
    }
    transportEmissions += (data.transport.transitMiles * 0.05) / 30;
    transportEmissions += (data.transport.flightHours * 90) / 365;

    const carbonPerKwh = 0.38;
    const offsetMultiplier = (100 - data.electricity.renewablePct) / 100;
    const electricityEmissions = (data.electricity.kwh * carbonPerKwh * offsetMultiplier) / 30;

    const waterEmissions = (data.water.gallons * 0.003) / 30;

    let foodEmissions = 5.5;
    if (data.food.dietType === "vegan") foodEmissions = 2.0;
    else if (data.food.dietType === "vegetarian") foodEmissions = 3.5;
    else if (data.food.dietType === "balanced") foodEmissions = 5.5;
    else if (data.food.dietType === "meat-heavy") foodEmissions = 8.5;

    const shoppingEmissions = (data.shopping.spendAmount * 0.15) / 30;

    let wasteEmissions = (data.waste.bags * 1.2) / 30;
    if (data.waste.recycled) wasteEmissions *= 0.7;
    if (data.waste.composted) wasteEmissions *= 0.8;

    const dailyCarbon = parseFloat((transportEmissions + electricityEmissions + waterEmissions + foodEmissions + shoppingEmissions + wasteEmissions).toFixed(2));
    const monthlyCarbon = parseFloat((dailyCarbon * 30).toFixed(2));
    const annualCarbon = parseFloat(((dailyCarbon * 365) / 1000).toFixed(2));

    const score = Math.max(10, Math.min(100, Math.round(100 - (dailyCarbon * 2.2))));

    if (user) {
      const activityRef = db.collection("activities").doc();
      await activityRef.set({
        id: activityRef.id,
        userId: user.uid,
        type: "calculator_log",
        details: { ...data, dailyCarbon },
        carbon: dailyCarbon,
        timestamp: new Date(),
      });

      await db.collection("carbonHistory").doc(user.uid).set({
        userId: user.uid,
        dailyCarbon,
        monthlyCarbon,
        annualCarbon,
        updatedAt: new Date(),
      });

      await db.collection("ecoProfiles").doc(user.uid).set({
        userId: user.uid,
        score,
        updatedAt: new Date(),
      }, { merge: true });
    }

    res.json({ dailyCarbon, monthlyCarbon, annualCarbon, sustainabilityScore: score });
  } catch (error) {
    console.error("Carbon calculation Function error:", error);
    res.status(500).json({ error: "Internal arithmetic calculator error" });
  }
});

// ==========================================
// 3. AI Mentor Endpoint
// ==========================================
export const mentor = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const user = await verifyRequestUser(req);

  try {
    const MentorSchema = z.object({ message: z.string().min(1).max(500) });
    const parsed = MentorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid question query", details: parsed.error.issues });
      return;
    }

    let statsContext = "Guest user context. General advice.";
    if (user) {
      const historyDoc = await db.collection("carbonHistory").doc(user.uid).get();
      if (historyDoc.exists) {
        const data = historyDoc.data();
        statsContext = `Daily: ${data?.dailyCarbon} kg CO2e, Monthly: ${data?.monthlyCarbon} kg, Annual: ${data?.annualCarbon} Tonnes.`;
      }
    }

    const systemInstruction = `You are HariTva's AI Sustainability Mentor.
User context: ${statsContext}.
Answer concisely. Return valid JSON only matching:
{
  "reply": "Main textual guidance advice.",
  "suggestions": ["Task 1", "Task 2"]
}`;

    const rawResponse = await askGeminiPro(parsed.data.message, systemInstruction);
    let parsedJson;
    try {
      parsedJson = JSON.parse(rawResponse);
    } catch {
      parsedJson = { reply: rawResponse, suggestions: ["Avoid single-passenger car transit.", "Optimize HVAC settings."] };
    }

    if (user) {
      await db.collection("activities").add({
        userId: user.uid,
        type: "ai_dialogue",
        details: { question: parsed.data.message, reply: parsedJson.reply },
        timestamp: new Date(),
      });
    }

    res.json(parsedJson);
  } catch (error) {
    console.error("AI Mentor Function error:", error);
    res.status(500).json({ error: "Failed to consult AI Mentor" });
  }
});

// ==========================================
// 4. Daily Mission Generator Endpoint
// ==========================================
export const generateMission = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const user = await verifyRequestUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const historyDoc = await db.collection("carbonHistory").doc(user.uid).get();
    let statsSummary = "No historical logs.";
    if (historyDoc.exists) {
      const data = historyDoc.data();
      statsSummary = `Daily emission: ${data?.dailyCarbon} kg, Monthly: ${data?.monthlyCarbon} kg.`;
    }

    const activitiesSnapshot = await db
      .collection("activities")
      .where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .limit(3)
      .get();

    let habitsContext = "";
    activitiesSnapshot.forEach((doc) => {
      const act = doc.data();
      habitsContext += `Logged activity type: ${act.type} with carbon intensity ${act.carbon} kg. `;
    });

    const prompt = `Based on these metrics: ${statsSummary} and recent habits: ${habitsContext || "None logged yet"}, generate ONE daily sustainability mission.
Return valid JSON matching:
{
  "description": "Short action item.",
  "carbonReduction": 3.4, // Floating point number of kg CO2 saved
  "moneySaved": 2.50,    // Floating point number of dollars saved
  "difficulty": "easy"  // MUST be "easy", "medium", or "hard"
}`;

    const rawResult = await askGeminiPro(prompt, "You are a green coach. Return JSON only.");
    let missionData;
    try {
      missionData = JSON.parse(rawResult);
    } catch {
      missionData = { description: "Unplug high-draw standby devices when not in use.", carbonReduction: 1.2, moneySaved: 0.85, difficulty: "easy" };
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const missionRef = db.collection("missions").doc();
    const missionRecord = {
      id: missionRef.id,
      userId: user.uid,
      description: missionData.description,
      carbonReduction: parseFloat(missionData.carbonReduction) || 1.0,
      moneySaved: parseFloat(missionData.moneySaved) || 0.5,
      difficulty: missionData.difficulty || "easy",
      completed: false,
      date: dateStr,
      createdAt: new Date(),
    };

    await missionRef.set(missionRecord);
    res.json(missionRecord);
  } catch (error) {
    console.error("Daily Mission Function error:", error);
    res.status(500).json({ error: "Failed to generate daily AI mission" });
  }
});

// ==========================================
// 5. Vision AI Scanner Endpoint
// ==========================================
export const scanVision = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const user = await verifyRequestUser(req);

  try {
    const VisionScanSchema = z.object({
      image: z.string().min(10),
      mimeType: z.string().min(3),
      type: z.enum(["product", "waste", "food", "receipt", "electricity_bill"]),
    });

    const parsed = VisionScanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid Vision payload parameters", details: parsed.error.issues });
      return;
    }

    const { image, mimeType, type } = parsed.data;

    let prompt = "";
    if (type === "receipt") {
      prompt = `Analyze receipt. Format valid JSON: { "store": "Store Name", "date": "MM/DD/YYYY", "items": [{ "name": "Item Description", "carbon": "0.5 kg CO2e", "green": true }], "totalCarbon": "12.4 kg CO2e", "offsetOffer": "$0.25" }`;
    } else if (type === "electricity_bill") {
      prompt = `Analyze bill. Format valid JSON: { "billingPeriod": "range", "consumption": "320 kWh", "dailyAvg": "10.6 kWh", "carbonEmitted": "121.6 kg CO2e", "efficiencyGrade": "A", "suggestions": ["Tip 1"] }`;
    } else if (type === "product") {
      prompt = `Scan product. Format valid JSON: { "name": "Product Name", "carbon": "0.25 kg CO2e", "score": "A", "breakdown": "LCA metrics", "alternative": "Sustainable choice" }`;
    } else if (type === "waste") {
      prompt = `Examine waste. Format valid JSON: { "item": "Name", "classification": "recyclable" | "organic" | "landfill", "instructions": "sorting instructions", "pointsGained": 10 }`;
    } else if (type === "food") {
      prompt = `Analyze food. Format valid JSON: { "name": "Food Name", "carbon": "1.5 kg CO2e", "green": true, "breakdown": "LCA details", "alternative": "Lower emission food alternative" }`;
    }

    const aiResponseText = await askGeminiVision(image, mimeType, prompt);
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponseText);
    } catch {
      res.status(422).json({ error: "Failed to parse AI Vision structured response" });
      return;
    }

    if (user) {
      await db.collection("activities").add({
        userId: user.uid,
        type: `vision_scan_${type}`,
        details: parsedResult,
        timestamp: new Date(),
      });
    }

    res.json(parsedResult);
  } catch (error) {
    console.error("Vision scan Function error:", error);
    res.status(500).json({ error: "Failed to parse image with Vision AI" });
  }
});

// ==========================================
// 6. Translator Endpoint
// ==========================================
export const translator = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const TranslatorSchema = z.object({ carbonKg: z.number().nonnegative() });
    const parsed = TranslatorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid carbon inputs", details: parsed.error.issues });
      return;
    }

    const { carbonKg } = parsed.data;
    const milesDriven = parseFloat((carbonKg * 2.5).toFixed(1));
    const treesNeeded = parseFloat((carbonKg / 22).toFixed(2));
    const acHours = parseFloat((carbonKg * 1.75).toFixed(1));

    res.json({
      originalCarbonKg: carbonKg,
      equivalents: {
        milesDriven: { value: milesDriven, label: `${milesDriven} miles driven in a gasoline vehicle` },
        treesNeeded: { value: treesNeeded, label: `${treesNeeded} mature trees required to absorb this in a year` },
        acHours: { value: acHours, label: `${acHours} hours of continuous air conditioning operation` },
      },
    });
  } catch (error) {
    console.error("Translator Function error:", error);
    res.status(500).json({ error: "Failed to translate emissions data" });
  }
});

// ==========================================
// 7. Climate Risk Endpoint
// ==========================================
export const climateRisk = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const RiskSchema = z.object({ location: z.string().min(2).max(100) });
    const parsed = RiskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid location parameter", details: parsed.error.issues });
      return;
    }

    const { location } = parsed.data;
    const prompt = `Analyze climate risks and resource stress indicators for: ${location}. Format response in valid JSON matching:
{
  "city": "City Name",
  "tempRise": "Estimated temp rise",
  "risks": [{ "name": "Extreme Heat", "score": 80, "color": "bg-red-500" }],
  "summary": "Brief summary explanation."
}`;

    const rawResponse = await askGeminiPro(prompt, "You are a climate risk model. Return JSON only.");
    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch {
      result = {
        city: location,
        tempRise: "+2.2C by 2050",
        risks: [{ name: "Extreme Heat", score: 78, color: "bg-orange-500" }],
        summary: "Thermal stress represents the leading risk profiles.",
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Climate risk Function error:", error);
    res.status(500).json({ error: "Failed to evaluate climate risk parameters" });
  }
});

// ==========================================
// 8. Community Leaderboard Endpoint
// ==========================================
export const leaderboard = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const limitVal = 10;
    const profilesSnapshot = await db
      .collection("ecoProfiles")
      .orderBy("score", "desc")
      .limit(limitVal)
      .get();

    const leaderboardList: any[] = [];
    let rank = 1;

    profilesSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      leaderboardList.push({
        rank,
        userId: doc.id,
        score: data.score || 70,
        personality: data.personality || "Earth Guardian",
        displayName: data.displayName || "Eco Citizen",
      });
      rank++;
    });

    if (leaderboardList.length < 3) {
      const mockSeeds = [
        { displayName: "Elena Rostova", score: 98, personality: "Climate Champion" },
        { displayName: "Kenji Sato", score: 92, personality: "Green Innovator" },
        { displayName: "Aria Thorne", score: 86, personality: "Earth Guardian" },
      ];
      for (const m of mockSeeds) {
        const exists = leaderboardList.some((item) => item.displayName === m.displayName);
        if (!exists) {
          leaderboardList.push({
            rank: leaderboardList.length + 1,
            userId: `mock_user_${leaderboardList.length}`,
            ...m,
          });
        }
      }
      leaderboardList.sort((a, b) => b.score - a.score);
      leaderboardList.forEach((item, idx) => {
        item.rank = idx + 1;
      });
    }

    res.json({ leaderboard: leaderboardList });
  } catch (error) {
    console.error("Leaderboard Function error:", error);
    res.status(500).json({ error: "Failed to load leaderboard list" });
  }
});
