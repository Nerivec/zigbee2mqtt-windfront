import { useEffect, useState } from "react";

type DonePageProps = {
    frontendUrl: string | null;
};

export function DonePage({ frontendUrl }: DonePageProps) {
    const [secondsLeft, setSecondsLeft] = useState(30);

    useEffect(() => {
        if (!frontendUrl) {
            return;
        }

        const timeout = setTimeout(() => {
            window.location.replace(frontendUrl);
        }, 30000);

        const interval = setInterval(() => {
            setSecondsLeft((previous) => Math.max(previous - 1, 0));
        }, 1000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [frontendUrl]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h1 className="card-title mb-3">Zigbee2MQTT Onboarding</h1>
                    <p>Settings saved successfully.</p>
                    <p>Zigbee2MQTT is now starting...</p>
                    {frontendUrl ? (
                        <p>
                            Redirecting in {secondsLeft}s...
                            <a className="link link-primary" href={frontendUrl}>
                                {frontendUrl}
                            </a>
                        </p>
                    ) : (
                        <p>You can close this page.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
