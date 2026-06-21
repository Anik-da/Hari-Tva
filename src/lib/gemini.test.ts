import { askGeminiPro, askGeminiVision } from "./gemini";

// Mock global fetch to isolate fallback pathways
global.fetch = jest.fn(() =>
  Promise.reject(new Error("Network disconnect simulated for fallback testing"))
) as jest.Mock;

describe("AI Engine Fallback Pathways", () => {
  it("should successfully trigger local fallback for text-based advisor recommendation queries", async () => {
    const responseText = await askGeminiPro("mentor query recommendation parameters");
    
    // Validate output is a valid JSON matching mock structure
    const parsed = JSON.parse(responseText);
    expect(parsed).toHaveProperty("reply");
    expect(parsed).toHaveProperty("suggestions");
    expect(Array.isArray(parsed.suggestions)).toBe(true);
  });

  it("should successfully trigger local fallback for vision-based product scanner queries", async () => {
    const responseText = await askGeminiVision("dummy-base64", "image/png", "scanner parameters");
    
    const parsed = JSON.parse(responseText);
    expect(parsed).toHaveProperty("name");
    expect(parsed).toHaveProperty("carbon");
    expect(parsed).toHaveProperty("score");
  });

  it("should successfully trigger local fallback for waste segregation analysis queries", async () => {
    const responseText = await askGeminiVision("dummy-base64", "image/png", "waste segregation classification parameters");
    
    const parsed = JSON.parse(responseText);
    expect(parsed).toHaveProperty("item");
    expect(parsed).toHaveProperty("classification");
  });
});
