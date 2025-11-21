import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../../types.js";
import Button from "../../Button.js";
import ReportingRow from "../../device-page/ReportingRow.js";
import type { ReportingRule } from "../../reporting/index.js";
import Modal from "../Modal.js";

type ReportingRuleModalProps = {
    sourceIdx: number;
    device: Device;
    rule: ReportingRule;
    onApply(rule: ReportingRule): Promise<void>;
};

export const ReportingRuleModal = NiceModal.create(({ sourceIdx, device, rule, onApply }: ReportingRuleModalProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["common", "devicePage"]);

    const handleApply = useCallback(
        async (updatedRule: ReportingRule): Promise<void> => {
            await onApply(updatedRule);
            modal.remove();
        },
        [onApply, modal],
    );

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

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t(($) => $.reporting, { ns: "devicePage" })}: ${device.friendly_name} (${rule.endpoint})`}
            footer={
                <Button className="btn btn-neutral" onClick={modal.remove}>
                    {t(($) => $.cancel)}
                </Button>
            }
        >
            <ReportingRow sourceIdx={sourceIdx} device={device} rule={rule} onApply={handleApply} showDivider={false} hideUnbind />
        </Modal>
    );
});
