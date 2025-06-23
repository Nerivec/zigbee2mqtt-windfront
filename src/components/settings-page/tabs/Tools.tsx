import NiceModal from "@ebay/nice-modal-react";
import saveAs from "file-saver";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../hooks/useApp.js";
import store, { setBackupPreparing } from "../../../store.js";
import { downloadAsZip, formatDate } from "../../../utils.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Button from "../../Button.js";
import ConfirmButton from "../../ConfirmButton.js";
import { AddInstallCodeModal } from "../../modal/components/AddInstallCodeModal.js";
import { ImageLocaliser } from "../ImageLocaliser.js";

export default function Tools() {
    const dispatch = useAppDispatch();
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const backup = useAppSelector((state) => state.backup);
    const preparingBackup = useAppSelector((state) => state.preparingBackup);
    const devices = useAppSelector((state) => state.devices);
    const { t } = useTranslation(["settings", "common"]);

    const downloadBackup = useCallback((): void => {
        const ts = formatDate(new Date()).replace(/[\s_:]/g, "-");
        const backupFileName = `z2m-backup.${bridgeInfo.version}.${ts}.zip`;

        saveAs(`data:application/zip;base64,${backup}`, backupFileName);
    }, [backup, bridgeInfo.version]);

    return (
        <div className="join join-vertical">
            <ConfirmButton
                className="btn btn-error join-item mb-2"
                onClick={async () => await sendMessage("bridge/request/restart", "")}
                title={t("restart_zigbee2mqtt")}
                modalDescription={t("common:dialog_confirmation_prompt")}
                modalCancelLabel={t("common:cancel")}
            >
                {t("restart_zigbee2mqtt")}
            </ConfirmButton>
            <Button
                className="btn btn-primary join-item"
                onClick={async () => await downloadAsZip(store.getState() as unknown as Record<string, unknown>, "state.json")}
            >
                {t("download_state")}
            </Button>
            {preparingBackup ? (
                <Button className="btn btn-primary join-item disabled">
                    <span className="loading loading-dots loading-xl" />
                </Button>
            ) : backup ? (
                <Button className="btn btn-primary join-item" onClick={downloadBackup}>
                    {t("download_z2m_backup")}
                </Button>
            ) : (
                <Button
                    className="btn btn-primary join-item"
                    onClick={async () => {
                        dispatch(setBackupPreparing());
                        await sendMessage("bridge/request/backup", "");
                    }}
                >
                    {t("request_z2m_backup")}
                </Button>
            )}
            <Button
                className="btn btn-primary join-item"
                onClick={async () =>
                    await NiceModal.show(AddInstallCodeModal, {
                        addInstallCode: async (code: string) => await sendMessage("bridge/request/install_code/add", { value: code }),
                    })
                }
            >
                {t("add_install_code")}
            </Button>
            <ImageLocaliser devices={devices} />
        </div>
    );
}
