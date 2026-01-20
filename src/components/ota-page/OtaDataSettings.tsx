import { type Dispatch, memo, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import InputField from "../form-fields/InputField.js";

type OtaSettings = {
    image_block_request_timeout?: number;
    image_block_response_delay?: number;
    default_maximum_data_size?: number;
};

export type OtaDataSettingsProps = {
    settings: OtaSettings;
    setSettings: Dispatch<SetStateAction<OtaSettings>>;
    defaultSettings: OtaSettings;
};

const OtaDataSettings = memo(({ settings, setSettings, defaultSettings }: OtaDataSettingsProps) => {
    const { t } = useTranslation("ota");

    return (
        <div className="flex flex-col gap-0 items-center">
            <InputField
                type="number"
                name="image_block_request_timeout"
                label={t(($) => $.image_block_request_timeout)}
                min={10000}
                max={2147483647}
                value={settings.image_block_request_timeout ?? ""}
                placeholder={`${defaultSettings.image_block_request_timeout ?? 150000}`}
                onChange={(e) =>
                    setSettings({
                        ...settings,
                        image_block_request_timeout: e.target.value ? e.target.valueAsNumber : undefined,
                    })
                }
            />
            <InputField
                type="number"
                name="image_block_response_delay"
                label={t(($) => $.image_block_response_delay)}
                min={50}
                value={settings.image_block_response_delay ?? ""}
                placeholder={`${defaultSettings.image_block_response_delay ?? 250}`}
                onChange={(e) =>
                    setSettings({
                        ...settings,
                        image_block_response_delay: e.target.value ? e.target.valueAsNumber : undefined,
                    })
                }
            />
            <InputField
                type="number"
                name="default_maximum_data_size"
                label={t(($) => $.default_maximum_data_size)}
                min={10}
                max={100}
                value={settings.default_maximum_data_size ?? ""}
                placeholder={`${defaultSettings.default_maximum_data_size ?? 50}`}
                onChange={(e) =>
                    setSettings({
                        ...settings,
                        default_maximum_data_size: e.target.value ? e.target.valueAsNumber : undefined,
                    })
                }
            />
        </div>
    );
});

export default OtaDataSettings;
