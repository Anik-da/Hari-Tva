export interface CarbonCalculationParams {
  transport: {
    carType: string;
    carMiles: number;
    transitMiles: number;
    flightHours: number;
  };
  electricity: {
    kwh: number;
    renewablePct: number;
  };
  water: {
    gallons: number;
  };
  food: {
    dietType: string;
  };
  shopping: {
    spendAmount: number;
  };
  waste: {
    bags: number;
    recycled: boolean;
    composted: boolean;
  };
}

export interface CarbonCalculationResult {
  dailyCarbon: number;
  monthlyCarbon: number;
  annualCarbon: number;
  sustainabilityScore: number;
}

export function calculateCarbonProfile(params: CarbonCalculationParams): CarbonCalculationResult {
  const { transport, electricity, water, food, shopping, waste } = params;

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

  const dailyCarbon = parseFloat(
    (
      transportEmissions +
      electricityEmissions +
      waterEmissions +
      foodEmissions +
      shoppingEmissions +
      wasteEmissions
    ).toFixed(2)
  );

  const monthlyCarbon = parseFloat((dailyCarbon * 30).toFixed(2));
  const annualCarbon = parseFloat(((dailyCarbon * 365) / 1000).toFixed(2));

  const score = Math.max(10, Math.min(100, Math.round(100 - dailyCarbon * 2.2)));

  return {
    dailyCarbon,
    monthlyCarbon,
    annualCarbon,
    sustainabilityScore: score,
  };
}
