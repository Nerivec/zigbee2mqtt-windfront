import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, type ReactNode, Suspense, use } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import { normalizeDefinitionModel } from "../../../utils.js";

type DocsProps = {
    sourceIdx: number;
    definitionModel: string;
};

const Z2M_DOCS_LINK = "https://www.zigbee2mqtt.io/";
const MD_LINK_REGEX = /!?\[(.*?)]\((\.\.\/|\.\/)?(.*?)\)/g;
const MD_STYLE_REGEX = /`([^`]+)`|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
const MD_UNORDERED_LIST_REGEX = /^\s*[-*]\s+(.*)$/;
const MD_ORDERED_LIST_REGEX = /^\s*\d+\.\s+(.*)$/;
const MD_TABLE_SEPARATOR_LINE_REGEX = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/;

const appendNodes = (target: ReactNode[], nodes: ReactNode[]) => {
    for (const node of nodes) {
        target.push(node);
    }
};

const rewriteRelativeDocsHref = (relativePathPrefix: string, urlPath: string): string => {
    // keep `?query` or `#hash` if any
    const queryIdx = urlPath.indexOf("?");
    const hashIdx = urlPath.indexOf("#");
    const suffixStart = queryIdx === -1 ? hashIdx : hashIdx === -1 ? queryIdx : Math.min(queryIdx, hashIdx);
    const pathPart = suffixStart === -1 ? urlPath : urlPath.slice(0, suffixStart);
    const suffix = suffixStart === -1 ? "" : urlPath.slice(suffixStart);
    const sanitizedPathPart = pathPart.endsWith(".md") ? `${pathPart.slice(0, -3)}.html` : pathPart;
    const relativeTarget = relativePathPrefix === "./" ? `./devices/${sanitizedPathPart}${suffix}` : `${sanitizedPathPart}${suffix}`;

    return new URL(relativeTarget, Z2M_DOCS_LINK).toString();
};

const parseMarkdownLinks = (segment: string, keyPrefix: string): ReactNode[] => {
    if (segment.indexOf("[") === -1) {
        return [segment];
    }

    const nodes: ReactNode[] = [];
    MD_LINK_REGEX.lastIndex = 0;

    let parseIndex = 0;
    let match = MD_LINK_REGEX.exec(segment);

    while (match) {
        const [fullMatch, linkText, relativePathPrefix, urlPath] = match;
        const matchStartIndex = match.index;
        const matchEndIndex = matchStartIndex + fullMatch.length;

        if (matchStartIndex > parseIndex) {
            nodes.push(segment.slice(parseIndex, matchStartIndex));
        }

        let href = urlPath;

        if (relativePathPrefix) {
            href = rewriteRelativeDocsHref(relativePathPrefix, urlPath);
        }

        nodes.push(
            <a key={`${keyPrefix}-link-${matchStartIndex}`} href={href} className="link link-primary" target="_blank" rel="noopener noreferrer">
                {linkText} <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </a>,
        );

        parseIndex = matchEndIndex;
        match = MD_LINK_REGEX.exec(segment);
    }

    if (parseIndex < segment.length) {
        nodes.push(segment.slice(parseIndex));
    }

    return nodes.length > 0 ? nodes : [segment];
};

function parseMarkdownInline(md: string): ReactNode[] {
    if (md.indexOf("*") === -1 && md.indexOf("`") === -1) {
        return parseMarkdownLinks(md, "md-plain");
    }

    const parsedLine: ReactNode[] = [];
    MD_STYLE_REGEX.lastIndex = 0;

    let parseIndex = 0;
    let match = MD_STYLE_REGEX.exec(md);

    while (match) {
        const [fullMatch, inlineCode, boldItalicText, boldText, italicText] = match;
        const matchStartIndex = match.index;
        const matchEndIndex = matchStartIndex + fullMatch.length;

        if (matchStartIndex > parseIndex) {
            appendNodes(parsedLine, parseMarkdownLinks(md.slice(parseIndex, matchStartIndex), `md-txt-${parseIndex}`));
        }

        if (inlineCode !== undefined) {
            parsedLine.push(
                <span key={`md-code-${matchStartIndex}`} className="badge badge-ghost">
                    {inlineCode}
                </span>,
            );
        } else if (boldItalicText !== undefined) {
            parsedLine.push(
                <span key={`md-bold-italic-${matchStartIndex}`} className="font-italic font-bold">
                    {parseMarkdownLinks(boldItalicText, `md-bold-italic-${matchStartIndex}`)}
                </span>,
            );
        } else if (boldText !== undefined) {
            parsedLine.push(
                <span key={`md-bold-${matchStartIndex}`} className="font-bold">
                    {parseMarkdownLinks(boldText, `md-bold-${matchStartIndex}`)}
                </span>,
            );
        } else if (italicText !== undefined) {
            parsedLine.push(
                <span key={`md-italic-${matchStartIndex}`} className="font-italic">
                    {parseMarkdownLinks(italicText, `md-italic-${matchStartIndex}`)}
                </span>,
            );
        }

        parseIndex = matchEndIndex;
        match = MD_STYLE_REGEX.exec(md);
    }

    if (parseIndex < md.length) {
        appendNodes(parsedLine, parseMarkdownLinks(md.slice(parseIndex), `md-txt-${parseIndex}`));
    }

    return parsedLine.length > 0 ? parsedLine : [md];
}

