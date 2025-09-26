import { faClose, faMagnifyingGlass, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
import { NavBarContent } from "../layout/NavBarContext.js";
import { API_URLS, MULTI_INSTANCE, useAppStore } from "../store.js";
import type { LogMessage } from "../types.js";
import { getValidSourceIdx } from "../utils.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

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
    const logLevelConfig = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].config.advanced.log_level));
    const logs = useAppStore(useShallow((state) => state.logs[sourceIdx]));
    const logsLimit = useAppStore((state) => state.logsLimit);
    const setLogsLimit = useAppStore((state) => state.setLogsLimit);
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
        [sourceIdx],
    );

    return (
        <>
            <div className="flex flex-row flex-wrap gap-3 items-top">
                <SelectField
                    name="log_level"
                    label={t("common:show_only")}
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                    className="select select-sm"
                >
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
                        <label className="input input-sm w-64 join-item">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <DebouncedInput onChange={setSearchTerm} placeholder={t("common:search")} value={searchTerm} />
                        </label>
                        <Button
                            item=""
                            onClick={setSearchTerm}
                            className="btn btn-sm btn-square btn-warning btn-outline join-item"
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
                    className="checkbox checkbox-sm"
                />
                <fieldset className="fieldset self-end">
                    <Button<number>
                        item={sourceIdx}
                        onClick={clearLogs}
                        className="btn btn-sm btn-outline btn-warning btn-primary"
                        disabled={logs.length === 0}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                        {t("common:clear")}
                    </Button>
                </fieldset>
                <div className="ml-auto flex flex-row gap-3">
                    <SelectField
                        name="log_limit"
                        label={t("logs_limit")}
                        onChange={(e) => {
                            setLogsLimit(Number.parseInt(e.target.value, 10));
                        }}
                        value={logsLimit}
                        className="select select-sm"
                    >
                        {LOG_LIMITS.map((limit) => (
                            <option key={limit} value={limit}>
                                {limit}
                            </option>
                        ))}
                    </SelectField>
                    <SelectField
                        name="log_level_config"
                        label={t("log_level_config")}
                        value={logLevelConfig}
                        onChange={(e) => !e.target.validationMessage && setLogLevelConfig(e.target.value)}
                        className="select select-sm"
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
                        <pre key={`${idx}-${log.timestamp}`} data-prefix={idx} className={colorLog(log.message, log.level)}>
                            <code>
                                [{log.timestamp}] {log.message}
                            </code>
                        </pre>
                    ))
                ) : (
                    <pre data-prefix="~">
                        <code>
                            [{new Date().toLocaleString()}] {t("empty_logs_message")}
                        </code>
                    </pre>
                )}
            </div>
        </>
    );
});

const isNavActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "menu-active" : undefined);

export default function LogsPage() {
    const navigate = useNavigate();
    const { sourceIdx } = useParams<UrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);
    const { t } = useTranslation(["logs", "common"]);
    const clearAllLogs = useAppStore((state) => state.clearAllLogs);

    useEffect(() => {
        if (!sourceIdx || !validSourceIdx) {
            navigate("/logs/0", { replace: true });
        }
    }, [sourceIdx, validSourceIdx, navigate]);

    return (
        <>
            <NavBarContent>
                {MULTI_INSTANCE && (
                    <div className="flex-1 flex flex-col">
                        <div className="menu menu-horizontal flex-1 pb-0">
                            {API_URLS.map((v, idx) => (
                                <li key={v}>
                                    <NavLink to={`/logs/${idx}`} className={isNavActive}>
                                        <SourceDot idx={idx} alwaysShowName />
                                    </NavLink>
                                </li>
                            ))}
                        </div>
                        <div className="menu menu-horizontal justify-end">
                            <ConfirmButton<void>
                                onClick={clearAllLogs}
                                className="btn btn-sm btn-outline btn-warning btn-primary"
                                title={t("common:clear_all")}
                                modalDescription={t("common:dialog_confirmation_prompt")}
                                modalCancelLabel={t("common:cancel")}
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                                {t("common:clear_all")}
                            </ConfirmButton>
                        </div>
                    </div>
                )}
            </NavBarContent>

            <LogsTab key={sourceIdx} sourceIdx={numSourceIdx} />
        </>
    );
}
