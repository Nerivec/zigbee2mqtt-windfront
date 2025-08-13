import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { SUPPORT_NEW_DEVICES_DOCS_URL, Z2M_NEW_GITHUB_ISSUE_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import type { Device, LogMessage } from "../../../types.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Button from "../../Button.js";
import ConfirmButton from "../../ConfirmButton.js";
import TextareaField from "../../form-fields/TextareaField.js";
import Json from "../../value-decorators/Json.js";
import { AttributeEditor, type AttributeInfo } from "../AttributeEditor.js";
import { CommandExecutor } from "../CommandExecutor.js";

interface RequestSupportLinkProps {
    device: Device;
    externalDefinition: string;
}

interface DevConsoleProps {
    device: Device;
}

const ATTRIBUTE_LOG_REGEX = /^(zhc:tz: Read result of |z2m: Publish 'set' 'read' to |z2m: Publish 'set' 'write' to |zhc:tz: Wrote )/;

const RequestSupportLink = memo(({ device, externalDefinition }: RequestSupportLinkProps) => {
    const { t } = useTranslation("zigbee");
    const zhcVersion = useAppStore((state) => state.bridgeInfo.zigbee_herdsman_converters.version);
    const githubUrlParams = {
        labels: "new device support",
        title: `[New device support] ${device.model_id} from ${device.manufacturer}`,
        body: `<!-- MAKE SURE THIS IS NOT ALREADY POSTED ${Z2M_NEW_GITHUB_ISSUE_URL.slice(0, -4)} -->

### Link

### What does/doesn't work with the external definition?

### Details
zigbee-herdsman-converters: \`${zhcVersion}\`
software_build_id: \`${device.software_build_id}\`
date_code: \`${device.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(device.endpoints)}
\`\`\`

### External definition:
\`\`\`ts
${externalDefinition}
\`\`\`
`,
    };

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            to={`${Z2M_NEW_GITHUB_ISSUE_URL}?${new URLSearchParams(githubUrlParams).toString()}`}
            className="btn"
        >
            {t("request_support")}
        </Link>
    );
});

export default function DevConsole({ device }: DevConsoleProps) {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["devConsole", "common"]);
    const resetDeviceState = useAppStore((state) => state.resetDeviceState);
    const lastLog = useAppStore((state) => state.lastNonDebugLog);
    const [lastAttributeLog, setLastAttributeLog] = useState<LogMessage>();
    const [lastCommandLog, setLastCommandLog] = useState<LogMessage>();
    const [extDefLoading, setExtDefLoading] = useState(false);
    const [showDefinition, setShowDefinition] = useState(false);
    const externalDefinition = useAppStore(useShallow((state) => state.generatedExternalDefinitions[device.ieee_address]));

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setExtDefLoading(false);
    }, [device]);

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

    const onGenerateExternalDefinitionClick = useCallback(async (): Promise<void> => {
        setExtDefLoading(true);
        await sendMessage("bridge/request/device/generate_external_definition", { id: device.ieee_address });
    }, [sendMessage, device.ieee_address]);

    const resetState = useCallback(() => {
        resetDeviceState(device.friendly_name);
    }, [resetDeviceState, device.friendly_name]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-center items-center gap-2">
                {!externalDefinition ? (
                    extDefLoading ? (
                        <span className="loading loading-infinity loading-xl" />
                    ) : (
                        <Button<void> className="btn btn-primary" onClick={onGenerateExternalDefinitionClick}>
                            {t("generate_external_definition")}
                        </Button>
                    )
                ) : device.supported ? null : (
                    <RequestSupportLink device={device} externalDefinition={externalDefinition} />
                )}
                <Button item={!showDefinition} onClick={setShowDefinition} className="btn btn-primary">
                    {t(showDefinition ? "hide_definition" : "show_definition")}
                </Button>
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
            {externalDefinition && (
                <>
                    <div className="divider" />
                    <TextareaField
                        name="generated_external_definition"
                        label={t("generated_external_definition")}
                        value={externalDefinition}
                        className="textarea w-full"
                        rows={8}
                        readOnly
                    />
                    <Link to={SUPPORT_NEW_DEVICES_DOCS_URL} target="_blank" rel="noreferrer" className="link link-primary self-end">
                        {t("common:documentation")}
                    </Link>
                </>
            )}
            {showDefinition && (
                <>
                    <div className="divider" />
                    <Json obj={device.definition ?? {}} lines={12} />
                </>
            )}
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
