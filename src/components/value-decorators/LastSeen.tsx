import { memo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { LastSeenConfig } from "../../types.js";
import { getLastSeenEpoch } from "../../utils.js";
import TimeAgo from "./TimeAgo.js";

type LastSeenProps = {
    lastSeen: unknown;
    config: LastSeenConfig;
    fallback?: ReactNode;
};

const LastSeen = memo(({ lastSeen, config, fallback = null }: LastSeenProps) => {
    const { i18n } = useTranslation();
    const lastSeenEpoch = getLastSeenEpoch(lastSeen, config);
    const lastSeenDate = lastSeenEpoch ? new Date(lastSeenEpoch) : undefined;

    return lastSeenDate ? (
        <span>
            <TimeAgo datetime={lastSeenDate} locale={i18n.language} />
        </span>
    ) : (
        fallback
    );
});

export default LastSeen;
