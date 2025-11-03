import { memo } from "react";
import { LOG_LEVELS_CMAP } from "../../consts.js";
import type { LogMessage } from "../../types.js";

export type LastLogResultProps = {
    message: LogMessage;
};

const LastLogResult = memo(({ message }: LastLogResultProps) => (
    <div className="mockup-code w-full before:content-none">
        <pre data-prefix="~" className={LOG_LEVELS_CMAP[message.level]}>
            <code>
                [{message.timestamp}] {message.message}
            </code>
        </pre>
    </div>
));

export default LastLogResult;
