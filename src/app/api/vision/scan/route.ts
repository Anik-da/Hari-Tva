import { NextRequest, NextResponse } from "next/server";
import { askGeminiVision } from "@/lib/gemini";
import { adminDb, verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyIdToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { image, mimeType, type } = body;

    if (!image || !mimeType || !type) {
      return NextResponse.json({ error: "Missing required parameters: image, mimeType, or type" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Failed to parse AI Vision structured response" }, { status: 422 });
    }

    await adminDb.collection("activities").add({
      userId: user.uid,
      type: `vision_scan_${type}`,
      details: parsedResult,
      timestamp: new Date(),
    });

    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error("Next.js Vision Scan API Error:", error);
    return NextResponse.json({ error: "Failed to analyze image with Vision AI" }, { status: 500 });
  }
}
