import { useEffect, useState } from "react";

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState([window.innerWidth, window.innerHeight]);

    useEffect(() => {
        const onResize = () => {
            setWindowDimensions([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize);
    }, []);

    return windowDimensions;
}
