import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import Json from "../../value-decorators/Json.js";

type BridgeProps = { sourceIdx: number };

export default function Bridge({ sourceIdx }: BridgeProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    return <Json obj={bridgeInfo} />;
}
