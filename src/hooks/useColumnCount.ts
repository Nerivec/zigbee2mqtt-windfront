import { useEffect, useMemo, useState } from "react";

export function useColumnCount() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const onResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize);
    }, []);

    const columnCount = useMemo(() => {
        if (width < 640) {
            return 1;
        }

        if (width < 1024) {
            return 2;
        }

        if (width < 1280) {
            return 3;
        }

        if (width < 2048) {
            return 4;
        }

        if (width < 2304) {
            return 5;
        }

        return 6;
    }, [width]);

    return columnCount;
}
