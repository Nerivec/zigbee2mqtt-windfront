import { type JSX, memo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "timeago.js";
import type { LastSeenConfig } from "../../types.js";
import { convertLastSeenToDate, formatDate } from "../../utils.js";

type LastSeenProps = {
    lastSeen: unknown;
    config: LastSeenConfig;
};

const LastSeen = memo(({ lastSeen, config }: LastSeenProps): JSX.Element => {
    const { i18n } = useTranslation();
    const lastSeenDate = convertLastSeenToDate(lastSeen, config);

    return lastSeenDate ? <span title={formatDate(lastSeenDate)}>{format(lastSeenDate, i18n.language)}</span> : <span>N/A</span>;
});

export default LastSeen;
