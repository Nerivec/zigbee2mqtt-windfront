import { useAppSelector } from "../../../hooks/useApp.js";
import Json from "../../value-decorators/Json.js";

export default function Bridge() {
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);

    return <Json obj={bridgeInfo} />;
}
