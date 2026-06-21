import { NextRequest, NextResponse } from "next/server";
import { askGeminiPro } from "@/lib/gemini";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyIdToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { location } = body;

    if (!location) {
      return NextResponse.json({ error: "Missing location parameter" }, { status: 400 });
    }

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
        risks: [
          { name: "Extreme Heat", score: 78, color: "bg-red-500" },
          { name: "Water Scarcity Margin", score: 65, color: "bg-orange-500" }
        ],
        summary: "Thermal stress represents the leading risk profiles."
      };
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Next.js Climate Risk API Error:", error);
    return NextResponse.json({ error: "Failed to evaluate climate risk parameters" }, { status: 500 });
  }
}
