import { Component, memo, type PropsWithChildren } from "react";
import { NEW_GITHUB_ISSUE_URL } from "./consts.js";
import { useAppStore } from "./store.js";
import { downloadAsZip } from "./utils.js";

type ErrorBoundaryState =
    | {
          didCatch: true;
          // biome-ignore lint/suspicious/noExplicitAny: generic
          error: any;
      }
    | {
          didCatch: false;
          error: null;
      };

const INITIAL_STATE: ErrorBoundaryState = {
    didCatch: false,
    error: null,
};

type ErrorBoundaryProps = PropsWithChildren;

const DownloadStateButton = memo(() => (
    <button
        type="button"
        className="btn btn-primary btn-square animate-pulse text-3xl"
        onClick={async () => {
            await downloadAsZip(useAppStore.getState() as unknown as Record<string, unknown>, "state.json");
        }}
    >
        ➘
    </button>
));

/** Based on https://github.com/bvaughn/react-error-boundary */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
        this.state = INITIAL_STATE;
    }

    static getDerivedStateFromError(error: Error) {
        return { didCatch: true, error };
    }

    resetErrorBoundary() {
        if (this.state.error !== null) {
            this.setState(INITIAL_STATE);
        }
    }

    render() {
        const { didCatch, error } = this.state;

        if (didCatch) {
            const githubUrlParams = {
                template: "bug_report.yaml",
                stacktrace: [
                    `**Current url**: ${window.location.toString()}`,
                    `**Previous url**: ${document.referrer}`,
                    "\n",
                    `**Error type**: ${error?.name}`,
                    `**Error message**: ${error?.message}`,
                    "\n\n",
                    error?.stack,
                ].join("\n"),
            };

            return (
                <div>
                    <div className="hero bg-base-200 min-h-screen">
                        <div className="hero-content text-center">
                            <div className="max-w-lg">
                                <h1 className="text-3xl font-bold">You've found a bug!</h1>
                                <ul className="list bg-base-100 rounded-box shadow-md my-3">
                                    <li className="list-row">
                                        <div />
                                        <div>
                                            <div>Save this file</div>
                                            <div className="text-xs font-semibold opacity-60">For use in next step</div>
                                        </div>
                                        <DownloadStateButton />
                                    </li>
                                    <li className="list-row">
                                        <div />
                                        <div>
                                            <div>Create a Github Issue</div>
                                            <div className="text-xs uppercase font-semibold opacity-60">Attach the previously saved file</div>
                                        </div>
                                        <p className="list-col-wrap">
                                            In the github issue write a detailed description. How did it happen? What were you trying to do? Etc.
                                        </p>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={`${NEW_GITHUB_ISSUE_URL}?${new URLSearchParams(githubUrlParams).toString()}`}
                                            className="btn btn-primary btn-square animate-pulse text-3xl"
                                        >
                                            ➥
                                        </a>
                                    </li>
                                </ul>
                                <fieldset className="fieldset my-3">
                                    <legend className="fieldset-legend">Error details</legend>
                                    <textarea
                                        className="textarea w-full"
                                        readOnly
                                        rows={10}
                                        defaultValue={`${error.name}\n${error.message}\n\n${error.stack}`}
                                    />
                                </fieldset>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        this.resetErrorBoundary();
                                    }}
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
