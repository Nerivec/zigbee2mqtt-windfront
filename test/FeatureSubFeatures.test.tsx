import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FeatureSubFeatures from "../src/components/features/FeatureSubFeatures.js";
import FeatureWrapper from "../src/components/features/FeatureWrapper.js";
import type { Device, FeatureWithAnySubFeatures } from "../src/types.js";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: (arg: Record<string, string>) => string) => {
            const translations: Record<string, string> = {
                apply: "Apply",
            };

            return key(translations);
        },
    }),
}));

interface FeatureCallbacks {
    onChange: (value: Record<string, unknown>) => Promise<void>;
    onRead?: (prop: Record<string, unknown>) => Promise<void>;
}

const mockFeatureCallbacks = new Map<string, FeatureCallbacks>();
let mockApplyCallback: (() => void) | null = null;
const applyButtons = new Set<string>();

vi.mock("../src/components/features/Feature.js", () => ({
    default: ({
        feature,
        onChange,
        onRead,
    }: {
        feature: { name: string };
        onChange: FeatureCallbacks["onChange"];
        onRead?: FeatureCallbacks["onRead"];
    }) => {
        mockFeatureCallbacks.set(feature.name, { onChange, onRead });

        return null;
    },
}));

vi.mock("../src/components/Button.js", () => ({
    default: ({ onClick, children, title }: { onClick: () => void; children: ReactNode; title: string }) => {
        mockApplyCallback = onClick;
        applyButtons.add(title);

        return (
            <button type="button" onClick={onClick}>
                {children}
            </button>
        );
    },
}));

