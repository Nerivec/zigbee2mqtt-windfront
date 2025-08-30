import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import store2 from "store2";
import Button from "../components/Button.js";
import { AUTH_TOKEN_KEY } from "../localStoreConsts.js";
import { API_NAMES, MULTI_INSTANCE, useAppStore } from "../store.js";
import { startWebSocketManager } from "../websocket/WebSocketManager.js";

export function LoginPage() {
    const authRequired = useAppStore((s) => s.authRequired);
    const [values, setValues] = useState(() => API_NAMES.map((_v, idx) => store2.get(`${AUTH_TOKEN_KEY}_${idx}`, "") as string));

    const onSubmit = () => {
        const newAuth: boolean[] = [];

        for (let i = 0; i < API_NAMES.length; i++) {
            const token = values[i] ?? "";

            if (token) {
                store2.set(`${AUTH_TOKEN_KEY}_${i}`, token);
            } else {
                store2.remove(`${AUTH_TOKEN_KEY}_${i}`);
            }

            newAuth[i] = false;
        }

        // set in one batch, don't want to re-render for each
        useAppStore.setState({ authRequired: newAuth });
        // will start whatever WS still needs starting based on current status
        startWebSocketManager();
    };

    if (!authRequired) {
        return null;
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">Auth</h2>
                    {API_NAMES.map((name, i) =>
                        authRequired[i] ? (
                            <label key={name} className="input validator w-full">
                                {MULTI_INSTANCE ? `${name} token` : "Token"}
                                <input
                                    type="password"
                                    className="grow"
                                    autoCapitalize="none"
                                    value={values[i]}
                                    onChange={(e) => {
                                        const newValues = Array.from(values);
                                        newValues[i] = e.target.value;

                                        setValues(newValues);
                                    }}
                                    required
                                />
                            </label>
                        ) : null,
                    )}
                    <div className="card-actions justify-end">
                        <Button<void> className="btn btn-square btn-primary" onClick={onSubmit}>
                            <FontAwesomeIcon icon={faArrowRightLong} />
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
