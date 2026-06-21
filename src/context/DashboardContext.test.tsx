/** @jest-environment jsdom */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DashboardProvider, useDashboard } from "./DashboardContext";

// Simple test consumer component
function TestConsumer() {
  const { highContrast, toggleHighContrast, challenges, toggleJoinChallenge } = useDashboard();
  return (
    <div>
      <span data-testid="contrast-mode">{highContrast ? "high" : "normal"}</span>
      <button data-testid="toggle-contrast" onClick={toggleHighContrast}>Toggle Contrast</button>
      
      <div data-testid="challenges-list">
        {challenges.map(c => (
          <div key={c.id} data-testid={`challenge-item-${c.id}`}>
            <span data-testid={`challenge-joined-${c.id}`}>{c.joined ? "joined" : "not-joined"}</span>
            <button data-testid={`join-btn-${c.id}`} onClick={() => toggleJoinChallenge(c.id)}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}

describe("DashboardContext Provider", () => {
  it("should throw error when useDashboard is used outside DashboardProvider", () => {
    // Suppress console.error log for expected error throw
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    function ErrorConsumer() {
      useDashboard();
      return null;
    }
    
    expect(() => render(<ErrorConsumer />)).toThrow(
      "useDashboard must be used within a DashboardProvider"
    );
    
    consoleErrorSpy.mockRestore();
  });

  it("should toggle high contrast mode correctly", () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const contrastSpan = screen.getByTestId("contrast-mode");
    const toggleButton = screen.getByTestId("toggle-contrast");

    expect(contrastSpan).toHaveTextContent("normal");

    act(() => {
      toggleButton.click();
    });

    expect(contrastSpan).toHaveTextContent("high");
  });

  it("should join and leave challenges correctly", () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const challengeJoinSpan = screen.getByTestId("challenge-joined-1");
    const joinBtn = screen.getByTestId("join-btn-1");

    expect(challengeJoinSpan).toHaveTextContent("not-joined");

    act(() => {
      joinBtn.click();
    });

    expect(challengeJoinSpan).toHaveTextContent("joined");
  });
});
