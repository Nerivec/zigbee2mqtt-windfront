import { cleanup, render } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInputSubmit } from "../src/hooks/useInputSubmit.js";

// minimal components for hook call
function TestTextInput({ value, onSubmit }: Parameters<typeof useInputSubmit>[0]) {
    const inputProps = useInputSubmit({ value, onSubmit });

    return <input type="text" {...inputProps} />;
}

function TestNumberInput({ value, onSubmit }: Parameters<typeof useInputSubmit>[0]) {
    const inputProps = useInputSubmit({ value, onSubmit });

    return <input type="number" {...inputProps} />;
}

function TestSelectInput({ value, onSubmit }: Parameters<typeof useInputSubmit>[0]) {
    const inputProps = useInputSubmit({ value, onSubmit });

    return (
        <select {...inputProps}>
            <option value="" />
            <option value="old">old</option>
            <option value="new">new</option>
        </select>
    );
}

function TestTextareaInput({ value, onSubmit }: Parameters<typeof useInputSubmit>[0]) {
    const inputProps = useInputSubmit({ value, onSubmit });

    return <textarea {...inputProps} />;
}

describe("useInputSubmit input type text", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        cleanup();
    });

    it("calls onSubmit on blur", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLInputElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("new");
        expect(input.value).toStrictEqual("new");
    });

    it("calls onSubmit on Enter key", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLInputElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("new");
        expect(input.value).toStrictEqual("new");
    });

    it("does not call onSubmit on blur when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLInputElement;

        await user.click(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");

        await user.clear(input);
        await user.type(input, "old");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");
    });

    it("does not call onSubmit on Enter key when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLInputElement;

        await user.click(input);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");

        await user.clear(input);
        await user.type(input, "old");
        await user.keyboard("{Enter}");

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");
    });

    it("resets to previously committed value on Escape key without submitting", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLInputElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.keyboard("{Escape}");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");
    });

    it("calls onSubmit with empty string", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLInputElement;

        await user.clear(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("");
        expect(input.value).toStrictEqual("");
    });
});

describe("useInputSubmit input type number", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        cleanup();
    });

    it("calls onSubmit on blur", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestNumberInput value={`${1}`} onSubmit={onSubmit} />);
        const input = getByRole("spinbutton") as HTMLInputElement;

        await user.clear(input);
        await user.type(input, "2");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("2");
        expect(input.value).toStrictEqual("2");
    });

    it("calls onSubmit on Enter key", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestNumberInput value={`${1}`} onSubmit={onSubmit} />);
        const input = getByRole("spinbutton") as HTMLInputElement;

        await user.clear(input);
        await user.type(input, "2");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("2");
        expect(input.value).toStrictEqual("2");
    });

    it("does not call onSubmit on blur when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestNumberInput value={`${1}`} onSubmit={onSubmit} />);
        const input = getByRole("spinbutton") as HTMLInputElement;

        await user.click(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("1");

        await user.clear(input);
        await user.type(input, "1");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("1");
    });

    it("does not call onSubmit on Enter key when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestNumberInput value={`${1}`} onSubmit={onSubmit} />);
        const input = getByRole("spinbutton") as HTMLInputElement;

        await user.click(input);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("1");

        await user.clear(input);
        await user.type(input, "1");
        await user.keyboard("{Enter}");

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("1");
    });

    it("resets to previously committed value on Escape key without submitting", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestNumberInput value={`${1}`} onSubmit={onSubmit} />);
        const input = getByRole("spinbutton") as HTMLInputElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.keyboard("{Escape}");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("1");
    });

    it("calls onSubmit with empty string", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestNumberInput value={`${1}`} onSubmit={onSubmit} />);
        const input = getByRole("spinbutton") as HTMLInputElement;

        await user.clear(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("");
        expect(input.value).toStrictEqual("");
    });
});

describe("useInputSubmit select", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        cleanup();
    });

    it("calls onSubmit on blur", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.selectOptions(input, "new");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("new");
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
    });

    it("calls onSubmit on Enter key", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.selectOptions(input, "new");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("new");
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
    });

    it("does not call onSubmit on blur when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.click(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(true);

        await user.selectOptions(input, "new");
        await user.selectOptions(input, "old");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(true);
    });

    it("does not call onSubmit on Enter key when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.click(input);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(true);

        await user.selectOptions(input, "new");
        await user.selectOptions(input, "old");
        await user.keyboard("{Enter}");

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(true);
    });

    it("resets to previously committed value on Escape key without submitting", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.selectOptions(input, "new");
        await user.keyboard("{Escape}");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(true);
    });

    it("calls onSubmit with empty string", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.selectOptions(input, "");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("");
        expect((getByRole("option", { name: "" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
    });
});

describe("useInputSubmit textarea", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        cleanup();
    });

    it("calls onSubmit on blur", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextareaInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("new");
        expect(input.value).toStrictEqual("new");
    });

    it("calls onSubmit on Enter key", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextareaInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("new");
        expect(input.value).toStrictEqual("new");
    });

    it("does not call onSubmit on blur when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextareaInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLTextAreaElement;

        await user.click(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");

        await user.clear(input);
        await user.type(input, "old");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");
    });

    it("does not call onSubmit on Enter key when value has not changed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextareaInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLTextAreaElement;

        await user.click(input);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");

        await user.clear(input);
        await user.type(input, "old");
        await user.keyboard("{Enter}");

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");
    });

    it("resets to previously committed value on Escape key without submitting", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextareaInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.keyboard("{Escape}");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("old");
    });

    it("calls onSubmit with empty string", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextareaInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLTextAreaElement;

        await user.clear(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("");
        expect(input.value).toStrictEqual("");
    });
});
