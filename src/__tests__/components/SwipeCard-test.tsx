import SwipeCard from "@/components/SwipeCard";
import type { Flatmate } from "@/types/flatmate";
import { render, screen } from "@testing-library/react-native";
import React from "react";

function makeFlatmate(overrides: Partial<Flatmate> = {}): Flatmate {
  return {
    id: "u1",
    name: "Tony",
    avatar: { uri: "https://example.com/a.jpg" },
    tags: [],
    location: "Downtown",
    ...overrides,
  } as Flatmate;
}

describe("SwipeCard", () => {
  it("renders name and optional age with correct formatting", () => {
    render(<SwipeCard item={makeFlatmate({ name: "Tony", age: 22 })} />);

    expect(screen.getByText(/Tony/)).toBeTruthy();

    expect(screen.getByText(/22/)).toBeTruthy();
  });

  it("hides age when not provided", () => {
    render(<SwipeCard item={makeFlatmate({ name: "Ada" })} />);

    expect(screen.getByText(/Ada/)).toBeTruthy();

    expect(screen.queryByText(/\b23\b/)).toBeNull();
  });

  it("renders location as string and budget if present", () => {
    render(
      <SwipeCard item={makeFlatmate({ location: "City", budget: 750 })} />,
    );

    expect(screen.getByText(/City/)).toBeTruthy();

    expect(screen.getByText(/\$750\/wk/)).toBeTruthy();
  });

  it("renders location.area when location is an object", () => {
    render(
      <SwipeCard
        item={makeFlatmate({
          location: { area: "Suburbia" } as any,
        })}
      />,
    );

    expect(screen.getByText(/Suburbia/)).toBeTruthy();
  });

  it("hides budget when not provided", () => {
    render(<SwipeCard item={makeFlatmate({ location: "City" })} />);
    expect(screen.queryByText(/\/wk/)).toBeNull();
  });

  it("renders bio when provided", () => {
    render(<SwipeCard item={makeFlatmate({ bio: "Hello world" })} />);
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("renders tags when provided", () => {
    render(<SwipeCard item={makeFlatmate({ tags: ["t1", "t2"] })} />);
    expect(screen.getByText("t1")).toBeTruthy();
    expect(screen.getByText("t2")).toBeTruthy();
  });
});
