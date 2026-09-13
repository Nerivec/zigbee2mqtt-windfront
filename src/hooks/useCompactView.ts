import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import store2 from "store2";

/** Compact/expanded tile view preference persisted to local storage. Compact by default. */
export function useCompactView(storageKey: string): [boolean, Dispatch<SetStateAction<boolean>>] {
    const [compact, setCompact] = useState<boolean>(store2.get(storageKey, true));

    useEffect(() => {
        store2.set(storageKey, compact);
    }, [storageKey, compact]);

    return [compact, setCompact];
}
