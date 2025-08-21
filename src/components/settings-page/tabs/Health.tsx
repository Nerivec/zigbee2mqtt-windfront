import { faCircleInfo, faDotCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { format } from "timeago.js";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { LOAD_AVERAGE_DOCS_URL } from "../../../consts.js";
import { useTable } from "../../../hooks/useTable.js";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { formatDate } from "../../../utils.js";
import DeviceImage from "../../device/DeviceImage.js";
import Table from "../../table/Table.js";

type HealthProps = { sourceIdx: number };

type HealthDeviceTableData = {
    device: Device;
    health: Zigbee2MQTTAPI["bridge/health"]["devices"][string];
};

export default function Health({ sourceIdx }: HealthProps) {
    const { t, i18n } = useTranslation(["health", "settings", "common"]);
    const bridgeHealth = useAppStore(useShallow((state) => state.bridgeHealth[sourceIdx]));
    const devices = useAppStore(useShallow((state) => state.devices[sourceIdx]));

    const tableData = useMemo(() => {
        const healthDevices: HealthDeviceTableData[] = [];

        if (bridgeHealth) {
            for (const ieee in bridgeHealth.devices) {
                const device = devices.find((d) => d.ieee_address === ieee);

                if (!device) {
                    continue;
                }

                healthDevices.push({
                    device: device,
                    health: bridgeHealth.devices[ieee],
                });
            }
        }

        return healthDevices;
    }, [bridgeHealth, devices]);

    const columns = useMemo<ColumnDef<HealthDeviceTableData, unknown>[]>(
        () => [
            {
                id: "friendly_name",
                minSize: 175,
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description, device.ieee_address].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    // min-w-0 serves to properly truncate content
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} disabled={false} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover truncate">
                                {device.friendly_name}
                            </Link>
                            {device.friendly_name !== device.ieee_address ? device.ieee_address : null}
                        </div>
                    </div>
                ),
                filterFn: "includesString",
                sortingFn: (rowA, rowB) => rowA.original.device.friendly_name.localeCompare(rowB.original.device.friendly_name),
            },
            {
                id: "messages",
                header: t("messages"),
                accessorFn: ({ health }) => health.messages,
                enableColumnFilter: false,
            },
            {
                id: "messages_per_sec",
                header: t("messages_per_sec"),
                accessorFn: ({ health }) => health.messages_per_sec,
                enableColumnFilter: false,
                cell: ({
                    row: {
                        original: { health },
                    },
                }) => (
                    <span
                        className={
                            health.messages_per_sec > 1
                                ? health.messages_per_sec > 3
                                    ? "text-error"
                                    : "text-warning"
                                : health.messages_per_sec < 0.2
                                  ? "text-success"
                                  : ""
                        }
                    >
                        {health.messages_per_sec <= 0.001 ? t("very_low") : health.messages_per_sec}
                    </span>
                ),
            },
            {
                id: "leave_count",
                header: t("leave_count"),
                accessorFn: ({ health }) => health.leave_count,
                enableColumnFilter: false,
            },
            {
                id: "network_address_changes",
                header: t("network_address_changes"),
                accessorFn: ({ health }) => health.network_address_changes,
                enableColumnFilter: false,
            },
        ],
        [sourceIdx, t],
    );

    const { table } = useTable({ id: "health-devices", columns, data: tableData, sorting: [{ id: "friendly_name", desc: false }] });

    if (bridgeHealth.response_time === 0) {
        return (
            <div className="alert alert-info alert-soft" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                {t("awaiting_next_check")}
            </div>
        );
    }

    const processStartTime = new Date(Date.now() - bridgeHealth.process.uptime_sec * 1000);

    return (
        <>
            <div className="alert alert-info alert-soft mb-3" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                {t("interview_info")}
            </div>
            <div className="flex flex-col gap-3 items-center mb-2">
                <p className="text-sm">
                    {t("last_check")}: {formatDate(new Date(bridgeHealth.response_time))}
                </p>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat place-items-center">
                        <div className="stat-value text-xl">{t("os")}</div>
                    </div>
                    {/* not available on Windows */}
                    {bridgeHealth.os.load_average.some((v) => v !== 0) && (
                        <div className="stat place-items-center">
                            <div className="stat-title">{t("load_average")}</div>
                            <div className="stat-value text-lg">{bridgeHealth.os.load_average.join(", ")}</div>
                            <div className="stat-desc">
                                <a href={LOAD_AVERAGE_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                                    1min, 5min, 15min
                                </a>
                            </div>
                        </div>
                    )}
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("ram_usage")}</div>
                        <div className="stat-value text-lg">{bridgeHealth.os.memory_percent} %</div>
                        <div className="stat-desc">{bridgeHealth.os.memory_used_mb} MB</div>
                    </div>
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat place-items-center">
                        <div className="stat-value text-xl">{t("process")}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("uptime")}</div>
                        <div className="stat-value text-lg">{format(processStartTime, i18n.language)}</div>
                        <div className="stat-desc">{formatDate(processStartTime)}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("ram_usage")}</div>
                        <div className="stat-value text-lg">{bridgeHealth.process.memory_percent} %</div>
                        <div className="stat-desc">{bridgeHealth.process.memory_used_mb} MB</div>
                    </div>
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat place-items-center">
                        <div className="stat-value text-xl">{t("settings:mqtt")}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-value text-lg">
                            <FontAwesomeIcon icon={faDotCircle} className={bridgeHealth.mqtt.connected ? "text-success" : "text-error"} />
                        </div>
                        <div className="stat-desc">
                            {t("queued")}: {bridgeHealth.mqtt.queued}
                        </div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("published")}</div>
                        <div className="stat-value text-lg">{bridgeHealth.mqtt.published}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("received")}</div>
                        <div className="stat-value text-lg">{bridgeHealth.mqtt.received}</div>
                    </div>
                </div>
            </div>
            <Table id="health-devices" table={table} />
        </>
    );
}
