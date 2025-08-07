import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSX } from "react";

type ErrorBoundaryProps = {
    error?: unknown;
    children: JSX.Element | JSX.Element[];
};

export default function ErrorBoundary({ error, children }: ErrorBoundaryProps) {
    return error ? <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-error" /> : children;
}