describe("FeatureSubFeatures", () => {
    const mockDevice: Device = {
        ieee_address: "0x00158d00045b2a5e",
        friendly_name: "TestDevice",
        definition: {
            model: "TestModel",
            vendor: "TestVendor",
        },
    } as Device;

    beforeEach(() => {
        mockFeatureCallbacks.clear();

        mockApplyCallback = null;
        applyButtons.clear();

        vi.clearAllMocks();
    });

    describe("Component Rendering", () => {
        it("renders all features from feature.features array", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [
                    { type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" },
                    { type: "numeric", name: "feature2", property: "prop2", access: 7, label: "" },
                    { type: "binary", name: "feature3", property: "prop3", access: 7, label: "", value_on: "ON", value_off: "OFF" },
                ],
            };

            render(
                <FeatureSubFeatures feature={feature} device={mockDevice} deviceState={{}} onChange={vi.fn()} featureWrapperClass={FeatureWrapper} />,
            );

            expect(mockFeatureCallbacks.size).toStrictEqual(3);
            expect(mockFeatureCallbacks.has("feature1")).toStrictEqual(true);
            expect(mockFeatureCallbacks.has("feature2")).toStrictEqual(true);
            expect(mockFeatureCallbacks.has("feature3")).toStrictEqual(true);
        });

        it("renders with empty features array", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [],
            };

            render(
                <FeatureSubFeatures feature={feature} device={mockDevice} deviceState={{}} onChange={vi.fn()} featureWrapperClass={FeatureWrapper} />,
            );

            expect(mockFeatureCallbacks.size).toStrictEqual(0);
        });

        it("handles feature without features property", () => {
            const feature = {
                type: "composite",
                property: "test",
            } as FeatureWithAnySubFeatures;

            render(
                <FeatureSubFeatures feature={feature} device={mockDevice} deviceState={{}} onChange={vi.fn()} featureWrapperClass={FeatureWrapper} />,
            );

            expect(mockFeatureCallbacks.size).toStrictEqual(0);
        });

        it("passes all props to child Feature components", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };
            const onChange = vi.fn();
            const onRead = vi.fn();

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{ test: 123 }}
                    onChange={onChange}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("feature1");
            expect(callback).toBeDefined();
            expect(callback?.onChange).toBeDefined();
            expect(callback?.onRead).toBeDefined();
        });
    });

    describe("isFeatureRoot logic", () => {
        it("identifies root when type=composite and parentFeatures is empty array", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [
                    { type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" },
                    { type: "numeric", name: "feature2", property: "prop2", access: 7, label: "" },
                    { type: "binary", name: "feature3", property: "prop3", access: 7, label: "", value_on: "ON", value_off: "OFF" },
                ],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(1);
            expect(applyButtons.has("test")).toStrictEqual(true);
        });

        it("identifies root when type=composite with single non-composite/non-list parent", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[{ type: "switch", name: "parent", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(1);
            expect(applyButtons.has("test")).toStrictEqual(true);
        });

        it("identifies root when type=composite with multiple non-composite parents", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[
                        { type: "switch", name: "parent1", label: "", access: 7, features: [feature] },
                        { type: "light", name: "parent2", label: "", access: 7, features: [feature] },
                    ]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(1);
            expect(applyButtons.has("test")).toStrictEqual(true);
        });

        it("identifies non-root when type=composite with composite parent", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[{ type: "composite", name: "parent", label: "", access: 7, property: "parent", features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(0);
        });

        it("identifies non-root when type=composite with list parent", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[
                        {
                            type: "list",
                            name: "parent",
                            label: "",
                            access: 7,
                            property: "parent",
                            item_type: { type: "composite", name: "feature1", property: "prop1", access: 7, label: "", features: [feature] },
                        },
                    ]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(0);
        });

        it("identifies non-root when type=composite with top parent composite", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[
                        { type: "composite", name: "parent1", label: "", property: "p1", access: 7, features: [feature] },
                        { type: "light", name: "parent2", label: "", access: 7, features: [feature] },
                    ]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(0);
        });

        it("identifies non-root when type=composite with non-top parent composite", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "nested",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[
                        { type: "light", name: "parent1", label: "", access: 7, features: [feature] },
                        { type: "composite", name: "parent2", label: "", property: "p2", access: 7, features: [feature] },
                    ]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(0);
        });

        it("identifies non-root when type is not composite", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "list",
                property: "test",
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    parentFeatures={[]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            expect(applyButtons.size).toStrictEqual(0);
        });

        it("identifies non-root when parentFeatures is undefined", () => {
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop1", access: 7, label: "" }],
            };

            render(
                <FeatureSubFeatures feature={feature} device={mockDevice} deviceState={{}} onChange={vi.fn()} featureWrapperClass={FeatureWrapper} />,
            );

            expect(applyButtons.size).toStrictEqual(0);
        });
    });

    describe("onFeatureChange - non-root behavior", () => {
        it("passes onChange callback to child features", () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test_property",
                features: [{ type: "numeric", name: "feature1", property: "feature1", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={onChange}
                    parentFeatures={[{ type: "switch", name: "parent", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const featureCallback = mockFeatureCallbacks.get("feature1");

            expect(featureCallback?.onChange).toBeDefined();
        });

        it("calls onChange immediately with merged deviceState", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "climate",
                features: [{ type: "numeric", name: "temp", property: "temperature", label: "", access: 7 }],
            };
            const deviceState = { existing: "value", humidity: 50 };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={deviceState}
                    onChange={onChange}
                    parentFeatures={[{ type: "composite", name: "parent", property: "p", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("temp");

            // non-root should call onChange immediately
            await callback?.onChange({ temperature: 22 });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({
                climate: {
                    existing: "value",
                    humidity: 50,
                    temperature: 22,
                },
            });
        });

        it("calls onChange immediately with merged deviceState without property", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                features: [{ type: "numeric", name: "temp", property: "temperature", label: "", access: 7 }],
            };
            const deviceState = { existing: "value", humidity: 50 };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={deviceState}
                    onChange={onChange}
                    parentFeatures={[{ type: "composite", name: "parent", property: "p", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("temp");

            // non-root should call onChange immediately
            await callback?.onChange({ temperature: 22 });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({
                existing: "value",
                humidity: 50,
                temperature: 22,
            });
        });

        it("handles sequential changes", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "val", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={onChange}
                    parentFeatures={[{ type: "composite", name: "parent", property: "p", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("feature1");

            await callback?.onChange({ val: "first" });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenLastCalledWith({
                test: { val: "first" },
            });

            await callback?.onChange({ val: "second" });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenLastCalledWith({
                test: { val: "second" },
            });
        });
    });

    describe("onFeatureChange - root behavior", () => {
        it("does not call onChange immediately when root composite changes", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test_property",
                features: [{ type: "numeric", name: "feature1", property: "feature1", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={onChange}
                    parentFeatures={[]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const featureCallback = mockFeatureCallbacks.get("feature1");

            await featureCallback?.onChange({ feature1: "test-value" });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).not.toHaveBeenCalled();
        });

        it("wraps value with property when type=composite and property exists", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "climate",
                features: [{ type: "numeric", name: "temp", property: "temperature", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={onChange}
                    parentFeatures={[{ type: "switch", name: "parent", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("temp");

            expect(callback?.onChange).toBeDefined();

            await callback?.onChange({ temperature: 22 });

            await new Promise((resolve) => setTimeout(resolve, 10));

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledWith({ climate: { temperature: 22 } });
        });

        it("passes value unwrapped when type=composite without property", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                features: [{ type: "numeric", name: "feature1", property: "feature1", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={onChange}
                    parentFeatures={[{ type: "switch", name: "parent", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("feature1");

            expect(callback?.onChange).toBeDefined();

            await callback?.onChange({ feature1: 21 });

            await new Promise((resolve) => setTimeout(resolve, 10));

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledWith({ feature1: 21 });
        });

        it("accumulates state through setState", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "settings",
                features: [
                    { type: "numeric", name: "feature1", property: "val1", label: "", access: 7 },
                    { type: "numeric", name: "feature2", property: "val2", label: "", access: 7 },
                ],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={onChange}
                    parentFeatures={[{ type: "switch", name: "parent", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback1 = mockFeatureCallbacks.get("feature1");
            const callback2 = mockFeatureCallbacks.get("feature2");
            expect(callback1).toBeDefined();
            expect(callback2).toBeDefined();

            await callback1?.onChange({ val1: 10 });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenCalledTimes(0);

            await callback2?.onChange({ val2: 20 });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenCalledTimes(0);

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({ settings: { val1: 10, val2: 20 } });
        });

        it("accumulates state through setState with merged deviceState", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "settings",
                features: [
                    { type: "numeric", name: "feature1", property: "val1", label: "", access: 7 },
                    { type: "numeric", name: "feature2", property: "val2", label: "", access: 7 },
                ],
            };
            const deviceState = { existing: "data" };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={deviceState}
                    onChange={onChange}
                    parentFeatures={[{ type: "switch", name: "parent", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback1 = mockFeatureCallbacks.get("feature1");
            const callback2 = mockFeatureCallbacks.get("feature2");

            await callback1?.onChange({ val1: 10 });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenCalledTimes(0);

            await callback2?.onChange({ val2: 20 });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(onChange).toHaveBeenCalledTimes(0);

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenLastCalledWith({
                settings: {
                    existing: "data",
                    val1: 10,
                    val2: 20,
                },
            });
        });
    });

    describe("onRootApply callback", () => {
        it("calls onChange with property-wrapped combined state", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test_property",
                features: [{ type: "numeric", name: "feature1", property: "feature1", label: "", access: 7 }],
            };
            const deviceState = { temperature: 25, humidity: 60 };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={deviceState}
                    onChange={onChange}
                    parentFeatures={[]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const featureCallback = mockFeatureCallbacks.get("feature1");

            await featureCallback?.onChange({ feature1: "test-value" });

            await new Promise((resolve) => setTimeout(resolve, 10));

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({
                test_property: {
                    temperature: 25,
                    humidity: 60,
                    feature1: "test-value",
                },
            });
        });

        it("calls onChange with unwrapped combined state when no property", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
            };
            const deviceState = { temperature: 25, humidity: 60 };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={deviceState}
                    onChange={onChange}
                    parentFeatures={[{ type: "light", name: "parent", label: "", access: 7, features: [feature] }]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const featureCallback = mockFeatureCallbacks.get("feature1");

            await featureCallback?.onChange({ prop: "test-value" });

            await new Promise((resolve) => setTimeout(resolve, 10));

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({
                temperature: 25,
                humidity: 60,
                prop: "test-value",
            });
        });

        it("merges deviceState with accumulated state changes", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "settings",
                features: [
                    { type: "numeric", name: "feature1", property: "val1", label: "", access: 7 },
                    { type: "numeric", name: "feature2", property: "val2", label: "", access: 7 },
                    { type: "numeric", name: "feature3", property: "val3", label: "", access: 7 },
                ],
            };
            const deviceState = { existing: "value", val1: "old" };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={deviceState}
                    onChange={onChange}
                    parentFeatures={[]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback1 = mockFeatureCallbacks.get("feature1");
            const callback2 = mockFeatureCallbacks.get("feature2");
            const callback3 = mockFeatureCallbacks.get("feature3");

            await callback1?.onChange({ val1: "new1" });
            await callback2?.onChange({ val2: "new2" });
            await callback3?.onChange({ val3: "new3" });

            await new Promise((resolve) => setTimeout(resolve, 10));

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith({ settings: { existing: "value", val1: "new1", val2: "new2", val3: "new3" } });
        });

        it("works with empty deviceState", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={onChange}
                    parentFeatures={[]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("feature1");
            await callback?.onChange({ prop: "value" });

            await new Promise((resolve) => setTimeout(resolve, 10));

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledWith({
                test: {
                    prop: "value",
                },
            });
        });

        it("works when no features have changed", async () => {
            const onChange = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
            };

            const deviceState = { prop: "original" };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={deviceState}
                    onChange={onChange}
                    parentFeatures={[]}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            await new Promise((resolve) => setTimeout(resolve, 10));

            mockApplyCallback?.();

            expect(onChange).toHaveBeenCalledWith({
                test: deviceState,
            });
        });
    });

    describe("onFeatureRead callback", () => {
        it("passes onRead to child Feature components", () => {
            const onRead = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "test",
                features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("feature1");
            expect(callback?.onRead).toBeDefined();
        });

        it("wraps read value with property when type=composite", async () => {
            const onRead = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                property: "climate",
                features: [{ type: "numeric", name: "temp", property: "temperature", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("temp");

            await callback?.onRead?.({ temperature: 22 });

            expect(onRead).toHaveBeenCalledWith({
                climate: { temperature: 22 },
            });
        });

        it("passes unwrapped read value when no property", async () => {
            const onRead = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "composite",
                features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("feature1");

            await callback?.onRead?.({ prop: "value" });

            expect(onRead).toHaveBeenCalledWith({ prop: "value" });
        });

        it("passes read value directly when type is not composite", async () => {
            const onRead = vi.fn();
            const feature: FeatureWithAnySubFeatures = {
                type: "switch",
                property: "climate",
                features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
            };

            render(
                <FeatureSubFeatures
                    feature={feature}
                    device={mockDevice}
                    deviceState={{}}
                    onChange={vi.fn()}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                />,
            );

            const callback = mockFeatureCallbacks.get("feature1");

            await callback?.onRead?.({ prop: "value" });

            expect(onRead).toHaveBeenCalledWith({ prop: "value" });
        });
    });

    it("resets state when device ieee_address changes", async () => {
        const onChange = vi.fn();
        const feature: FeatureWithAnySubFeatures = {
            type: "composite",
            property: "test",
            features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
        };

        const { rerender } = render(
            <FeatureSubFeatures
                feature={feature}
                device={mockDevice}
                deviceState={{}}
                onChange={onChange}
                parentFeatures={[]}
                featureWrapperClass={FeatureWrapper}
            />,
        );

        const callback = mockFeatureCallbacks.get("feature1");
        await callback?.onChange({ prop: "value1" });

        await new Promise((resolve) => setTimeout(resolve, 10));

        mockFeatureCallbacks.clear();

        rerender(
            <FeatureSubFeatures
                feature={feature}
                device={{ ...mockDevice, ieee_address: "0x1234" }}
                deviceState={{}}
                onChange={onChange}
                parentFeatures={[]}
                featureWrapperClass={FeatureWrapper}
            />,
        );

        await new Promise((resolve) => setTimeout(resolve, 10));

        mockApplyCallback?.();

        // state was reset
        expect(onChange).toHaveBeenCalledWith({ test: {} });
    });

    it("handles endpointSpecific prop", () => {
        const feature: FeatureWithAnySubFeatures = {
            type: "composite",
            property: "test",
            features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
        };

        render(
            <FeatureSubFeatures
                feature={feature}
                device={mockDevice}
                deviceState={{}}
                onChange={vi.fn()}
                endpointSpecific
                featureWrapperClass={FeatureWrapper}
            />,
        );

        expect(mockFeatureCallbacks.size).toStrictEqual(1);
    });

    it("handles steps prop", () => {
        const feature: FeatureWithAnySubFeatures = {
            type: "composite",
            property: "test",
            features: [{ type: "numeric", name: "feature1", property: "prop", label: "", access: 7 }],
        };

        const steps = {
            feature1: [
                { value: 1, name: "One" },
                { value: 2, name: "Two" },
            ],
        };

        render(
            <FeatureSubFeatures
                feature={feature}
                device={mockDevice}
                deviceState={{}}
                onChange={vi.fn()}
                steps={steps}
                featureWrapperClass={FeatureWrapper}
            />,
        );

        expect(mockFeatureCallbacks.size).toStrictEqual(1);
    });

    it("handles complex nested deviceState", async () => {
        const onChange = vi.fn();
        const feature: FeatureWithAnySubFeatures = {
            type: "composite",
            property: "config",
            features: [{ type: "numeric", name: "feature1", property: "nested", label: "", access: 7 }],
        };

        const deviceState = {
            nested: { deep: { value: "original" } },
            other: [1, 2, 3],
        };

        render(
            <FeatureSubFeatures
                feature={feature}
                device={mockDevice}
                deviceState={deviceState}
                onChange={onChange}
                parentFeatures={[]}
                featureWrapperClass={FeatureWrapper}
            />,
        );

        const callback = mockFeatureCallbacks.get("feature1");
        await callback?.onChange({ nested: { deep: { value: "updated" } } });

        await new Promise((resolve) => setTimeout(resolve, 10));

        mockApplyCallback?.();

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({ config: { nested: { deep: { value: "updated" } }, other: [1, 2, 3] } });
    });

    it("handles many features", () => {
        const features = Array.from({ length: 20 }, (_, i) => ({
            type: "numeric" as const,
            name: `feature${i}`,
            property: `prop${i}`,
            label: "",
            access: 7,
        }));

        const feature: FeatureWithAnySubFeatures = {
            type: "composite",
            property: "test",
            features,
        };

        render(<FeatureSubFeatures feature={feature} device={mockDevice} deviceState={{}} onChange={vi.fn()} featureWrapperClass={FeatureWrapper} />);

        expect(mockFeatureCallbacks.size).toStrictEqual(20);
    });
});
