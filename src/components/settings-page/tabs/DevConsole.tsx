import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { CONVERTERS_CODESPACE_URL, CONVERTERS_DOCS_URL, EXTENSIONS_DOCS_URL, MQTT_TOPICS_DOCS_URL } from "../../../consts.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import type { RootState } from "../../../store.js";
import Button from "../../Button.js";
import ConfirmButton from "../../ConfirmButton.js";
import InputField from "../../form-fields/InputField.js";
import SelectField from "../../form-fields/SelectField.js";
import TextareaField from "../../form-fields/TextareaField.js";

type TabName = "mqtt" | "external_converters" | "external_extensions";

const TABS: TabName[] = ["mqtt", "external_converters", "external_extensions"];

const MqttTab = () => {
    const { t } = useTranslation(["devConsole", "common"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
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
            // @ts-expect-error dev
            topic,
            mqttPayload === "" ? mqttPayload : JSON.parse(mqttPayload),
        );
    }, [topic, mqttPayload, sendMessage]);

    return (
        <>
            <h2 className="text-lg mb-2">{t("send_mqtt")}</h2>
            <div className="alert alert-info alert-soft" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={MQTT_TOPICS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </div>
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

const ExternalConverterTab = () => {
    const { t } = useTranslation(["devConsole", "common"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const converters = useAppSelector((state) => state.converters);
    const [selectedConverter, setSelectedConverter] = useState<RootState["converters"][number]>();
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

    const onNameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setConverter({ name: event.target.value, code: converter.code });
        },
        [converter.code],
    );

    const onCodeChange = useCallback(
        (event: ChangeEvent<HTMLTextAreaElement>) => {
            setConverter({ name: converter.name, code: event.target.value });
        },
        [converter.name],
    );

    const onSave = useCallback(async () => {
        await sendMessage("bridge/request/converter/save", converter);
    }, [sendMessage, converter]);

    const onRemove = useCallback(async () => {
        await sendMessage("bridge/request/converter/remove", { name: converter.name });
    }, [sendMessage, converter.name]);

    return (
        <>
            <h2 className="text-lg mb-2">{t("add_update_external_converter")}</h2>
            <div className="alert alert-info alert-soft" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={CONVERTERS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
                <a href={CONVERTERS_CODESPACE_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("codespace_info")}
                </a>
            </div>
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

const ExternalExtensionTab = () => {
    const { t } = useTranslation(["devConsole", "common"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const extensions = useAppSelector((state) => state.extensions);
    const [selectedExtension, setSelectedExtension] = useState<RootState["extensions"][number]>();
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

    const onNameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setExtension({ name: event.target.value, code: extension.code });
        },
        [extension.code],
    );

    const onCodeChange = useCallback(
        (event: ChangeEvent<HTMLTextAreaElement>) => {
            setExtension({ name: extension.name, code: event.target.value });
        },
        [extension.name],
    );

    const onSave = useCallback(async () => {
        await sendMessage("bridge/request/extension/save", extension);
    }, [sendMessage, extension]);

    const onRemove = useCallback(async () => {
        await sendMessage("bridge/request/extension/remove", { name: extension.name });
    }, [sendMessage, extension.name]);

    return (
        <>
            <h2 className="text-lg mb-2">{t("add_update_external_extension")}</h2>
            <div className="alert alert-info alert-soft" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={EXTENSIONS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </div>
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

export default function DevConsole() {
    const [currentTab, setCurrentTab] = useState<TabName>(TABS[0]);
    const { t } = useTranslation("devConsole");

    const content = useMemo(() => {
        switch (currentTab) {
            case "mqtt":
                return <MqttTab />;
            case "external_converters":
                return <ExternalConverterTab />;
            case "external_extensions":
                return <ExternalExtensionTab />;
        }

        return <></>;
    }, [currentTab]);

    return (
        <div className="tabs tabs-border">
            {TABS.map((tab) => (
                <Button key={tab} className={`tab${currentTab === tab ? " tab-active" : ""}`} aria-current="page" item={tab} onClick={setCurrentTab}>
                    {t(tab)}
                </Button>
            ))}
            <div className="tab-content block h-full bg-base-100 p-3">{content}</div>
        </div>
    );
}
