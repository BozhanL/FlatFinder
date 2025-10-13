import { render, screen, fireEvent } from "@testing-library/react-native";
import SwipeCard from "@/components/swipe/SwipeCard";
import type { Flatmate } from "@/types/Flatmate";
import type { ImageSourcePropType } from "react-native";

const imgSrc: ImageSourcePropType = { uri: "https://example.com/a.jpg" };

function makeFlatmate(overrides: Partial<Flatmate> = {}): Flatmate {
  const base = {
    id: "u1",
    name: "Tony",
    avatar: imgSrc,
    tags: [] as string[],
    location: "Downtown",
  };
  return { ...base, ...overrides } as unknown as Flatmate;
}

describe("SwipeCard", () => {
  it("renders name", () => {
    render(
      <SwipeCard item={makeFlatmate({ name: "Tony" })} onPress={jest.fn()} />,
    );
    expect(screen.getByText(/Tony/)).toBeTruthy();
  });

  it("renders location as string and budget if present", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ location: "City", budget: 750 })}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText(/City/)).toBeTruthy();
    expect(screen.getByText(/\$750\/wk/)).toBeTruthy();
  });

  it("renders location.area when location is an object", () => {
    const fm = makeFlatmate({
      location: { area: "Suburbia" } as string | { area?: string } | null,
    });
    render(<SwipeCard item={fm} onPress={jest.fn()} />);

    expect(screen.getByText(/Suburbia/)).toBeTruthy();
  });

  it("hides budget when not provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ location: "City" })}
        onPress={jest.fn()}
      />,
    );
    expect(screen.queryByText(/\/wk/)).toBeNull();
  });

  it("renders bio when provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ bio: "Hello world" })}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("renders tags when provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ tags: ["t1", "t2"] })}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("t1")).toBeTruthy();
    expect(screen.getByText("t2")).toBeTruthy();
  });

  it("calls onPress when card is pressed", () => {
    const onPress = jest.fn();
    const fm = makeFlatmate({ id: "press-id", name: "PressMe" });

    render(<SwipeCard item={fm} onPress={onPress} />);
    fireEvent.press(screen.getByTestId("swipe-card-press-id"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
