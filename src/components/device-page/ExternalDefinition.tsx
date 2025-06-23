import { memo, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import { useAppSelector } from "../../hooks/useApp.js";
import type { Device } from "../../types.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import Button from "../Button.js";
import TextareaField from "../form-fields/TextareaField.js";

export interface ExternalDefinitionProps {
    device: Device;
}

const ExternalDefinition = memo((props: ExternalDefinitionProps) => {
    const { device } = props;
    const [loading, setLoading] = useState<boolean>(false);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["devConsole", "common"]);
    const externalDefinition = useAppSelector((state) => state.generatedExternalDefinitions[device.ieee_address]);

    const onGenerateExternalDefinitionClick = useCallback(async (): Promise<void> => {
        setLoading(true);
        await sendMessage("bridge/request/device/generate_external_definition", { id: device.ieee_address });
    }, [sendMessage, device.ieee_address]);

    return externalDefinition ? (
        <>
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
    ) : (
        <div className="flex flex-row justify-center items-center gap-2">
            {loading ? (
                <span className="loading loading-infinity loading-xl" />
            ) : (
                <Button<void> className="btn btn-primary" onClick={onGenerateExternalDefinitionClick}>
                    {t("generate_external_definition")}
                </Button>
            )}
        </div>
    );
});

export default ExternalDefinition;