const parseTableCells = (line: string): string[] => {
    return line.slice(line.startsWith("|") ? 1 : 0, line.endsWith("|") ? -1 : undefined).split("|");
};

function parseMarkdown(md: string): ReactNode[] {
    const textArr = md.split("\n");
    const outputNodes: ReactNode[] = [];
    let blockIdx = 0;
    let inCodeBlock = false;
    let codeBlock: string[] = [];
    let inList = false;
    let listType: "ul" | "ol" | undefined;
    let list: ReactNode[] = [];
    let listItemIdx = 0;

    const flushList = () => {
        if (!inList || list.length === 0 || listType === undefined) {
            return;
        }

        outputNodes.push(
            listType === "ol" ? (
                <ol key={`md-block-${blockIdx++}`} className="list-decimal list-inside py-2">
                    {list}
                </ol>
            ) : (
                <ul key={`md-block-${blockIdx++}`} className="list-disc list-inside py-2">
                    {list}
                </ul>
            ),
        );

        list = [];
        inList = false;
        listType = undefined;
        listItemIdx = 0;
    };

    for (let lineIdx = 0; lineIdx < textArr.length; lineIdx++) {
        const line = textArr[lineIdx];

        if (line === "") {
            flushList();
            continue;
        }

        if (line.startsWith("<!--")) {
            flushList();
            continue;
        }

        const tableHeaderCandidate = line;
        const tableSeparatorCandidate = textArr[lineIdx + 1];
        const isTableHeaderCandidate = tableHeaderCandidate.indexOf("|") !== -1;

        if (isTableHeaderCandidate && tableSeparatorCandidate !== undefined && MD_TABLE_SEPARATOR_LINE_REGEX.test(tableSeparatorCandidate)) {
            flushList();

            let tableEndLineIdx = lineIdx + 1;
            // always skip the first table (metadata table)
            const headerCells = parseTableCells(tableHeaderCandidate);
            const headerNodes: ReactNode[] = [];
            const bodyNodes: ReactNode[] = [];
            let headerKey = 0;
            let rowKey = 0;

            for (let rowIdx = lineIdx + 2; rowIdx < textArr.length; rowIdx++) {
                const rowLine = textArr[rowIdx].trim();

                if (rowLine === "" || rowLine.indexOf("|") === -1) {
                    break;
                }

                const rowCells = parseTableCells(rowLine);
                const rowNodes: ReactNode[] = [];

                for (let cellIdx = 0; cellIdx < headerCells.length; cellIdx++) {
                    let cellKey = 0;
                    const rowCell = rowCells[cellIdx] ?? "";

                    rowNodes.push(<td key={`md-table-cell-${rowKey}-${cellKey++}-${rowCell}`}>{parseMarkdownInline(rowCell.trim())}</td>);
                }

                bodyNodes.push(<tr key={`md-table-row-${rowKey++}`}>{rowNodes}</tr>);

                tableEndLineIdx = rowIdx;
            }

            for (const headerCell of headerCells) {
                headerNodes.push(<th key={`md-table-head-${headerKey++}-${headerCell}`}>{parseMarkdownInline(headerCell.trim())}</th>);
            }

            outputNodes.push(
                <div key={`md-block-${blockIdx++}`} className="overflow-x-auto my-2">
                    <table className="table table-border">
                        <thead>
                            <tr>{headerNodes}</tr>
                        </thead>
                        <tbody>{bodyNodes}</tbody>
                    </table>
                </div>,
            );

            lineIdx = tableEndLineIdx;

            continue;
        }

        const unorderedList = line.match(MD_UNORDERED_LIST_REGEX);

        if (unorderedList) {
            if (inList && listType !== "ul") {
                flushList();
            }

            inList = true;
            listType = "ul";
            list.push(<li key={`md-list-item-${listItemIdx++}`}>{parseMarkdownInline(unorderedList[1])}</li>);
            continue;
        }

        const orderedList = line.match(MD_ORDERED_LIST_REGEX);

        if (orderedList) {
            if (inList && listType !== "ol") {
                flushList();
            }

            inList = true;
            listType = "ol";
            list.push(<li key={`md-list-item-${listItemIdx++}`}>{parseMarkdownInline(orderedList[1])}</li>);
            continue;
        }

        flushList();

        if (line.startsWith("######")) {
            outputNodes.push(
                <h6 key={`md-block-${blockIdx++}`} className="text-xs font-bold mt-4 mb-2">
                    {line.slice(7)}
                </h6>,
            );
            continue;
        }

        if (line.startsWith("#####")) {
            outputNodes.push(
                <h5 key={`md-block-${blockIdx++}`} className="text-sm font-bold mt-4 mb-2">
                    {line.slice(6)}
                </h5>,
            );
            continue;
        }

        if (line.startsWith("####")) {
            outputNodes.push(
                <h4 key={`md-block-${blockIdx++}`} className="text-md font-bold mt-4 mb-2">
                    {line.slice(5)}
                </h4>,
            );
            continue;
        }

        if (line.startsWith("###")) {
            outputNodes.push(
                <h3 key={`md-block-${blockIdx++}`} className="text-lg font-bold mt-4 mb-2">
                    {line.slice(4)}
                </h3>,
            );
            continue;
        }

        if (line.startsWith("##")) {
            outputNodes.push(
                <h2 key={`md-block-${blockIdx++}`} className="text-xl font-bold border-b border-base-content/25 py-1.5 mt-4 mb-2">
                    {line.slice(3)}
                </h2>,
            );
            continue;
        }

        if (line.startsWith("#")) {
            outputNodes.push(
                <h1 key={`md-block-${blockIdx++}`} className="text-2xl font-bold mt-4 mb-2">
                    {line.slice(2)}
                </h1>,
            );
            continue;
        }

        if (line.startsWith("```")) {
            if (inCodeBlock) {
                outputNodes.push(
                    <pre key={`md-block-${blockIdx++}`} className="w-full bg-base-200 my-1 py-2 px-4 rounded-sm overflow-x-auto">
                        <code>{codeBlock.join("\n")}</code>
                    </pre>,
                );

                codeBlock = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }

            continue;
        }

        if (inCodeBlock) {
            codeBlock.push(line);
            continue;
        }

        outputNodes.push(<p key={`md-block-${blockIdx++}`}>{parseMarkdownInline(line)}</p>);
    }

    flushList();

    return outputNodes;
}

