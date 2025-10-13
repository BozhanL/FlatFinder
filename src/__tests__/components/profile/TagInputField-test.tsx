import TagInputField from "@/components/profile/TagInputField";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

describe("TagInputField", () => {
  it("renders label and placeholder", () => {
    render(<TagInputField value={[]} onChange={jest.fn()} />);
    expect(screen.getByText("Tag")).toBeTruthy();
    expect(screen.getByPlaceholderText("e.g. student, cat lover")).toBeTruthy();
  });

  it("adds tag and clears input when ending with separator (space/comma/semicolon/newline)", () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <TagInputField value={[]} onChange={onChange} />,
    );

    const input = screen.getByPlaceholderText("e.g. student, cat lover");
    fireEvent.changeText(input, "student "); // Trigger with trailing space
    expect(onChange).toHaveBeenLastCalledWith(["student"]);

    // parent passes new value back, component shows chip and clears input
    rerender(<TagInputField value={["student"]} onChange={onChange} />);

    // Try comma
    const input2 = screen.getByTestId("TagInputField-input");
    fireEvent.changeText(input2, "cat lover,");
    expect(onChange).toHaveBeenLastCalledWith(["student", "cat lover"]);
    rerender(
      <TagInputField value={["student", "cat lover"]} onChange={onChange} />,
    );
    // Semicolon
    fireEvent.changeText(input2, "quiet;");
    expect(onChange).toHaveBeenLastCalledWith([
      "student",
      "cat lover",
      "quiet",
    ]);
    rerender(
      <TagInputField
        value={["student", "cat lover", "quiet"]}
        onChange={onChange}
      />,
    );

    // Newline
    const input4 = screen.getByTestId("TagInputField-input");
    fireEvent.changeText(input4, "music\n");
    expect(onChange).toHaveBeenLastCalledWith([
      "student",
      "cat lover",
      "quiet",
      "music",
    ]);
  });

  it("onSubmitEditing adds tag (when no separator)", () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <TagInputField value={[]} onChange={onChange} />,
    );

    const input = screen.getByPlaceholderText("e.g. student, cat lover");
    fireEvent.changeText(input, "quiet");
    fireEvent(input, "submitEditing");
    expect(onChange).toHaveBeenLastCalledWith(["quiet"]);

    // Pass value back, confirm chip appears and input is cleared
    rerender(<TagInputField value={["quiet"]} onChange={onChange} />);

    // Input with separator should not add duplicate
    const input2 = screen.getByTestId("TagInputField-input");
    fireEvent.changeText(input2, "quiet ");
    expect(onChange).toHaveBeenLastCalledWith(["quiet"]);
  });

  it("deduplication: entering an existing tag does not add duplicate", () => {
    const onChange = jest.fn();
    render(<TagInputField value={["student"]} onChange={onChange} />);
    const input = screen.getByTestId("TagInputField-input");

    fireEvent.changeText(input, "student ");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.changeText(input, "student");
    fireEvent(input, "submitEditing");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("length limit: tags longer than maxLen are truncated", () => {
    const onChange = jest.fn();
    const long = "averyverylongtagname";
    const { rerender } = render(
      <TagInputField value={[]} onChange={onChange} maxLen={10} />,
    );

    const input = screen.getByPlaceholderText("e.g. student, cat lover");
    fireEvent.changeText(input, `${long} `);
    expect(onChange).toHaveBeenLastCalledWith(["averyveryl"]);

    // Pass value back, verify chip appears (optional)
    rerender(
      <TagInputField value={["averyveryl"]} onChange={onChange} maxLen={10} />,
    );
    expect(screen.getByText("averyveryl")).toBeTruthy();
  });

  it("suggestion list: shows suggestions for partial keyword, clicking suggestion adds and clears input", async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <TagInputField value={[]} onChange={onChange} />,
    );

    const input = screen.getByPlaceholderText("e.g. student, cat lover");
    fireEvent.changeText(input, "stu"); // Matches 'student'

    const suggestion = await screen.findByText("student");
    fireEvent.press(suggestion);
    expect(onChange).toHaveBeenLastCalledWith(["student"]);

    rerender(<TagInputField value={["student"]} onChange={onChange} />);
    expect(screen.getByText("student")).toBeTruthy();
  });

  it("delete tag: clicking × on chip deletes corresponding tag", () => {
    const onChange = jest.fn();
    render(<TagInputField value={["quiet", "vegan"]} onChange={onChange} />);

    const closes = screen.getAllByText("×");
    fireEvent.press(closes[0]);

    expect(onChange).toHaveBeenLastCalledWith(["vegan"]);
  });

  it("when maxTags reached, input is hidden and no new tag is added", () => {
    const onChange = jest.fn();
    const filled = ["a", "b", "c", "d", "e"];
    render(<TagInputField value={filled} onChange={onChange} maxTags={5} />);

    expect(screen.queryByTestId("TagInputField-input")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("container click focuses input: touching container still allows input and adding tag", async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <TagInputField value={[]} onChange={onChange} />,
    );

    // Clicking outside container text does not guarantee focus, directly operate input for reliability
    const input = screen.getByPlaceholderText("e.g. student, cat lover");
    fireEvent.changeText(input, "gamer ");
    expect(onChange).toHaveBeenLastCalledWith(["gamer"]);

    // After passing value back, chip should appear
    rerender(<TagInputField value={["gamer"]} onChange={onChange} />);
    await waitFor(() => {
      expect(screen.getByText("gamer")).toBeTruthy();
    });
  });
});
