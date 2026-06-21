import { NextRequest, NextResponse } from "next/server";
import { askGeminiPro } from "@/lib/gemini";
import { adminDb, verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyIdToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Missing message parameter" }, { status: 400 });
    }

    const historyDoc = await adminDb.collection("carbonHistory").doc(user.uid).get();
    let statsContext = "No history recorded yet.";
    if (historyDoc.exists) {
      const data = historyDoc.data();
      statsContext = `Daily: ${data?.dailyCarbon} kg CO2e, Monthly: ${data?.monthlyCarbon} kg, Annual: ${data?.annualCarbon} Tonnes.`;
    }

    const systemInstruction = `You are HariTva's AI Sustainability Mentor.
User context: ${statsContext}.
Answer concisely. Return valid JSON only matching:
{
  "reply": "Main textual guidance advice.",
  "suggestions": ["Task 1", "Task 2"]
}`;

    const rawResponse = await askGeminiPro(message, systemInstruction);
    let parsedJson;
    try {
      parsedJson = JSON.parse(rawResponse);
    } catch {
      parsedJson = { reply: rawResponse, suggestions: ["Avoid single-passenger car transit.", "Optimize HVAC settings."] };
    }

    await adminDb.collection("activities").add({
      userId: user.uid,
      type: "ai_dialogue",
      details: { question: message, reply: parsedJson.reply },
      timestamp: new Date(),
    });

    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error("Next.js AI Mentor API Error:", error);
    return NextResponse.json({ error: "Failed to consult AI Mentor" }, { status: 500 });
  }
}
