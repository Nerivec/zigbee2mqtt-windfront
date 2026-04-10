import snakeCase from "lodash/snakeCase.js";
import { type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { AppState } from "../../store.js";
import type { SnakeCasePowerSource } from "../../types.js";

type StatRowProps = {
    name: string;
    data: Record<string, number>;
};
type StatsProps = {
    devices: AppState["devices"][number];
};

function StatRow({ name, data }: StatRowProps) {
    const children: JSX.Element[] = [];

    for (const key in data) {
        const count = data[key];

        children.push(
            <li key={key}>
                <Link to="#">
                    {key}: {count}
                </Link>
            </li>,
        );
    }

    return (
        <li>
            <details>
                <summary>{name}</summary>
                <ul>{children}</ul>
            </details>
        </li>
    );
}

const Stats = memo((props: StatsProps) => {
    const { devices } = props;
    const { t } = useTranslation(["stats", "zigbee"]);

    const statRows = useMemo(() => {
        const byType: Record<string, number> = {};
        const byPowerSource: Record<string, number> = {};
        const byModel: Record<string, number> = {};
        const byVendor: Record<string, number> = {};

        for (const device of devices) {
            if (device.type === "Coordinator") {
                continue;
            }

            const typeStr = t(($) => $[device.type], { ns: "zigbee" });
            const modelId = device.model_id || t(($) => $.unknown, { ns: "zigbee" });
            const manufacturer = device.manufacturer || t(($) => $.unknown, { ns: "zigbee" });
            const powerSource = t(($) => $[snakeCase(device.power_source || "unknown") as SnakeCasePowerSource], { ns: "zigbee" });

            byType[typeStr] = (byType[typeStr] || 0) + 1;
            byPowerSource[powerSource] = (byPowerSource[powerSource] || 0) + 1;
            byModel[modelId] = (byModel[modelId] || 0) + 1;
            byVendor[manufacturer] = (byVendor[manufacturer] || 0) + 1;
        }

        return (
            <>
                <StatRow name={t(($) => $.byType)} data={byType} />
                <StatRow name={t(($) => $.byPowerSource)} data={byPowerSource} />
                <StatRow name={t(($) => $.byModel)} data={byModel} />
                <StatRow name={t(($) => $.byVendor)} data={byVendor} />
            </>
        );
    }, [devices, t]);

    return (
        <ul>
            <li>
                <Link to="#">
                    {t(($) => $.total)} {devices.length - 1 /* coordinator */}
                </Link>
            </li>
            {statRows}
        </ul>
    );
});

export default Stats;
