import { cleanup, fireEvent, render } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInputSubmit } from "../src/hooks/useInputSubmit.js";

// minimal components for hook call
function TestTextInput({ value, onSubmit, disabled, submitEmptyAsNull, ...rest }: Parameters<typeof useInputSubmit>[0] & { required?: boolean }) {
    const inputProps = useInputSubmit({ value, onSubmit, disabled, submitEmptyAsNull });

    return <input type="text" {...inputProps} {...rest} />;
}

function TestNumberInput({ value, onSubmit, disabled, submitEmptyAsNull, ...rest }: Parameters<typeof useInputSubmit>[0] & { required?: boolean }) {
    const inputProps = useInputSubmit({ value, onSubmit, disabled, submitEmptyAsNull });

    return <input type="number" {...inputProps} {...rest} />;
}

function TestSelectInput({ value, onSubmit, disabled, submitEmptyAsNull, ...rest }: Parameters<typeof useInputSubmit>[0] & { required?: boolean }) {
    const inputProps = useInputSubmit({ value, onSubmit, disabled, submitEmptyAsNull });

    return (
        <select {...inputProps} {...rest}>
            <option value="" />
            <option value="old">old</option>
            <option value="new">new</option>
        </select>
    );
}

function TestTextareaInput({ value, onSubmit, disabled, submitEmptyAsNull, ...rest }: Parameters<typeof useInputSubmit>[0] & { required?: boolean }) {
    const inputProps = useInputSubmit({ value, onSubmit, disabled, submitEmptyAsNull });

    return <textarea {...inputProps} {...rest} />;
}

