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
const MD_LINK_REGEX = /!?\[(.*?)]\((\.?\.?\/)?(.*?)\)/g;
const MD_STYLE_REGEX = /`([^`]+)`|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
const MD_LIST_ITEM_REGEX = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const MD_TABLE_SEPARATOR_LINE_REGEX = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/;

type TableAlignment = "text-left" | "text-center" | "text-right" | undefined;

type MarkdownListType = "ul" | "ol";

type ParsedListItem = {
    key: number;
    lines: ReactNode[][];
    children: ParsedList[];
};

type ParsedList = {
    key: number;
    type: MarkdownListType;
    indent: number;
    items: ParsedListItem[];
};

const appendNodes = (target: ReactNode[], nodes: ReactNode[]) => {
    for (const node of nodes) {
        target.push(node);
    }
};

const generateHeadingId = (rawText: string): string => {
    return rawText
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
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

        const href = relativePathPrefix ? rewriteRelativeDocsHref(relativePathPrefix, urlPath) : urlPath;

        if (href.startsWith("#")) {
            // same-page hash link, scroll to heading instead of navigating (incompatible with hash router)
            const targetId = urlPath.slice(1);

            nodes.push(
                <button
                    type="button"
                    key={`${keyPrefix}-link-${matchStartIndex}`}
                    className="link link-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    {linkText}
                </button>,
            );
        } else {
            nodes.push(
                <a key={`${keyPrefix}-link-${matchStartIndex}`} href={href} className="link link-primary" target="_blank" rel="noopener noreferrer">
                    {linkText}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-0.5" />
                </a>,
            );
        }

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
                <span key={`md-code-${matchStartIndex}`} className="badge badge-ghost font-mono inline text-base-content/80 pt-1 pb-1">
                    {inlineCode}
                </span>,
            );
        } else if (boldItalicText !== undefined) {
            parsedLine.push(
                <span key={`md-bold-italic-${matchStartIndex}`} className="italic font-bold">
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
                <span key={`md-italic-${matchStartIndex}`} className="italic">
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

const renderListItemLines = (lines: ReactNode[][], keyPrefix: string): ReactNode[] => {
    const output: ReactNode[] = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const hasNewline = lineIdx > 0;

        if (hasNewline) {
            output.push(<br key={`${keyPrefix}-br-${lineIdx}`} />);
        }

        output.push(
            <span key={`${keyPrefix}-line-${lineIdx}`} className={hasNewline ? "ps-4" : undefined}>
                {lines[lineIdx]}
            </span>,
        );
    }

    return output;
};

const renderMarkdownList = (list: ParsedList, keyPrefix: string, depth = 0): ReactNode => {
    const renderedItems: ReactNode[] = [];

    for (let itemIdx = 0; itemIdx < list.items.length; itemIdx++) {
        const item = list.items[itemIdx];

        renderedItems.push(
            <li key={`${keyPrefix}-item-${item.key}`}>
                {renderListItemLines(item.lines, `${keyPrefix}-${item.key}`)}
                {item.children.map((child) => renderMarkdownList(child, `${keyPrefix}-${item.key}-${child.key}`, depth + 1))}
            </li>,
        );
    }

    return list.type === "ol" ? (
        <ol key={`${keyPrefix}-ol`} className={`list-decimal list-inside py-2 ${depth > 0 ? "ms-4" : ""}`}>
            {renderedItems}
        </ol>
    ) : (
        <ul key={`${keyPrefix}-ul`} className={`list-disc list-inside py-2 ${depth > 0 ? "ms-4" : ""}`}>
            {renderedItems}
        </ul>
    );
};

const isListContinuationLine = (line: string): boolean => {
    const trimmedLine = line.trim();

    return trimmedLine !== "" && !trimmedLine.startsWith("#") && !trimmedLine.startsWith("```") && !trimmedLine.startsWith("<!--");
};

