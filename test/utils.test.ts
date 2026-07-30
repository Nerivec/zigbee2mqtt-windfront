import { unzipSync } from "fflate";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadAsZip } from "../src/utils.js";

const saveAs = vi.hoisted(() => vi.fn<(blob: Blob, filename: string) => void>());

vi.mock("file-saver", () => ({ saveAs }));

describe("downloadAsZip", () => {
    beforeEach(() => {
        saveAs.mockClear();
    });

    it("saves a zip holding the data as pretty-printed JSON", async () => {
        const data = { answer: 42, nested: { list: [1, 2, 3] } };

        await downloadAsZip(data, "state.json");

        expect(saveAs).toHaveBeenCalledTimes(1);

        const [blob, filename] = saveAs.mock.calls[0];

        expect(filename).toStrictEqual("state.json.zip");
        expect(blob.type).toStrictEqual("application/zip");

        const entries = unzipSync(new Uint8Array(await blob.arrayBuffer()));

        expect(Object.keys(entries)).toStrictEqual(["state.json"]);
        expect(new TextDecoder().decode(entries["state.json"])).toStrictEqual(JSON.stringify(data, null, 4));
    });

    it("compresses the archive instead of storing it", async () => {
        // highly repetitive payload: a stored archive would come out larger than the JSON itself
        const data = { padding: "x".repeat(4096) };

        await downloadAsZip(data, "big.json");

        const [blob] = saveAs.mock.calls[0];

        expect(blob.size).toBeLessThan(JSON.stringify(data, null, 4).length);
    });
});
