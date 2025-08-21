import { faClose, faMagnifyingGlass, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import Button from "../components/Button.js";
import ConfirmButton from "../components/ConfirmButton.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import SelectField from "../components/form-fields/SelectField.js";
import SourceDot from "../components/SourceDot.js";
import { LOG_LEVELS, LOG_LEVELS_CMAP, LOG_LIMITS } from "../consts.js";
import { useSearch } from "../hooks/useSearch.js";
import { API_URLS, useAppStore } from "../store.js";
import type { LogMessage } from "../types.js";
import { formatDate, getValidSourceIdx } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

const HIGHLIGHT_LEVEL_CMAP = {
    error: "bg-error text-error-content",
    warning: "bg-warning text-warning-content",
    info: "bg-info text-info-content",
    debug: "bg-accent text-accent-content opacity-50",
};

type UrlParams = {
    sourceIdx: `${number}`;
};

type LogsTabProps = {
    sourceIdx: number;
};

const LogsTab = memo(({ sourceIdx }: LogsTabProps) => {
    const { t } = useTranslation(["logs", "common"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const logLevelConfig = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].config.advanced.log_level));
    const logs = useAppStore(useShallow((state) => state.logs[sourceIdx]));
    const clearLogs = useAppStore((state) => state.clearLogs);
    const [searchTerm, normalizedSearchTerm, setSearchTerm] = useSearch();
    const [logLevel, setLogLevel] = useState<string>("all");
    const [highlightOnly, setHighlightOnly] = useState<boolean>(false);

    const filteredLogs = useMemo(
        () =>
            logs.filter(
                (log) =>
                    (logLevel === "all" || log.level === logLevel) &&
                    (highlightOnly || normalizedSearchTerm.length === 0 || log.message.toLowerCase().includes(normalizedSearchTerm)),
            ),
        [normalizedSearchTerm, highlightOnly, logLevel, logs],
    );

    const colorLog = useCallback(
        (message: LogMessage["message"], level: LogMessage["level"]) =>
            normalizedSearchTerm.length > 0 && message.toLowerCase().includes(normalizedSearchTerm)
                ? HIGHLIGHT_LEVEL_CMAP[level]
                : LOG_LEVELS_CMAP[level],
        [normalizedSearchTerm],
    );

    const setLogLevelConfig = useCallback(
        async (level: string) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { advanced: { log_level: level } } });
        },
        [sourceIdx, sendMessage],
    );

    return (
        <>
            <div className="flex flex-row flex-wrap gap-3 items-top">
                <SelectField name="log_level" label={t("common:show_only")} value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
                    <option key="all" value="all">
                        all
                    </option>
                    {LOG_LEVELS.map((level) => (
                        <option key={level} value={level}>
                            {level}
                        </option>
                    ))}
                </SelectField>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{t("filter_by_text")}</legend>
                    <div className="join">
                        {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                        <label className="input w-64 join-item">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <DebouncedInput
                                className=""
                                type="search"
                                onChange={(value) => setSearchTerm(value.toString())}
                                placeholder={t("common:search")}
                                value={searchTerm}
                            />
                        </label>
                        <Button
                            item=""
                            onClick={setSearchTerm}
                            className="btn btn-square join-item"
                            title={t("common:clear")}
                            disabled={searchTerm.length === 0}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                    </div>
                </fieldset>
                <CheckboxField
                    name="highlight_only"
                    label={t("highlight_only")}
                    checked={highlightOnly}
                    onChange={(e) => setHighlightOnly(e.target.checked)}
                />
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">&nbsp;</legend>
                    <Button<number> item={sourceIdx} onClick={clearLogs} className="btn btn-outline btn-primary" disabled={logs.length === 0}>
                        <FontAwesomeIcon icon={faTrashCan} />
                        {t("common:clear")}
                    </Button>
                </fieldset>
                <div className="ml-auto">
                    <SelectField
                        name="log_level_config"
                        label={t("log_level_config")}
                        value={logLevelConfig}
                        onChange={(e) => !e.target.validationMessage && setLogLevelConfig(e.target.value)}
                    >
                        {LOG_LEVELS.map((level) => (
                            <option key={level} value={level}>
                                {level}
                            </option>
                        ))}
                    </SelectField>
                </div>
            </div>
            <div className="mockup-code w-full mt-1 mb-3">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                        <pre key={`${log.timestamp}-${log.message}`} data-prefix={idx} className={colorLog(log.message, log.level)}>
                            <code>
                                [{log.timestamp}] {log.message}
                            </code>
                        </pre>
                    ))
                ) : (
                    <pre data-prefix="~">
                        <code>
                            [{formatDate(new Date())}] {t("empty_logs_message")}
                        </code>
                    </pre>
                )}
            </div>
        </>
    );
});

export default function LogsPage() {
    const navigate = useNavigate();
    const { sourceIdx } = useParams<UrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);
    const logsLimit = useAppStore((state) => state.logsLimit);
    const { t } = useTranslation(["logs", "common"]);
    const setLogsLimit = useAppStore((state) => state.setLogsLimit);
    const clearAllLogs = useAppStore((state) => state.clearAllLogs);

    useEffect(() => {
        if (!sourceIdx || !validSourceIdx) {
            navigate("/logs/0", { replace: true });
        }
    }, [sourceIdx, validSourceIdx, navigate]);

    const isTabActive = useCallback(({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab"), []);

    const tabs = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let idx = 0; idx < API_URLS.length; idx++) {
            elements.push(
                <NavLink key={idx} to={`/logs/${idx}`} className={isTabActive}>
                    <SourceDot idx={idx} alwaysShowName />
                </NavLink>,
            );
        }

        return elements;
    }, [isTabActive]);

    return API_URLS.length > 1 ? (
        <div className="tabs tabs-border">
            {tabs}
            <div className="ml-auto flex flex-row flex-wrap gap-3 items-top">
                <SelectField
                    name="log_limit"
                    label={t("logs_limit")}
                    onChange={(e) => {
                        setLogsLimit(Number.parseInt(e.target.value, 10));
                    }}
                    value={logsLimit}
                >
                    {LOG_LIMITS.map((limit) => (
                        <option key={limit} value={limit}>
                            {limit}
                        </option>
                    ))}
                </SelectField>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">&nbsp;</legend>
                    <ConfirmButton<void>
                        onClick={clearAllLogs}
                        className="btn btn-outline btn-primary"
                        title={t("common:clear_all")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                        {t("common:clear_all")}
                    </ConfirmButton>
                </fieldset>
            </div>
            <div className="tab-content block h-full bg-base-100 pb-3 px-3">
                <LogsTab sourceIdx={numSourceIdx} />
            </div>
        </div>
    ) : (
        <LogsTab sourceIdx={numSourceIdx} />
    );
}
