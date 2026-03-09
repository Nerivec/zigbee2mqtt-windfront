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
const MD_LINK_REGEX = /\[(.*?)]\((\.\.\/|\.\/)?(.*?)\)/g;
const MD_STYLE_REGEX = /`([^`]+)`|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
const MD_UNORDERED_LIST_REGEX = /^\s*[-*]\s+(.*)$/;
const MD_ORDERED_LIST_REGEX = /^\s*\d+\.\s+(.*)$/;

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

function parseMarkdown(md: string): ReactNode[] {
    const textArr = md.split("\n");
    const textRes: ReactNode[] = [];
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

        textRes.push(
            listType === "ol" ? (
                <ol key={`md-block-${blockIdx++}`} className="list-decimal list-inside">
                    {list}
                </ol>
            ) : (
                <ul key={`md-block-${blockIdx++}`} className="list-disc list-inside">
                    {list}
                </ul>
            ),
        );

        list = [];
        inList = false;
        listType = undefined;
        listItemIdx = 0;
    };

    for (const line of textArr) {
        if (line === "") {
            flushList();
            continue;
        }

        if (line.startsWith("<!--") || line.startsWith("|")) {
            flushList();
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
            textRes.push(
                <h6 key={`md-block-${blockIdx++}`} className="text-xs font-bold my-2">
                    {line.slice(7)}
                </h6>,
            );
            continue;
        }

        if (line.startsWith("#####")) {
            textRes.push(
                <h5 key={`md-block-${blockIdx++}`} className="text-sm font-bold my-2">
                    {line.slice(6)}
                </h5>,
            );
            continue;
        }

        if (line.startsWith("####")) {
            textRes.push(
                <h4 key={`md-block-${blockIdx++}`} className="text-md font-bold my-2">
                    {line.slice(5)}
                </h4>,
            );
            continue;
        }

        if (line.startsWith("###")) {
            textRes.push(
                <h3 key={`md-block-${blockIdx++}`} className="text-lg font-bold my-2">
                    {line.slice(4)}
                </h3>,
            );
            continue;
        }

        if (line.startsWith("##")) {
            textRes.push(
                <h2 key={`md-block-${blockIdx++}`} className="text-xl font-bold border-b border-base-content/25 py-1 my-4">
                    {line.slice(3)}
                </h2>,
            );
            continue;
        }

        if (line.startsWith("#")) {
            textRes.push(
                <h1 key={`md-block-${blockIdx++}`} className="text-2xl font-bold my-2">
                    {line.slice(2)}
                </h1>,
            );
            continue;
        }

        if (line.startsWith("```")) {
            if (inCodeBlock) {
                textRes.push(
                    <pre key={`md-block-${blockIdx++}`} className="w-full bg-base-200 my-1 py-2 px-4 rounded-sm">
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

        textRes.push(<p key={`md-block-${blockIdx++}`}>{parseMarkdownInline(line)}</p>);
    }

    flushList();

    return textRes;
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
    const url = `https://raw.githubusercontent.com/Koenkk/zigbee2mqtt.io/${isDevVersion ? "dev" : "master"}/docs/devices/${encodeURIComponent(normalizeDefinitionModel(definitionModel))}.md`;
    const docsPromise = fetchMd(url);

    return (
        <div className="w-full">
            <Suspense
                fallback={
                    <div className="flex flex-row justify-center items-center gap-2">
                        <span className="loading loading-infinity loading-xl" />
                    </div>
                }
            >
                <DocsContent docsPromise={docsPromise} />
                <div className="divider" />
                <pre className="mt-3">
                    <code>Source: {url}</code>
                </pre>
            </Suspense>
        </div>
    );
});

export default Docs;
