import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import store2 from "store2";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Numeric from "../src/components/features/Numeric.js";
import type { Device, NumericFeature } from "../src/types.js";

const device = {
    ieee_address: "0x00124b0000000001",
    definition: {
        exposes: [],
    },
} as Device;

const feature: NumericFeature = {
    type: "numeric",
    access: 3,
    label: "Occupied heating setpoint",
    name: "occupied_heating_setpoint",
    property: "occupied_heating_setpoint",
    unit: "°C",
    value_min: 5,
    value_max: 30,
    value_step: 0.5,
};

describe("Numeric temperature display", () => {
    beforeEach(() => {
        store2.clearAll();
        store2.set("temperature-unit", "fahrenheit");
        store2.set("temperature-scope", "all");
    });

    it("converts the value, bounds, range step, unit, and outgoing writes", async () => {
        const onChange = vi.fn();

        render(<Numeric feature={feature} device={device} deviceValue={20} onChange={onChange} />);

        const input = screen.getByRole("spinbutton") as HTMLInputElement;

        expect(input.valueAsNumber).toBe(68);
        expect(input.min).toBe("41");
        expect(input.max).toBe("86");
        expect(input.step).toBe("any");
        expect(input.parentElement?.textContent).toContain("°F");
        expect((screen.getByRole("slider") as HTMLInputElement).step).toBe("0.9");

        fireEvent.change(input, { target: { value: "70" } });
        fireEvent.blur(input);

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({ occupied_heating_setpoint: 21 });
        });
    });

    it("converts read-only values and units", () => {
        render(<Numeric feature={{ ...feature, access: 1 }} device={device} deviceValue={20} onChange={vi.fn()} />);

        expect(screen.getByText("68").parentElement?.textContent).toContain("°F");
    });
});
