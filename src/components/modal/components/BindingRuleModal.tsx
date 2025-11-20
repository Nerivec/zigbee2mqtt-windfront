import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Device, Group } from "../../../types.js";
import Button from "../../Button.js";
import type { Action, BindingRule } from "../../binding/index.js";
import BindRow from "../../device-page/BindRow.js";
import Modal from "../Modal.js";

type BindingRuleModalProps = {
    sourceIdx: number;
    device: Device;
    devices: Device[];
    groups: Group[];
    rule: BindingRule;
    onApply(args: [Action, BindingRule]): Promise<void>;
};

export const BindingRuleModal = NiceModal.create(({ sourceIdx, device, devices, groups, rule, onApply }: BindingRuleModalProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["common", "devicePage"]);

    const handleApply = useCallback(
        async (args: [Action, BindingRule]): Promise<void> => {
            await onApply(args);
            modal.remove();
        },
        [modal, onApply],
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
            title={`${t(($) => $.bind, { ns: "devicePage" })}: ${device.friendly_name} (${rule.source.endpoint})`}
            footer={
                <Button className="btn btn-neutral" onClick={modal.remove}>
                    {t(($) => $.cancel)}
                </Button>
            }
        >
            <BindRow
                sourceIdx={sourceIdx}
                device={device}
                devices={devices}
                groups={groups}
                rule={rule}
                onApply={handleApply}
                showDivider={false}
                hideUnbind
            />
        </Modal>
    );
});
