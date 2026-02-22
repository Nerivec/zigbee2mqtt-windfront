import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

type FailurePageProps = {
    errors: string[];
};

export function FailurePage({ errors }: FailurePageProps) {
    const [submitting, setSubmitting] = useState(false);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h1 className="card-title text-error mb-3">Zigbee2MQTT configuration is not valid</h1>

                    <p>Found the following errors:</p>

                    <ul className="list-disc ps-6 mb-3 w-full bg-base-100 rounded-box">
                        {errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>

                    <p>If you do not know how to solve this, check the documentation:</p>

                    <ul className="menu w-full bg-base-100 rounded-box">
                        <li>
                            <a href="https://www.zigbee2mqtt.io/guide/configuration" target="_blank" rel="noreferrer">
                                <FontAwesomeIcon icon={faLink} /> Configuration
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.zigbee2mqtt.io/guide/installation/20_zigbee2mqtt-fails-to-start_crashes-runtime.html"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <FontAwesomeIcon icon={faLink} /> Zigbee2MQTT fails to start/crashes runtime
                            </a>
                        </li>
                    </ul>

                    <div className="card-actions justify-end">
                        <button
                            className="btn btn-error"
                            type="button"
                            disabled={submitting}
                            onClick={async () => {
                                setSubmitting(true);

                                try {
                                    await fetch("/submit", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: "{}",
                                    });
                                } finally {
                                    setSubmitting(false);
                                    window.close();
                                }
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
