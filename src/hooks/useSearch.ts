import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import store2 from "store2";

export function useSearch(storeKey?: string): [string, string, Dispatch<SetStateAction<string>>] {
    const [searchTerm, setSearchTerm] = useState<string>(storeKey ? store2.get(storeKey, "") : "");
    const [normalizedSearchTerm, setNormalizedSearchTerm] = useState<string>("");

    useEffect(() => {
        if (storeKey) {
            store2.set(storeKey, searchTerm);
        }

        setNormalizedSearchTerm(searchTerm.trim().toLowerCase());
    }, [searchTerm, storeKey]);

    return [searchTerm, normalizedSearchTerm, setSearchTerm];
}
