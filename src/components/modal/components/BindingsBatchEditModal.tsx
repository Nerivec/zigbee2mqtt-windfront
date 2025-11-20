import NiceModal, { useModal } from "@ebay/nice-modal-react";
import type { Row } from "@tanstack/react-table";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BindingTableData } from "../../../pages/BindingsPage.js";
import type { Device } from "../../../types.js";
import Button from "../../Button.js";
import { findPossibleClusters } from "../../binding/index.js";
import ClusterMultiPicker from "../../pickers/ClusterMultiPicker.js";
import Modal from "../Modal.js";

type BindingsBatchEditModalProps = {
    devices: Record<number, Device[]>;
    selectedRows: Row<BindingTableData>[];
    onApply(args: [boolean | undefined, string[]]): Promise<void>;
};

export const BindingsBatchEditModal = NiceModal.create(({ devices, selectedRows, onApply }: BindingsBatchEditModalProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common", "devicePage"]);
    const [clusters, setClusters] = useState<string[] | undefined>([]);

    const handleApply = useCallback(async (): Promise<void> => {
        if (Array.isArray(clusters) && clusters.length > 0) {
            await onApply([false, clusters]);
            modal.remove();
        }
    }, [onApply, modal, clusters]);

    useEffect(() => {
        const close = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                modal.remove();
            }
        };

        window.addEventListener("keydown", close);

        return () => window.removeEventListener("keydown", close);
    }, [modal]);

    const possibleClusters = useMemo(() => {
        let elements = new Set<string>();
        let firstAdded = false;

        for (const selectedRow of selectedRows) {
            const {
                original: { sourceIdx, rule, device },
            } = selectedRow;
            const { target } = rule;

            const targetEntity =
                target.type === "group" ? undefined : devices[sourceIdx].find((device) => device.ieee_address === target.ieee_address);
            const possible = findPossibleClusters(rule, device.endpoints, targetEntity);

            if (!firstAdded) {
                elements = possible;
                firstAdded = true;

                continue;
            }

            elements = elements.intersection(possible);
        }

        return elements;
    }, [selectedRows, devices]);

    const mismatchingRows = useMemo(() => {
        const firstType = selectedRows[0]?.original.rule.target.type;

        return selectedRows.some((r) => r.original.rule.target.type !== firstType);
    }, [selectedRows]);

    if (mismatchingRows) {
        return (
            <Modal
                isOpen={modal.visible}
                title={t(($) => $.reporting, { ns: "devicePage" })}
                footer={
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t(($) => $.cancel, { ns: "common" })}
                    </Button>
                }
            >
                {t(($) => $.mismatching_types, { ns: "common" })}
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={modal.visible}
            title={t(($) => $.reporting, { ns: "devicePage" })}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t(($) => $.cancel, { ns: "common" })}
                    </Button>
                    <Button<void> title={t(($) => $.apply, { ns: "common" })} className="btn btn-primary ms-1" onClick={handleApply}>
                        {t(($) => $.apply, { ns: "common" })}
                    </Button>
                </>
            }
        >
            <ClusterMultiPicker
                label={t(($) => $.clusters, { ns: "common" })}
                clusters={possibleClusters}
                value={clusters ?? []}
                onChange={setClusters}
            />
        </Modal>
    );
});
