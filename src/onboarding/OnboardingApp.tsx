import { useEffect, useState } from "react";
import type { OnboardData } from "zigbee2mqtt";
import { DonePage } from "./DonePage.js";
import { FailurePage } from "./FailurePage.js";
import { FormPage } from "./FormPage.js";

export function OnboardingApp() {
    const [data, setData] = useState<OnboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/data");

                if (!response.ok) {
                    throw new Error(`Failed to load onboarding data (${response.status})`);
                }

                const payload = (await response.json()) as OnboardData;

                if (active) {
                    setData(payload);
                }
            } catch (error) {
                if (active) {
                    setError((error as Error).message);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div role="alert" className="alert alert-error">
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    if (data.page === "failure") {
        return <FailurePage errors={data.errors} />;
    }

    if (data.page === "done") {
        return <DonePage frontendUrl={data.frontendUrl} />;
    }

    return (
        <FormPage
            data={data}
            onDone={(frontendUrl) => {
                setData({ page: "done", frontendUrl });
            }}
        />
    );
}
