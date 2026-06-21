import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyIdToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { transport, electricity, water, food, shopping, waste } = body;

    if (!transport || !electricity || !water || !food || !shopping || !waste) {
      return NextResponse.json({ error: "Missing required calculation parameters" }, { status: 400 });
    }

    let transportEmissions = 0;
    if (transport.carType === "ice") {
      transportEmissions += (transport.carMiles * 0.4) / 30;
    } else if (transport.carType === "ev") {
      transportEmissions += (transport.carMiles * 0.12) / 30;
    }
    transportEmissions += (transport.transitMiles * 0.05) / 30;
    transportEmissions += (transport.flightHours * 90) / 365;

    const carbonPerKwh = 0.38;
    const offsetMultiplier = (100 - electricity.renewablePct) / 100;
    const electricityEmissions = (electricity.kwh * carbonPerKwh * offsetMultiplier) / 30;

    const waterEmissions = (water.gallons * 0.003) / 30;

    let foodEmissions = 5.5;
    if (food.dietType === "vegan") foodEmissions = 2.0;
    else if (food.dietType === "vegetarian") foodEmissions = 3.5;
    else if (food.dietType === "balanced") foodEmissions = 5.5;
    else if (food.dietType === "meat-heavy") foodEmissions = 8.5;

    const shoppingEmissions = (shopping.spendAmount * 0.15) / 30;

    let wasteEmissions = (waste.bags * 1.2) / 30;
    if (waste.recycled) wasteEmissions *= 0.7;
    if (waste.composted) wasteEmissions *= 0.8;

    const dailyCarbon = parseFloat((transportEmissions + electricityEmissions + waterEmissions + foodEmissions + shoppingEmissions + wasteEmissions).toFixed(2));
    const monthlyCarbon = parseFloat((dailyCarbon * 30).toFixed(2));
    const annualCarbon = parseFloat(((dailyCarbon * 365) / 1000).toFixed(2));

    const score = Math.max(10, Math.min(100, Math.round(100 - (dailyCarbon * 2.2))));

    // Write to Firestore database collections
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
