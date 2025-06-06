import { type JSX, useEffect } from "react";
import { useNavigate } from "react-router";
import store2 from "store2";
import { HOMEPAGE_KEY } from "../localStoreConsts.js";

export default function HomePage(): JSX.Element {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(store2.get(HOMEPAGE_KEY) === "dashboard" ? "/dashboard" : "/devices", { replace: true });
    }, [navigate]);

    return <></>;
}
