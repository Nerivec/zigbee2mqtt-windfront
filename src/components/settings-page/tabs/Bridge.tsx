import { useAppStore } from "../../../store.js";
import Json from "../../value-decorators/Json.js";

export default function Bridge() {
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);

    return <Json obj={bridgeInfo} />;
}
