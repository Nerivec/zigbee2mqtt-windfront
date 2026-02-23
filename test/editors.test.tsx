import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RangeEditor from "../src/components/editors/RangeEditor.js";
import TextEditor from "../src/components/editors/TextEditor.js";

describe("RangeEditor", () => {
    it("calls onChange on blur", async () => {
        const onChange = vi.fn();
        const { container } = render(<RangeEditor value={50} min={0} max={255} onChange={onChange} />);

        const input = within(container).getByRole("spinbutton");
        await userEvent.clear(input);
        await userEvent.type(input, "100");
        await userEvent.tab();

        expect(onChange).toHaveBeenCalledWith(100);
    });

    it("calls onChange on Enter key", async () => {
        const onChange = vi.fn();
        const { container } = render(<RangeEditor value={50} min={0} max={255} onChange={onChange} />);

        const input = within(container).getByRole("spinbutton");
        await userEvent.clear(input);
        await userEvent.type(input, "100");
        await userEvent.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith(100);
    });

    it("calls onChange with null when input is cleared and Enter is pressed", async () => {
        const onChange = vi.fn();
        const { container } = render(<RangeEditor value={50} min={0} max={255} onChange={onChange} />);

        const input = within(container).getByRole("spinbutton");
        await userEvent.clear(input);
        await userEvent.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith(null);
    });

    it("does not double-trigger onChange when Enter is followed by blur", async () => {
        const onChange = vi.fn();
        const { container } = render(<RangeEditor value={50} min={0} max={255} onChange={onChange} />);

        const input = within(container).getByRole("spinbutton");
        await userEvent.clear(input);
        await userEvent.type(input, "100");
        await userEvent.keyboard("{Enter}");
        await userEvent.tab();

        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("does not call onChange on blur when value has not changed", async () => {
        const onChange = vi.fn();
        const { container } = render(<RangeEditor value={50} min={0} max={255} onChange={onChange} />);

        const input = within(container).getByRole("spinbutton");
        await userEvent.click(input);
        await userEvent.tab();

        expect(onChange).not.toHaveBeenCalled();
    });

    it("calls onChange with null, not empty string, when cleared", async () => {
        const onChange = vi.fn();
        const { container } = render(<RangeEditor value={50} min={0} max={255} onChange={onChange} />);

        const input = within(container).getByRole("spinbutton");
        await userEvent.clear(input);
        await userEvent.tab();

        expect(onChange).toHaveBeenCalledWith(null);
        expect(onChange).not.toHaveBeenCalledWith("");
    });
});

describe("TextEditor", () => {
    it("calls onChange on blur", async () => {
        const onChange = vi.fn();
        const { container } = render(<TextEditor value="old" onChange={onChange} />);

        const input = within(container).getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "new");
        await userEvent.tab();

        expect(onChange).toHaveBeenCalledWith("new");
    });

    it("calls onChange on Enter key", async () => {
        const onChange = vi.fn();
        const { container } = render(<TextEditor value="old" onChange={onChange} />);

        const input = within(container).getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "new");
        await userEvent.keyboard("{Enter}");

        expect(onChange).toHaveBeenCalledWith("new");
    });

    it("does not double-trigger onChange when Enter is followed by blur", async () => {
        const onChange = vi.fn();
        const { container } = render(<TextEditor value="old" onChange={onChange} />);

        const input = within(container).getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "new");
        await userEvent.keyboard("{Enter}");
        await userEvent.tab();

        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("does not call onChange on blur when value has not changed", async () => {
        const onChange = vi.fn();
        const { container } = render(<TextEditor value="old" onChange={onChange} />);

        const input = within(container).getByRole("textbox");
        await userEvent.click(input);
        await userEvent.tab();

        expect(onChange).not.toHaveBeenCalled();
    });

    it("calls onChange with empty string when cleared", async () => {
        const onChange = vi.fn();
        const { container } = render(<TextEditor value="old" onChange={onChange} />);

        const input = within(container).getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.tab();

        expect(onChange).toHaveBeenCalledWith("");
    });
});
