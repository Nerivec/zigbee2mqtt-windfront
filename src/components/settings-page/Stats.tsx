import snakeCase from "lodash/snakeCase.js";
import { type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { AppState } from "../../store.js";

type StatRowProps = {
    name: string;
    data: Record<string, number>;
};
type StatsProps = Pick<AppState, "devices">;

function StatRow({ name, data }: StatRowProps) {
    const children: JSX.Element[] = [];
    const { t } = useTranslation("stats");

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
                <summary>{t(name)}</summary>
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

            const typeStr = t(`zigbee:${device.type}`);
            const modelId = device.model_id || t("zigbee:unknown");
            const manufacturer = device.manufacturer || t("zigbee:unknown");
            const powerSource = t(`zigbee:${snakeCase(device.power_source || "unknown")}`);

            byType[typeStr] = (byType[typeStr] || 0) + 1;
            byPowerSource[powerSource] = (byPowerSource[powerSource] || 0) + 1;
            byModel[modelId] = (byModel[modelId] || 0) + 1;
            byVendor[manufacturer] = (byVendor[manufacturer] || 0) + 1;
        }

        return (
            <>
                <StatRow name={"byType"} data={byType} />
                <StatRow name={"byPowerSource"} data={byPowerSource} />
                <StatRow name={"byModel"} data={byModel} />
                <StatRow name={"byVendor"} data={byVendor} />
            </>
        );
    }, [devices, t]);

    return (
        <ul>
            <li>
                <Link to="#">
                    {t("total")} {devices.length - 1 /* coordinator */}
                </Link>
            </li>
            {statRows}
        </ul>
    );
});

export default Stats;
