import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { CONVERTERS_CODESPACE_URL, CONVERTERS_DOCS_URL, EXTENSIONS_DOCS_URL, MQTT_TOPICS_DOCS_URL } from "../../../consts.js";
import { type AppState, useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import Button from "../../Button.js";
import ConfirmButton from "../../ConfirmButton.js";
import InputField from "../../form-fields/InputField.js";
import SelectField from "../../form-fields/SelectField.js";
import TextareaField from "../../form-fields/TextareaField.js";
import InfoAlert from "../../InfoAlert.js";

export type TabName = "mqtt" | "external_converters" | "external_extensions";

type DevConsoleProps = { sourceIdx: number; tab: TabName };

type DevConsoleTabProps = { sourceIdx: number };

const MqttTab = ({ sourceIdx }: DevConsoleTabProps) => {
    const { t } = useTranslation(["devConsole", "common"]);
    const [topic, setTopic] = useState("");
    const [mqttPayload, setMqttPayload] = useState("{}");

    const canSend = useMemo(() => {
        if (!topic) {
            return false;
        }

        // allow empty strings
        if (mqttPayload !== "") {
            try {
                const parsedPayload = JSON.parse(mqttPayload);

                if (typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
                    return false;
                }
            } catch {
                return false;
            }
        }

        return true;
    }, [topic, mqttPayload]);

    const onSend = useCallback(async () => {
        await sendMessage(
            sourceIdx,
            // @ts-expect-error dev
            topic,
            mqttPayload === "" ? mqttPayload : JSON.parse(mqttPayload),
        );
    }, [sourceIdx, topic, mqttPayload]);

    return (
        <>
            <h2 className="text-lg mb-2">{t("send_mqtt")}</h2>
            <InfoAlert>
                <a href={MQTT_TOPICS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </InfoAlert>
            <InputField
                type="text"
                name="topic"
                label={t("topic")}
                detail={t("mqtt_topic_info")}
                placeholder="bridge/request/permit_join"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input validator w-full"
                required
            />
            <TextareaField
                name="payload"
                label={t("common:payload")}
                rows={5}
                value={mqttPayload}
                onChange={(e) => setMqttPayload(e.target.value)}
                className="textarea validator w-full"
            />
            <div className="join join-horizontal mt-2">
                <Button<void> onClick={onSend} disabled={!canSend} className="btn btn-success">
                    {t("common:send")}
                </Button>
            </div>
        </>
    );
};

const ExternalConverterTab = ({ sourceIdx }: DevConsoleTabProps) => {
    const { t } = useTranslation(["devConsole", "common"]);
    const converters = useAppStore(useShallow((state) => state.converters[sourceIdx]));
    const [selectedConverter, setSelectedConverter] = useState<AppState["converters"][number][number]>();
    const [converter, setConverter] = useState({ name: "", code: "" });

    const canSave = useMemo(() => {
        if (selectedConverter) {
            return !!converter.code;
        }

        return !!converter.name && !!converter.code;
    }, [selectedConverter, converter]);

    const onSelectChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            if (event.target.value) {
                const foundConverter = converters.find((conv) => conv.name === event.target.value);

                if (foundConverter) {
                    setSelectedConverter(foundConverter);
                    setConverter(foundConverter);
                }
            } else {
                setSelectedConverter(undefined);
                setConverter({ name: "", code: "" });
            }
        },
        [converters],
    );

    const onNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setConverter((prev) => ({ name: event.target.value, code: prev.code }));
    }, []);

    const onCodeChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        setConverter((prev) => ({ name: prev.name, code: event.target.value }));
    }, []);

    const onSave = useCallback(async () => {
        await sendMessage(sourceIdx, "bridge/request/converter/save", converter);
    }, [sourceIdx, converter]);

    const onRemove = useCallback(async () => {
        await sendMessage(sourceIdx, "bridge/request/converter/remove", { name: converter.name });
    }, [sourceIdx, converter.name]);

    return (
        <>
            <h2 className="text-lg mb-2">{t("add_update_external_converter")}</h2>
            <InfoAlert>
                <a href={CONVERTERS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
                <a href={CONVERTERS_CODESPACE_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("codespace_info")}
                </a>
            </InfoAlert>
            <SelectField
                name="converter_name_edit"
                label={t("select_converter_to_edit")}
                onChange={onSelectChange}
                value={selectedConverter?.name ?? ""}
            >
                <option value="">N/A - {t("create_new_converter")}</option>
                {converters.map((conv) => (
                    <option value={conv.name} key={conv.name}>
                        {conv.name}
                    </option>
                ))}
            </SelectField>
            <InputField
                name="converter_name"
                label={t("common:name")}
                type="text"
                onChange={onNameChange}
                value={converter.name}
                readOnly={selectedConverter !== undefined}
                required
            />
            <TextareaField
                name="converter_code"
                label={t("code")}
                rows={5}
                value={converter.code}
                onChange={onCodeChange}
                className="textarea validator w-full"
                required
            />
            <div className="join join-horizontal mt-2">
                <Button<void> onClick={onSave} disabled={!canSave} className="btn btn-success join-item">
                    {t("common:save")}
                </Button>
                <ConfirmButton<void>
                    onClick={onRemove}
                    disabled={!selectedConverter}
                    className="btn btn-error join-item"
                    title={t("common:delete")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("common:delete")}
                </ConfirmButton>
            </div>
        </>
    );
};

