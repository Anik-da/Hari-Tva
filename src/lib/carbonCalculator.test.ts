import { calculateCarbonProfile } from "./carbonCalculator";

describe("Carbon Footprint Calculator logic", () => {
  it("should calculate correct carbon footprints for a low-emissions profile", () => {
    const lowProfile = {
      transport: {
        carType: "ev",
        carMiles: 100, // 100 miles in EV
        transitMiles: 50,
        flightHours: 0,
      },
      electricity: {
        kwh: 150,
        renewablePct: 100, // 100% solar/wind
      },
      water: {
        gallons: 300,
      },
      food: {
        dietType: "vegan",
      },
      shopping: {
        spendAmount: 50,
      },
      waste: {
        bags: 1,
        recycled: true,
        composted: true,
      },
    };

    const result = calculateCarbonProfile(lowProfile);

    // Assertions based on formula
    expect(result.dailyCarbon).toBeGreaterThan(0);
    expect(result.sustainabilityScore).toBeGreaterThanOrEqual(80);
    expect(result.monthlyCarbon).toBeCloseTo(result.dailyCarbon * 30, 1);
    expect(result.annualCarbon).toBeCloseTo((result.dailyCarbon * 365) / 1000, 1);
  });

  it("should calculate correct carbon footprints for a high-emissions profile", () => {
    const highProfile = {
      transport: {
        carType: "ice",
        carMiles: 1000,
        transitMiles: 200,
        flightHours: 15,
      },
      electricity: {
        kwh: 800,
        renewablePct: 0, // No solar/wind
      },
      water: {
        gallons: 2000,
      },
      food: {
        dietType: "meat-heavy",
      },
      shopping: {
        spendAmount: 600,
      },
      waste: {
        bags: 10,
        recycled: false,
        composted: false,
      },
    };

    const result = calculateCarbonProfile(highProfile);

    expect(result.dailyCarbon).toBeGreaterThan(20);
    expect(result.sustainabilityScore).toBeLessThanOrEqual(50);
  });
});
