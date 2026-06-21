import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebaseAdmin";
import { calculateCarbonProfile } from "@/lib/carbonCalculator";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyIdToken(req).catch(() => null);

    const body = await req.json();
    const { transport, electricity, water, food, shopping, waste } = body;

    if (!transport || !electricity || !water || !food || !shopping || !waste) {
      return NextResponse.json({ error: "Missing required calculation parameters" }, { status: 400 });
    }

    const { dailyCarbon, monthlyCarbon, annualCarbon, sustainabilityScore: score } = calculateCarbonProfile({
      transport,
      electricity,
      water,
      food,
      shopping,
      waste
    });

    // Write to Firestore database collections if user is logged in
    if (user) {
      const activityRef = adminDb.collection("activities").doc();
      await activityRef.set({
        id: activityRef.id,
        userId: user.uid,
        type: "calculator_log",
        details: { transport, electricity, water, food, shopping, waste, dailyCarbon },
        carbon: dailyCarbon,
        timestamp: new Date(),
      });

      await adminDb.collection("carbonHistory").doc(user.uid).set({
        userId: user.uid,
        dailyCarbon,
        monthlyCarbon,
        annualCarbon,
        updatedAt: new Date(),
      });

      await adminDb.collection("ecoProfiles").doc(user.uid).set({
        userId: user.uid,
        score,
        updatedAt: new Date(),
      }, { merge: true });
    }

    return NextResponse.json({
      dailyCarbon,
      monthlyCarbon,
      annualCarbon,
      sustainabilityScore: score
    });
  } catch (error: unknown) {
    console.error("Next.js Carbon Calculate API Error:", error);
    return NextResponse.json({ error: "Failed to calculate carbon profile parameters" }, { status: 500 });
  }
}
