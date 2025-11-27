import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import InputField from "../../form-fields/InputField.js";
import { isValidReportingRuleEdit } from "../../reporting/index.js";
import Modal from "../Modal.js";

type ReportingBatchEditModalProps = {
    onApply(args: [number, number, number, false]): Promise<void>;
};

export const ReportingBatchEditModal = NiceModal.create(({ onApply }: ReportingBatchEditModalProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common", "devicePage"]);
    const [minRepInterval, setMinRepInterval] = useState<number | "">("");
    const [maxRepInterval, setMaxRepInterval] = useState<number | "">("");
    const [repChange, setRepChange] = useState<number | null>(null);

    const handleApply = useCallback(async (): Promise<void> => {
        await onApply([minRepInterval as number, maxRepInterval as number, repChange ?? 0, false]);
        modal.remove();
    }, [onApply, modal, minRepInterval, maxRepInterval, repChange]);

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

    const isValidRule = useMemo(
        () => isValidReportingRuleEdit(minRepInterval, maxRepInterval, repChange),
        [minRepInterval, maxRepInterval, repChange],
    );

    return (
        <Modal
            isOpen={modal.visible}
            title={t(($) => $.reporting, { ns: "devicePage" })}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t(($) => $.cancel, { ns: "common" })}
                    </Button>
                    <Button<void>
                        title={t(($) => $.apply, { ns: "common" })}
                        className="btn btn-primary ms-1"
                        onClick={handleApply}
                        disabled={!isValidRule}
                    >
                        {t(($) => $.apply, { ns: "common" })}
                    </Button>
                </>
            }
        >
            <InputField
                name="minimum_report_interval"
                label={t(($) => $.min_rep_interval)}
                type="number"
                defaultValue={minRepInterval ?? ""}
                onChange={(e) => setMinRepInterval(e.target.value ? e.target.valueAsNumber : "")}
                required
                className="input validator"
                min={0}
                max={0xffff}
            />
            <InputField
                name="maximum_report_interval"
                label={t(($) => $.max_rep_interval)}
                type="number"
                defaultValue={maxRepInterval ?? ""}
                onChange={(e) => setMaxRepInterval(e.target.value ? e.target.valueAsNumber : "")}
                required
                className="input validator"
                min={0}
                max={0xffff}
            />
            <InputField
                name="reportable_change"
                label={t(($) => $.min_rep_change)}
                type="number"
                defaultValue={repChange ?? ""}
                onChange={(e) => setRepChange(e.target.value ? e.target.valueAsNumber : null)}
                className="input validator"
            />
        </Modal>
    );
});
