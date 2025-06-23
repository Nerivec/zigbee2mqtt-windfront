import { faEraser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../components/Button.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import SelectField from "../components/form-fields/SelectField.js";
import { LOG_LEVELS, LOG_LEVELS_CMAP, LOG_LIMITS } from "../consts.js";
import { useAppDispatch, useAppSelector } from "../hooks/useApp.js";
import { clearLogs as clearStateLogs, setLogsLimit } from "../store.js";
import type { LogMessage } from "../types.js";
import { formatDate } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

const HIGHLIGHT_LEVEL_CMAP = {
    error: "bg-error text-error-content",
    warning: "bg-warning text-warning-content",
    info: "bg-info text-info-content",
    debug: "bg-accent text-accent-content opacity-50",
};

export default function LogsPage() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const [filterValue, setFilterValue] = useState<string>("");
    const [logLevel, setLogLevel] = useState<string>("all");
    const [highlightOnly, setHighlightOnly] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const logsLimit = useAppSelector((state) => state.logsLimit);
    const logLevelConfig = useAppSelector((state) => state.bridgeInfo.config.advanced.log_level);
    const { t } = useTranslation("logs");
    const logs = useAppSelector((state) => state.logs);
    const filteredLogs = useMemo(
        () =>
            logs.filter(
                (log) =>
                    (logLevel === "all" || log.level === logLevel) &&
                    (highlightOnly || !filterValue || log.message.toLowerCase().includes(filterValue.toLowerCase())),
            ),
        [filterValue, highlightOnly, logLevel, logs],
    );

    const colorLog = useCallback(
        (message: LogMessage["message"], level: LogMessage["level"]) =>
            filterValue && message.toLowerCase().includes(filterValue.toLowerCase()) ? HIGHLIGHT_LEVEL_CMAP[level] : LOG_LEVELS_CMAP[level],
        [filterValue],
    );

    const setLogLevelConfig = useCallback(
        async (level: string) => {
            await sendMessage("bridge/request/options", { options: { advanced: { log_level: level } } });
        },
        [sendMessage],
    );

    return (
        <>
            <div className="flex flex-row flex-wrap gap-3 items-top">
                <SelectField name="log_level" label={t("show_only")} value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
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
                                onChange={(value) => setFilterValue(value.toString())}
                                placeholder={t("common:search")}
                                value={filterValue}
                            />
                        </label>
                        <Button item="" onClick={setFilterValue} className="btn btn-square join-item" title={t("common:clear")}>
                            <FontAwesomeIcon icon={faEraser} />
                        </Button>
                    </div>
                </fieldset>
                <CheckboxField
                    name="highlight_only"
                    label={t("highlight_only")}
                    checked={highlightOnly}
                    onChange={(e) => setHighlightOnly(e.target.checked)}
                />
                <SelectField
                    name="log_limit"
                    label={t("logs_limit")}
                    onChange={(e) => {
                        dispatch(setLogsLimit(Number.parseInt(e.target.value)));
                    }}
                    value={logsLimit}
                >
                    {LOG_LIMITS.map((limit) => (
                        <option key={limit} value={limit}>
                            {limit}
                        </option>
                    ))}
                </SelectField>
                <Button<void>
                    onClick={() => {
                        dispatch(clearStateLogs());
                    }}
                    className="btn btn-primary self-center"
                    disabled={logs.length === 0}
                >
                    {t("common:clear")}
                </Button>
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
}