const ExternalExtensionTab = ({ sourceIdx }: DevConsoleTabProps) => {
    const { t } = useTranslation(["devConsole", "common"]);
    const extensions = useAppStore(useShallow((state) => state.extensions[sourceIdx]));
    const [selectedExtension, setSelectedExtension] = useState<AppState["extensions"][number][number]>();
    const [extension, setExtension] = useState({ name: "", code: "" });

    const canSave = useMemo(() => {
        if (selectedExtension) {
            return !!extension.code;
        }

        return !!extension.name && !!extension.code;
    }, [selectedExtension, extension]);

    const onSelectChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            if (event.target.value) {
                const foundExtension = extensions.find((conv) => conv.name === event.target.value);

                if (foundExtension) {
                    setSelectedExtension(foundExtension);
                    setExtension(foundExtension);
                }
            } else {
                setSelectedExtension(undefined);
                setExtension({ name: "", code: "" });
            }
        },
        [extensions],
    );

    const onNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setExtension((prev) => ({ name: event.target.value, code: prev.code }));
    }, []);

    const onCodeChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        setExtension((prev) => ({ name: prev.name, code: event.target.value }));
    }, []);

    const onSave = useCallback(async () => {
        await sendMessage(sourceIdx, "bridge/request/extension/save", extension);
    }, [sourceIdx, extension]);

    const onRemove = useCallback(async () => {
        await sendMessage(sourceIdx, "bridge/request/extension/remove", { name: extension.name });
    }, [sourceIdx, extension.name]);

    return (
        <>
            <h2 className="text-lg mb-2">{t("add_update_external_extension")}</h2>
            <InfoAlert>
                <a href={EXTENSIONS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </InfoAlert>
            <SelectField
                name="extension_name_edit"
                label={t("select_extension_to_edit")}
                onChange={onSelectChange}
                value={selectedExtension?.name ?? ""}
            >
                <option value="">N/A - {t("create_new_extension")}</option>
                {extensions.map((ext) => (
                    <option value={ext.name} key={ext.name}>
                        {ext.name}
                    </option>
                ))}
            </SelectField>
            <InputField
                name="extension_name"
                label={t("common:name")}
                type="text"
                onChange={onNameChange}
                value={extension.name}
                readOnly={selectedExtension !== undefined}
                required
            />
            <TextareaField
                name="extension_code"
                label={t("code")}
                rows={5}
                value={extension.code}
                onChange={onCodeChange}
                className="textarea validator w-full"
                required
            />
            <div className="join join-horizontal mt-2">
                <Button<void> onClick={onSave} disabled={!canSave} className="btn btn-success join-item">
                    {t("common:save")}
                </Button>
                <ConfirmButton<void>
                    onClick={onRemove}
                    disabled={!selectedExtension}
                    className="btn btn-error join-item"
                    title={t("common:delete")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("common:delete")}
                </ConfirmButton>
            </div>
        </>
    );
};

function renderTab(sourceIdx: number, tab: TabName) {
    switch (tab) {
        case "mqtt":
            return <MqttTab sourceIdx={sourceIdx} />;
        case "external_converters":
            return <ExternalConverterTab sourceIdx={sourceIdx} />;
        case "external_extensions":
            return <ExternalExtensionTab sourceIdx={sourceIdx} />;
    }
}

const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

export default function DevConsole({ sourceIdx, tab }: DevConsoleProps) {
    const { t } = useTranslation("devConsole");

    return (
        <div className="tabs tabs-border">
            <NavLink to={`/settings/${sourceIdx}/dev-console/mqtt`} className={isTabActive}>
                {t("mqtt")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/dev-console/external_converters`} className={isTabActive}>
                {t("external_converters")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/dev-console/external_extensions`} className={isTabActive}>
                {t("external_extensions")}
            </NavLink>
            <div className="tab-content block h-full bg-base-100 p-3">{renderTab(sourceIdx, tab)}</div>
        </div>
    );
}