function parseMarkdown(md: string): ReactNode[] {
    const textArr = md.split("\n");
    const outputNodes: ReactNode[] = [];
    let blockIdx = 0;
    let inCodeBlock = false;
    let codeBlock: string[] = [];
    let rootLists: ParsedList[] = [];
    let listStack: ParsedList[] = [];
    let listNodeKey = 0;

    const nextListNodeKey = () => {
        const key = listNodeKey;
        listNodeKey += 1;

        return key;
    };

    const flushList = () => {
        if (rootLists.length === 0) {
            return;
        }

        for (let rootIdx = 0; rootIdx < rootLists.length; rootIdx++) {
            outputNodes.push(
                <div key={`md-block-${blockIdx++}`}>{renderMarkdownList(rootLists[rootIdx], `md-list-${rootLists[rootIdx].key}-${rootIdx}`)}</div>,
            );
        }

        rootLists = [];
        listStack = [];
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
            const headerCells = parseTableCells(tableHeaderCandidate);
            const separatorCells = parseTableCells(tableSeparatorCandidate);
            const tableAlignments: TableAlignment[] = [];
            const headerNodes: ReactNode[] = [];
            const bodyNodes: ReactNode[] = [];

            for (let headerCellIdx = 0; headerCellIdx < headerCells.length; headerCellIdx++) {
                const headerCell = headerCells[headerCellIdx];
                const separatorCell = (separatorCells[headerCellIdx] ?? "").trim();
                const isLeftAligned = separatorCell.startsWith(":");
                const isRightAligned = separatorCell.endsWith(":");
                let cellAlignment: TableAlignment;

                if (isLeftAligned && isRightAligned) {
                    cellAlignment = "text-center";
                } else if (isRightAligned) {
                    cellAlignment = "text-right";
                } else if (isLeftAligned) {
                    cellAlignment = "text-left";
                }

                tableAlignments.push(cellAlignment);
                headerNodes.push(
                    <th key={`md-table-head-${headerCellIdx}-${headerCell}`} className={cellAlignment}>
                        {parseMarkdownInline(headerCell.trim())}
                    </th>,
                );
            }

            for (let rowIdx = lineIdx + 2; rowIdx < textArr.length; rowIdx++) {
                const rowLine = textArr[rowIdx].trim();

                if (rowLine === "" || rowLine.indexOf("|") === -1) {
                    break;
                }

                const rowCells = parseTableCells(rowLine);
                const rowNodes: ReactNode[] = [];

                for (let cellIdx = 0; cellIdx < headerCells.length; cellIdx++) {
                    const rowCell = rowCells[cellIdx] ?? "";

                    rowNodes.push(
                        <td key={`md-table-cell-${rowIdx}-${cellIdx}-${rowCell}`} className={tableAlignments[cellIdx]}>
                            {parseMarkdownInline(rowCell.trim())}
                        </td>,
                    );
                }

                bodyNodes.push(<tr key={`md-table-row-${rowIdx}`}>{rowNodes}</tr>);

                tableEndLineIdx = rowIdx;
            }

            outputNodes.push(
                <div key={`md-block-${blockIdx++}`} className="overflow-x-auto my-2">
                    <table className="table table-border [&>thead>tr>th]:px-2 [&>tbody>tr>td]:px-2 [&>thead>tr>th]:py-1.25 [&>tbody>tr>td]:py-1.25">
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

        const listMatch = line.match(MD_LIST_ITEM_REGEX);

        if (listMatch) {
            const [, leadingWs, marker, listText] = listMatch;
            const indent = leadingWs.length;
            const listType: MarkdownListType = marker.endsWith(".") ? "ol" : "ul";

            while (listStack.length > 0 && indent < listStack[listStack.length - 1].indent) {
                listStack.pop();
            }

            if (listStack.length > 0 && indent === listStack[listStack.length - 1].indent && listType !== listStack[listStack.length - 1].type) {
                listStack.pop();
            }

            let targetList = listStack[listStack.length - 1];

            if (!targetList || indent > targetList.indent || (indent === targetList.indent && listType !== targetList.type)) {
                const newList: ParsedList = {
                    key: nextListNodeKey(),
                    type: listType,
                    indent,
                    items: [],
                };

                const parentList = listStack[listStack.length - 1];
                const parentItem = parentList?.items[parentList.items.length - 1];

                if (parentItem && indent > parentList.indent) {
                    parentItem.children.push(newList);
                } else {
                    rootLists.push(newList);
                }

                listStack.push(newList);
                targetList = newList;
            }

            targetList.items.push({
                key: nextListNodeKey(),
                lines: [parseMarkdownInline(listText)],
                children: [],
            });
            continue;
        }

        if (listStack.length > 0 && isListContinuationLine(line)) {
            const currentList = listStack[listStack.length - 1];
            const currentItem = currentList.items[currentList.items.length - 1];

            if (currentItem) {
                currentItem.lines.push(parseMarkdownInline(line.trim()));
                continue;
            }
        }

        flushList();

        if (line.startsWith("######")) {
            const text = line.slice(7);

            outputNodes.push(
                <h6 key={`md-block-${blockIdx++}`} id={generateHeadingId(text)} className="text-xs font-bold mt-4 mb-2 scroll-mt-18">
                    {text}
                </h6>,
            );
            continue;
        }

        if (line.startsWith("#####")) {
            const text = line.slice(6);

            outputNodes.push(
                <h5 key={`md-block-${blockIdx++}`} id={generateHeadingId(text)} className="text-sm font-bold mt-4 mb-2 scroll-mt-18">
                    {text}
                </h5>,
            );
            continue;
        }

        if (line.startsWith("####")) {
            const text = line.slice(5);

            outputNodes.push(
                <h4 key={`md-block-${blockIdx++}`} id={generateHeadingId(text)} className="text-md font-bold mt-4 mb-2 scroll-mt-18">
                    {text}
                </h4>,
            );
            continue;
        }

        if (line.startsWith("###")) {
            const text = line.slice(4);

            outputNodes.push(
                <h3 key={`md-block-${blockIdx++}`} id={generateHeadingId(text)} className="text-lg font-bold mt-4 mb-2 scroll-mt-18">
                    {text}
                </h3>,
            );
            continue;
        }

        if (line.startsWith("##")) {
            const text = line.slice(3);

            outputNodes.push(
                <h2
                    key={`md-block-${blockIdx++}`}
                    id={generateHeadingId(text)}
                    className="text-xl font-bold border-b border-base-content/25 py-1.5 mt-4 mb-2 scroll-mt-18"
                >
                    {text}
                </h2>,
            );
            continue;
        }

        if (line.startsWith("#")) {
            const text = line.slice(2);

            outputNodes.push(
                <h1 key={`md-block-${blockIdx++}`} id={generateHeadingId(text)} className="text-2xl font-bold mt-4 mb-2 scroll-mt-18">
                    {text}
                </h1>,
            );
            continue;
        }

        if (line.startsWith("```")) {
            if (inCodeBlock) {
                outputNodes.push(
                    <pre key={`md-block-${blockIdx++}`} className="w-full bg-base-200 text-base-content/80 my-1 py-2 px-4 rounded-sm overflow-x-auto">
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
                <div className="flex flex-row flex-wrap items-center gap-1 mt-3 text-wrap break-all">
                    Source:
                    <span>{url}</span>
                </div>
                <div className="flex flex-row flex-wrap items-center gap-1 text-wrap break-all">
                    Edit:
                    <a href={editUrl} className="link link-primary" target="_blank" rel="noopener noreferrer">
                        {editUrl}
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-0.5" />
                    </a>
                </div>
            </Suspense>
        </div>
    );
});

export default Docs;