async function fetchMd(url: string): Promise<ReactNode[]> {
    const res = await fetch(url);

    if (!res.ok) {
        return ["Failed to fetch"];
    }

    let text = (await res.text()).trim();

    if (text.startsWith("---")) {
        text = text.slice(text.indexOf("---", 3) + 3);
    }

    return parseMarkdown(text);
}

const DocsContent = memo(({ docsPromise }: { docsPromise: Promise<ReactNode[]> }) => {
    const docs = use(docsPromise);

    return docs;
});

const Docs = memo(({ sourceIdx, definitionModel }: DocsProps) => {
    const isDevVersion = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].version.match(/^\d+\.\d+\.\d+$/) === null));
    const branch = isDevVersion ? "dev" : "master";
    const fileName = encodeURIComponent(normalizeDefinitionModel(definitionModel));
    const url = `https://raw.githubusercontent.com/Koenkk/zigbee2mqtt.io/${branch}/docs/devices/${fileName}.md`;
    const editUrl = `https://github.com/Koenkk/zigbee2mqtt.io/edit/${branch}/docs/devices/${fileName}.md`;
    const docsPromise = fetchMd(url);

    return (
        <div className="max-w-5xl">
            <Suspense
                fallback={
                    <div className="flex flex-row justify-center items-center gap-2">
                        <span className="loading loading-infinity loading-xl" />
                    </div>
                }
            >
                <DocsContent docsPromise={docsPromise} />
                <div className="divider" />
                <div className="flex flex-row flex-wrap items-center gap-1 mt-3">
                    Source:
                    <span>{url}</span>
                </div>
                <div className="flex flex-row flex-wrap items-center gap-1">
                    Edit:
                    <a href={editUrl} className="link link-primary" target="_blank" rel="noopener noreferrer">
                        {editUrl} <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                </div>
            </Suspense>
        </div>
    );
});

export default Docs;