describe("useInputSubmit input/textarea", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        cleanup();
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("calls onSubmit on blur for %s", async (name, Component, oldValue, newValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, newValue);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(newValue);
        expect(input.value).toStrictEqual(newValue);
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("calls onSubmit on Enter key for %s", async (name, Component, oldValue, newValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, newValue);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(newValue);
        expect(input.value).toStrictEqual(newValue);
    });

    it.each([
        ["textbox", TestTextInput, "old"],
        ["spinbutton", TestNumberInput, "0"],
        ["textbox", TestTextareaInput, "old"],
    ])("does not call onSubmit on blur when value has not changed for %s", async (name, Component, oldValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.click(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual(oldValue);

        await user.clear(input);
        await user.type(input, oldValue);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual(oldValue);
    });

    it.each([
        ["textbox", TestTextInput, "old"],
        ["spinbutton", TestNumberInput, "0"],
        ["textbox", TestTextareaInput, "old"],
    ])("does not call onSubmit on Enter key when value has not changed for %s", async (name, Component, oldValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.click(input);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual(oldValue);

        await user.clear(input);
        await user.type(input, oldValue);
        await user.keyboard("{Enter}");

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual(oldValue);
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("does not call onSubmit when browser validation failed for %s", async (name, Component, oldValue, newValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} required />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual("");

        await user.type(input, newValue);
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(input.value).toStrictEqual(newValue);
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("resets to previously committed value on Escape key without submitting for %s", async (name, Component, oldValue, newValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, newValue);
        await user.keyboard("{Escape}");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(input.value).toStrictEqual(oldValue);
    });

    it.each([
        ["textbox", TestTextInput, "old"],
        ["spinbutton", TestNumberInput, "0"],
        ["textbox", TestTextareaInput, "old"],
    ])("calls onSubmit with empty string for %s", async (name, Component, oldValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("");
        expect(input.value).toStrictEqual("");
    });

    it.each([
        ["textbox", TestTextInput, "old"],
        ["spinbutton", TestNumberInput, "0"],
        ["textbox", TestTextareaInput, "old"],
    ])("calls onSubmit with null when empty string for %s", async (name, Component, oldValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} submitEmptyAsNull />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(null);
        expect(input.value).toStrictEqual("");
    });

    it.each([
        ["textbox", TestTextInput, "old"],
        ["spinbutton", TestNumberInput, "0"],
        ["textbox", TestTextareaInput, "old"],
    ])("uses externally provided disable for %s", (name, Component, oldValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} disabled />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        expect(input.disabled).toStrictEqual(true);
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("syncs previous and draft when committed value changes externally for %s", (name, Component, oldValue, newValue) => {
        const onSubmit = vi.fn();
        const { getByRole, rerender } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        expect(input.value).toStrictEqual(oldValue);

        rerender(<Component value={newValue} onSubmit={onSubmit} />);

        expect(input.value).toStrictEqual(newValue);
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("syncs previous but not draft when committed value changes externally but draft already same for %s", async (name, Component, oldValue, newValue) => {
        const onSubmit = vi.fn();
        const { getByRole, rerender } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        expect(input.value).toStrictEqual(oldValue);

        await user.clear(input);
        await user.type(input, newValue);

        expect(input.value).toStrictEqual(newValue);

        rerender(<Component value={newValue} onSubmit={onSubmit} />);

        expect(input.value).toStrictEqual(newValue);
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("reports submit errors and recovers submitting state for %s", async (name, Component, oldValue, newValue) => {
        const expectedError = new Error("submit failed");
        const onSubmit = vi.fn(async () => {
            await Promise.reject(expectedError);
        });

        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, newValue);
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(input.disabled).toStrictEqual(false);
        expect(input.validationMessage).toStrictEqual("submit failed");
    });

    it.each([
        ["textbox", TestTextInput, "old", "new"],
        ["spinbutton", TestNumberInput, "0", "1"],
        ["textbox", TestTextareaInput, "old", "new"],
    ])("does not submit on Enter while composing for %s", async (name, Component, oldValue, newValue) => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<Component value={oldValue} onSubmit={onSubmit} />);
        const input = getByRole(name) as HTMLInputElement | HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, newValue);

        fireEvent.keyDown(input, { key: "Enter", isComposing: true });

        expect(onSubmit).toHaveBeenCalledTimes(0);
    });

    it("does not submit on Shift+Enter for textarea until blur", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestTextareaInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("textbox") as HTMLTextAreaElement;

        await user.clear(input);
        await user.type(input, "new");
        await user.keyboard("{Shift>}{Enter}{/Shift}");

        expect(onSubmit).toHaveBeenCalledTimes(0);

        await user.type(input, "new2");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith("new\nnew2");
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

    it("does not call onSubmit when browser validation failed", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} required />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.selectOptions(input, "");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "" }) as HTMLOptionElement).selected).toBe(true);

        await user.selectOptions(input, "new");
        await user.keyboard("{Enter}");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "" }) as HTMLOptionElement).selected).toBe(false);
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

    it("calls onSubmit with null when empty string", async () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} submitEmptyAsNull />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.selectOptions(input, "");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(null);
        expect((getByRole("option", { name: "" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
    });

    it("uses externally provided disable", () => {
        const onSubmit = vi.fn();
        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} disabled />);
        const input = getByRole("combobox") as HTMLSelectElement;

        expect(input.disabled).toStrictEqual(true);
    });

    it("syncs previous and draft when committed value changes externally", () => {
        const onSubmit = vi.fn();
        const { getByRole, rerender } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(true);

        rerender(<TestSelectInput value="new" onSubmit={onSubmit} />);

        expect(input.value).toStrictEqual("new");
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
    });

    it("syncs previous but not draft when committed value changes externally but draft already same", async () => {
        const onSubmit = vi.fn();
        const { getByRole, rerender } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(false);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(true);

        await user.selectOptions(input, "new");

        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);

        rerender(<TestSelectInput value="new" onSubmit={onSubmit} />);

        expect(input.value).toStrictEqual("new");
        expect((getByRole("option", { name: "new" }) as HTMLOptionElement).selected).toBe(true);
        expect((getByRole("option", { name: "old" }) as HTMLOptionElement).selected).toBe(false);
    });

    it("reports submit errors and recovers submitting state", async () => {
        const expectedError = new Error("submit failed");
        const onSubmit = vi.fn(async () => {
            await Promise.reject(expectedError);
        });

        const { getByRole } = render(<TestSelectInput value="old" onSubmit={onSubmit} />);
        const input = getByRole("combobox") as HTMLSelectElement;

        await user.selectOptions(input, "new");
        await user.tab();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(input.disabled).toStrictEqual(false);
        expect(input.validationMessage).toStrictEqual("submit failed");
    });
});
