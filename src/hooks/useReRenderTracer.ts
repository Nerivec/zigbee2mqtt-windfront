import { useEffect, useRef } from "react";

// biome-ignore lint/suspicious/noExplicitAny: debug
export default function useReRenderTracer(props: any, label = "useReRenderTracer") {
    const prev = useRef(props);

    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                // @ts-expect-error dynamic
                ps[k] = [prev.current[k], v];
            }

            return ps;
        }, {});

        if (Object.keys(changedProps).length > 0) {
            console.log(label, "Changed props:", changedProps);
        }

        prev.current = props;
    });
}
