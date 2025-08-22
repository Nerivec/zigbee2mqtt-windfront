import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import Json from "../../value-decorators/Json.js";

type StatesProps = {
    sourceIdx: number;
    friendlyName: string;
};

export default function State({ sourceIdx, friendlyName }: StatesProps) {
    const deviceState = useAppStore(useShallow((state) => state.deviceStates[sourceIdx][friendlyName]));

    return <Json obj={deviceState ?? {}} />;
}
