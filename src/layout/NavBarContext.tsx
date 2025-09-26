import { createContext, type JSX, memo, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type Ctx = {
    content: JSX.Element | null;
    setContent: (c: JSX.Element | null) => void;
};

const NavBarContext = createContext<Ctx | null>(null);

export const NavBarProvider = memo(({ children }: PropsWithChildren) => {
    const [content, setContent] = useState<JSX.Element | null>(null);

    const value = useMemo(() => {
        const v: Ctx = { content, setContent };

        return v;
    }, [content]);

    return <NavBarContext.Provider value={value}>{children}</NavBarContext.Provider>;
});

export function useNavBarContent(): JSX.Element | null {
    const ctx = useContext(NavBarContext);

    return ctx?.content ?? null;
}

export function useSetNavBarContent(): (c: JSX.Element | null) => void {
    const ctx = useContext(NavBarContext);

    if (!ctx) {
        throw new Error("useSetNavBarContent must be used within NavBarProvider");
    }

    return ctx.setContent;
}

/**
 * Helper component for pages: place it once in the page to define the navbar content.
 * It will automatically clean up on unmount.
 */
export const NavBarContent = memo(({ children }: PropsWithChildren) => {
    const setContent = useSetNavBarContent();

    useEffect(() => {
        setContent(children as JSX.Element);

        return () => {
            setContent(null);
        };
    }, [children, setContent]);

    return null;
});
