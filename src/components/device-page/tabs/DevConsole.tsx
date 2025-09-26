import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { SUPPORT_NEW_DEVICES_DOCS_URL, Z2M_NEW_GITHUB_ISSUE_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import Button from "../../Button.js";
import ConfirmButton from "../../ConfirmButton.js";
import TextareaField from "../../form-fields/TextareaField.js";
import Json from "../../value-decorators/Json.js";
import AttributeEditor, { type AttributeInfo } from "../AttributeEditor.js";
import CommandExecutor from "../CommandExecutor.js";

interface RequestSupportLinkProps {
    sourceIdx: number;
    device: Device;
    externalDefinition: string;
}

interface DevConsoleProps {
    sourceIdx: number;
    device: Device;
}

const RequestSupportLink = memo(({ sourceIdx, device, externalDefinition }: RequestSupportLinkProps) => {
    const { t } = useTranslation("zigbee");
    const zhcVersion = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].zigbee_herdsman_converters.version));
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

const ATTRIBUTE_LOG_REGEX = /^(zhc:tz: Read result of |z2m: Publish 'set' 'read' to |z2m: Publish 'set' 'write' to |zhc:tz: Wrote )/;

export default function DevConsole({ sourceIdx, device }: DevConsoleProps) {
    const { t } = useTranslation(["devConsole", "common"]);
    const externalDefinition = useAppStore(useShallow((state) => state.generatedExternalDefinitions[sourceIdx][device.ieee_address]));
    const lastCommandLog = useAppStore(useShallow((state) => state.logs[sourceIdx].findLast((log) => log.message.startsWith("zhc:tz: Invoked "))));
    const lastAttributeLog = useAppStore(useShallow((state) => state.logs[sourceIdx].findLast((log) => ATTRIBUTE_LOG_REGEX.test(log.message))));
    const resetDeviceState = useAppStore((state) => state.resetDeviceState);
    const [extDefLoading, setExtDefLoading] = useState(false);
    const [showDefinition, setShowDefinition] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setExtDefLoading(false);
    }, [device]);

    const readDeviceAttributes = useCallback(
        async (ieee: string, endpoint: string, cluster: string, attributes: string[], stateProperty?: string) => {
            const payload: { read: Record<string, unknown> } = { read: { cluster, attributes } };

            if (stateProperty) {
                payload.read.state_property = stateProperty;
            }

            await sendMessage<"{friendlyNameOrId}/{endpoint}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${ieee}/${endpoint}/set`,
                payload,
            );
        },
        [sourceIdx],
    );

    const writeDeviceAttributes = useCallback(
        async (ieee: string, endpoint: string, cluster: string, attributes: AttributeInfo[]) => {
            const payload: { write: Record<string, unknown> & { payload: Record<string, unknown> } } = { write: { cluster, payload: {} } };

            for (const attrInfo of attributes) {
                payload.write.payload[attrInfo.attribute] = attrInfo.value;
            }

            await sendMessage<"{friendlyNameOrId}/{endpoint}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${ieee}/${endpoint}/set`,
                payload,
            );
        },
        [sourceIdx],
    );

    const onGenerateExternalDefinitionClick = useCallback(async (): Promise<void> => {
        setExtDefLoading(true);
        await sendMessage(sourceIdx, "bridge/request/device/generate_external_definition", { id: device.ieee_address });
    }, [sourceIdx, device.ieee_address]);

    const resetState = useCallback(() => {
        resetDeviceState(sourceIdx, device.friendly_name);
    }, [sourceIdx, device.friendly_name, resetDeviceState]);

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row flex-wrap justify-center items-center gap-2">
                {!externalDefinition ? (
                    extDefLoading ? (
                        <span className="loading loading-infinity loading-xl" />
                    ) : (
                        <Button<void> className="btn btn-primary" onClick={onGenerateExternalDefinitionClick}>
                            {t("generate_external_definition")}
                        </Button>
                    )
                ) : device.supported ? null : (
                    <RequestSupportLink sourceIdx={sourceIdx} device={device} externalDefinition={externalDefinition} />
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
                    sourceIdx={sourceIdx}
                    device={device}
                    readDeviceAttributes={readDeviceAttributes}
                    writeDeviceAttributes={writeDeviceAttributes}
                    lastLog={lastAttributeLog}
                />
                <CommandExecutor sourceIdx={sourceIdx} device={device} lastLog={lastCommandLog} />
            </div>
        </div>
    );
}
