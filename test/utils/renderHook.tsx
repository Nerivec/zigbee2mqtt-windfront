import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

type RenderHookResult<T, P> = {
    result: { current: T };
    rerender: (newProps?: P) => void;
    unmount: () => void;
};

export function renderHook<T, P = Record<string, unknown>>(
    hook: (props: P) => T,
    options?: {
        initialProps?: P;
        wrapper?: React.ComponentType<{ children: ReactNode }>;
    },
): RenderHookResult<T, P> {
    const { initialProps, wrapper: Wrapper } = options ?? {};
    const resultRef = { current: undefined as T };
    let root: Root | null = null;
    let container: HTMLDivElement | null = null;
    let currentProps = initialProps as P;

    function TestComponent({ hookProps }: { hookProps: P }) {
        resultRef.current = hook(hookProps);
        return null;
    }

    function render(props: P) {
        const element = createElement(TestComponent, { hookProps: props });
        const wrapped = Wrapper ? createElement(Wrapper, null, element) : element;

        void act(() => {
            if (!root) {
                container = document.createElement("div");
                document.body.appendChild(container);
                root = createRoot(container);
            }
            root.render(wrapped);
        });
    }

    render(currentProps);

    return {
        result: resultRef,
        rerender: (newProps?: P) => {
            if (newProps !== undefined) {
                currentProps = newProps;
            }
            render(currentProps);
        },
        unmount: () => {
            void act(() => {
                root?.unmount();
                root = null;
                container?.remove();
                container = null;
            });
        },
    };
}
