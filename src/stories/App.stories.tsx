import type { Meta, StoryObj } from "@storybook/react";
import { type JSX, useEffect, useMemo, useState } from "react";
import { Main } from "../Main.js";

interface StoryMode {
    apiUrls: string[];
    apiNames: string[];
}

const useEnsureStoryMode = ({ apiUrls, apiNames }: StoryMode): boolean => {
    const [ready, setReady] = useState(false);
    const targetUrls = useMemo(() => apiUrls.join(","), [apiUrls]);
    const targetNames = useMemo(() => apiNames.join(","), [apiNames]);

    useEffect(() => {
        const url = new URL(window.location.href);
        const currentUrls = url.searchParams.get("sb-api-urls");
        const currentNames = url.searchParams.get("sb-api-names");

        if (currentUrls === targetUrls && currentNames === targetNames) {
            setReady(true);

            return;
        }

        url.searchParams.set("sb-api-urls", targetUrls);
        url.searchParams.set("sb-api-names", targetNames);

        window.location.href = url.toString();
    }, [targetUrls, targetNames]);

    return ready;
};

const StorybookApp = ({ apiUrls, apiNames }: StoryMode): JSX.Element => {
    const ready = useEnsureStoryMode({ apiUrls, apiNames });

    if (!ready) {
        return (
            <div className="flex flex-row items-center justify-center min-h-screen">
                <span className="loading loading-infinity loading-lg" />
            </div>
        );
    }

    return <Main />;
};

const meta: Meta<typeof StorybookApp> = {
    title: "App",
    component: StorybookApp,
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

export const SingleInstance: StoryObj<typeof StorybookApp> = {
    name: "Single instance",
    render: () => <StorybookApp apiUrls={["localhost:8080/api"]} apiNames={["Main"]} />,
};

export const MultiInstance: StoryObj<typeof StorybookApp> = {
    name: "Multi instance",
    render: () => <StorybookApp apiUrls={["localhost:8080/api", "localhost:8181/api"]} apiNames={["Main", "Secondary"]} />,
};
