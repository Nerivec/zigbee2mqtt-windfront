import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../hooks/useApp.js";
import { resetDeviceState } from "../../../store.js";
import type { Device, LogMessage } from "../../../types.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import ConfirmButton from "../../ConfirmButton.js";
import { AttributeEditor, type AttributeInfo } from "../AttributeEditor.js";
import { CommandExecutor } from "../CommandExecutor.js";
import ExternalDefinition from "../ExternalDefinition.js";

interface DevConsoleProps {
    device: Device;
}

const ATTRIBUTE_LOG_REGEX = /^(zhc:tz: Read result of |z2m: Publish 'set' 'read' to |z2m: Publish 'set' 'write' to |zhc:tz: Wrote )/;

export default function DevConsole({ device }: DevConsoleProps) {
    const dispatch = useAppDispatch();
    const { t } = useTranslation(["devConsole", "common"]);
    const lastLog = useAppSelector((state) => state.lastNonDebugLog);
    const [lastAttributeLog, setLastAttributeLog] = useState<LogMessage>();
    const [lastCommandLog, setLastCommandLog] = useState<LogMessage>();
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    useEffect(() => {
        if (lastLog) {
            if (lastLog.message.startsWith("zhc:tz: Invoked ")) {
                setLastCommandLog(lastLog);
            } else if (ATTRIBUTE_LOG_REGEX.test(lastLog.message)) {
                setLastAttributeLog(lastLog);
            }
        }
    }, [lastLog]);

    const readDeviceAttributes = useCallback(
        async (ieee: string, endpoint: string, cluster: string, attributes: string[], stateProperty?: string) => {
            const payload: { read: Record<string, unknown> } = { read: { cluster, attributes } };

            if (stateProperty) {
                payload.read.state_property = stateProperty;
            }

            await sendMessage<"{friendlyNameOrId}/{endpoint}/set">(
                // @ts-expect-error templated API endpoint
                `${ieee}/${endpoint}/set`,
                payload,
            );
        },
        [sendMessage],
    );

    const writeDeviceAttributes = useCallback(
        async (ieee: string, endpoint: string, cluster: string, attributes: AttributeInfo[]) => {
            const payload: { write: Record<string, unknown> & { payload: Record<string, unknown> } } = { write: { cluster, payload: {} } };

            for (const attrInfo of attributes) {
                payload.write.payload[attrInfo.attribute] = attrInfo.value;
            }

            await sendMessage<"{friendlyNameOrId}/{endpoint}/set">(
                // @ts-expect-error templated API endpoint
                `${ieee}/${endpoint}/set`,
                payload,
            );
        },
        [sendMessage],
    );

    const resetState = useCallback(() => {
        dispatch(resetDeviceState(device.friendly_name));
    }, [dispatch, device.friendly_name]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-center items-center gap-2">
                <ConfirmButton
                    className="btn btn-error"
                    onClick={resetState}
                    title={t("reset_frontend_state")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("reset_frontend_state")}
                </ConfirmButton>
            </div>
            <div className="divider" />
            <ExternalDefinition device={device} />
            <div className="divider" />
            <div className="flex flex-row flex-wrap justify-evenly gap-4">
                <AttributeEditor
                    device={device}
                    lastLog={lastAttributeLog}
                    readDeviceAttributes={readDeviceAttributes}
                    writeDeviceAttributes={writeDeviceAttributes}
                />
                <CommandExecutor device={device} lastLog={lastCommandLog} />
            </div>
        </div>
    );
}
