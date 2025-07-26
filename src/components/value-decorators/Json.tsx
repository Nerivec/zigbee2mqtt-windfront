import { memo } from "react";

type JsonProps = {
    obj: object;
    lines?: number;
};

const Json = memo(({ obj, lines }: JsonProps) => {
    const jsonState = JSON.stringify(obj, null, 4);
    const computedLines = lines ?? Math.max(10, (jsonState.match(/\n/g) || "").length + 1);

    return <textarea className="textarea w-full" readOnly rows={computedLines} defaultValue={jsonState} />;
});

export default Json;
