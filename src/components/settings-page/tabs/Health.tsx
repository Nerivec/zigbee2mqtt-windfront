import { faCircleInfo, faDotCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { format } from "timeago.js";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useAppSelector } from "../../../hooks/useApp";
import type { Device } from "../../../types";
import { formatDate } from "../../../utils.js";
import DeviceImage from "../../device/DeviceImage";
import Table from "../../table/Table";

type HealthDeviceTableData = {
    device: Device;
    health: Zigbee2MQTTAPI["bridge/health"]["devices"][string];
};

export default function Health() {
    const { t, i18n } = useTranslation(["health", "settings", "common"]);
    const bridgeHealth = useAppSelector((state) => state.bridgeHealth);
    const devices = useAppSelector((state) => state.devices);

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

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const columns = useMemo<ColumnDef<HealthDeviceTableData, any>[]>(
        () => [
            {
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description, device.ieee_address].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} disabled={false} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Link to={`/device/${device.ieee_address}/info`} className="link link-hover">
                                {device.friendly_name}
                                {device.friendly_name !== device.ieee_address ? ` (${device.ieee_address})` : ""}
                            </Link>
                        </div>
                    </div>
                ),
            },
            {
                header: t("messages"),
                accessorFn: ({ health }) => health.messages,
                enableColumnFilter: false,
            },
            {
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
                header: t("leave_count"),
                accessorFn: ({ health }) => health.leave_count,
                enableColumnFilter: false,
            },
            {
                header: t("network_address_changes"),
                accessorFn: ({ health }) => health.network_address_changes,
                enableColumnFilter: false,
            },
        ],
        [t],
    );

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
                                <a
                                    href="https://www.digitalocean.com/community/tutorials/load-average-in-linux"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="link link-hover"
                                >
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
            <Table id="health-devices" columns={columns} data={tableData} />
        </>
    );
}
