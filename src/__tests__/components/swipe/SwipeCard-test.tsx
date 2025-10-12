import { render, screen, fireEvent } from "@testing-library/react-native";
import SwipeCard from "@/components/swipe/SwipeCard";
import type { Flatmate } from "@/types/Flatmate";

function makeFlatmate(overrides: Partial<Flatmate> = {}): Flatmate {
  return {
    id: "u1",
    name: "Tony",
    avatar: { uri: "https://example.com/a.jpg" } as any,
    tags: [],
    location: "Downtown" as any,
    budget: undefined as any,
    bio: undefined as any,
    dob: undefined as any,
    ...overrides,
  } as Flatmate;
}

describe("SwipeCard", () => {
  it("renders name and DOB when provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ name: "Tony", dob: "01-01-2000" } as any)}
        onPress={() => {}}
      />,
    );

    expect(screen.getByText(/Tony/)).toBeTruthy();
    expect(screen.getByText(/01-01-2000/)).toBeTruthy();
  });

  it("hides DOB when not provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ name: "Ada", dob: undefined } as any)}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText(/Ada/)).toBeTruthy();
    expect(screen.queryByText(/\d{2}-\d{2}-\d{4}/)).toBeNull();
  });

  it("renders location as string and budget if present", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ location: "City", budget: 750 } as any)}
        onPress={() => {}}
      />,
    );

    expect(screen.getByText(/City/)).toBeTruthy();
    expect(screen.getByText(/\$750\/wk/)).toBeTruthy();
  });

  it("renders location.area when location is an object", () => {
    render(
      <SwipeCard
        item={makeFlatmate({
          location: { area: "Suburbia" },
        })}
        onPress={() => {}}
      />,
    );

    expect(screen.getByText(/Suburbia/)).toBeTruthy();
  });

  it("hides budget when not provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ location: "City", budget: undefined } as any)}
        onPress={() => {}}
      />,
    );
    expect(screen.queryByText(/\/wk/)).toBeNull();
  });

  it("renders bio when provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ bio: "Hello world" } as any)}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("renders tags when provided", () => {
    render(
      <SwipeCard
        item={makeFlatmate({ tags: ["t1", "t2"] } as any)}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText("t1")).toBeTruthy();
    expect(screen.getByText("t2")).toBeTruthy();
  });

  it("calls onPress when card is pressed", () => {
    const onPress = jest.fn();
    const fm = makeFlatmate({ name: "PressMe" });
    render(<SwipeCard item={fm} onPress={onPress} />);
    fireEvent.press(screen.getByTestId("swipe-card-u1"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
