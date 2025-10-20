import type { JSONSchema7 } from "json-schema";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import ArrayField from "../form-fields/ArrayField.js";
import CheckboxesField from "../form-fields/CheckboxesField.js";
import CheckboxField from "../form-fields/CheckboxField.js";
import InputField from "../form-fields/InputField.js";
import NumberField from "../form-fields/NumberField.js";
import SelectField from "../form-fields/SelectField.js";

type SettingsListProps = {
    schema: JSONSchema7;
    data: Record<string, unknown>;
    set: (data: Record<string, unknown>) => Promise<void>;
    rootOnly?: boolean;
    namespace: string;
};

const DISABLE_AUTO_FILL_PROPS = {
    autoComplete: "off",
    "data-bwignore": "true",
    "data-lpignore": "true",
    "data-1p-ignore": "true",
};

const propertyToField = (
    key: string,
    property: JSONSchema7,
    value: unknown,
    set: SettingsListProps["set"],
    depth: number,
    required?: boolean,
    description?: string,
): JSX.Element | undefined => {
    let propertyType = property.type;

    if (Array.isArray(propertyType)) {
        propertyType = propertyType.find((type) => type !== "null");
        // XXX: support other cases (not needed atm)
    } else if (property.oneOf) {
        // purposely not supported (currently: advanced.network_key, advanced.pan_id, advanced.ext_pan_id, all set via onboarding)
        return;
    }

    const elemKey = `${depth}-${key}-${property.type}-${property.title}`;

    switch (propertyType) {
        case "boolean": {
            return (
                <CheckboxField
                    key={elemKey}
                    name={key}
                    label={key}
                    detail={description}
                    onChange={(e) => !e.target.validationMessage && set({ [key]: e.target.checked })}
                    required={required}
                    defaultChecked={(value as boolean) ?? false}
                />
            );
        }

        case "integer":
        case "number": {
            if (property.enum) {
                return (
                    <SelectField
                        key={elemKey}
                        name={key}
                        label={key}
                        detail={description}
                        onChange={(e) =>
                            !e.target.validationMessage && set({ [key]: e.target.value === "" ? null : Number.parseInt(e.target.value, 10) })
                        }
                        required={required}
                        defaultValue={(value as number) ?? ""}
                    >
                        <option value="" disabled={required}>
                            -
                        </option>
                        {(property.enum as number[]).map((entry) => (
                            <option value={entry} key={entry}>
                                {entry}
                            </option>
                        ))}
                    </SelectField>
                );
            }

            return (
                <NumberField
                    key={elemKey}
                    name={key}
                    label={key}
                    detail={description}
                    onSubmit={(value, valid) => valid && set({ [key]: value === "" ? null : value })}
                    min={property.minimum}
                    max={property.maximum}
                    required={required}
                    initialValue={(value as number) ?? ""}
                />
            );
        }

        case "string": {
            if (property.enum) {
                return (
                    <SelectField
                        key={elemKey}
                        name={key}
                        label={key}
                        detail={description}
                        onChange={(e) => !e.target.validationMessage && set({ [key]: e.target.value === "" ? null : e.target.value })}
                        required={required}
                        defaultValue={(value as string) ?? ""}
                    >
                        <option value="" disabled={required}>
                            -
                        </option>
                        {(property.enum as string[]).map((entry) => (
                            <option value={entry} key={entry}>
                                {entry}
                            </option>
                        ))}
                    </SelectField>
                );
            }

            return (
                <InputField
                    key={elemKey}
                    name={key}
                    label={key}
                    detail={description}
                    type="text"
                    onBlur={(e) => !e.target.validationMessage && set({ [key]: e.target.value === "" ? null : e.target.value })}
                    required={required}
                    defaultValue={(value as string) ?? ""}
                    // Disable browser/password-manager autofill to avoid
                    // accidental population of settings (e.g. the MQTT password). Disabling
                    // autofill on the "password" field alone prevents related fields (such as user and key)
                    // from being auto-filled by password managers (tested with Bitwarden).
                    // https://github.com/Nerivec/zigbee2mqtt-windfront/issues/277
                    {...(key === "password" ? DISABLE_AUTO_FILL_PROPS : undefined)}
                />
            );
        }

        case "array": {
            const items = property.items;

            if (items && typeof items === "object" && "type" in items) {
                if (items.enum) {
                    return (
                        <CheckboxesField
                            names={items.enum as string[]}
                            label={key}
                            detail={description}
                            onSubmit={(values) => set({ [key]: values })}
                            defaultsChecked={(value as string[]) ?? []}
                        />
                    );
                }

                if (items.type === "string" || items.type === "number") {
                    return (
                        <ArrayField
                            defaultValues={(value as (string | number)[]) ?? []}
                            label={key}
                            detail={description}
                            onSubmit={(values) => set({ [key]: values })}
                            type={items.type}
                        />
                    );
                }
            }
        }
    }
};

const groupProperties = (
    t: ReturnType<typeof useTranslation<["settingsSchemaDescriptions", "common"]>>["t"],
    properties: JSONSchema7["properties"],
    data: SettingsListProps["data"],
    set: SettingsListProps["set"],
    depth: number,
    required: string[] = [],
    rootOnly = false,
    parentPath = "",
): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const nestedElements: JSX.Element[] = [];

    for (const key in properties) {
        const property = properties[key];

        if (typeof property === "boolean" || property.readOnly) {
            continue;
        }

        const newPath = parentPath ? `${parentPath}-${key}` : key;

        if (property.properties) {
            if (!rootOnly) {
                nestedElements.push(
                    <div className="list" key={`${depth}-${key}`}>
                        <h3 className="list-row p-3 text-lg">{property.title || key}</h3>
                        {groupProperties(
                            t,
                            property.properties,
                            (data[key] as Record<string, unknown>) || {},
                            // wrap options payload with the parent key
                            async (options) => set({ [key]: options }),
                            depth + 1,
                            property.required,
                            false,
                            newPath,
                        )}
                    </div>,
                );
            }
        } else {
            const oneOf = property.oneOf?.find((one) => typeof one === "object" && one.properties) as JSONSchema7 | undefined;

            if (oneOf) {
                // special case for syslog, only show if log output has syslog (i.e. enabled)
                if (key !== "log_syslog" || (data.log_output as string[]).includes("syslog")) {
                    nestedElements.push(
                        <div className="list" key={`${depth}-${key}`}>
                            <h3 className="list-row p-3 text-lg">{oneOf.title || property.title || key}</h3>
                            {groupProperties(
                                t,
                                oneOf.properties,
                                (data[key] as Record<string, unknown>) || {},
                                // wrap options payload with the parent key
                                async (options) => set({ [key]: options }),
                                depth + 1,
                                oneOf.required,
                                false,
                                newPath,
                            )}
                        </div>,
                    );
                }
            } else {
                const feature = propertyToField(
                    key,
                    property,
                    data[key] ?? property.default,
                    set,
                    depth,
                    required.includes(key),
                    property.description
                        ? `${t(($) => $[newPath], { defaultValue: property.description })}${property.default != null ? ` (${t(($) => $.default, { ns: "common" })}: ${property.default})` : ""}`
                        : property.default != null
                          ? `${t(($) => $.default, { ns: "common" })}: ${property.default}}`
                          : undefined,
                );

                if (feature) {
                    // XXX: enforce tailwind class presence: ps-4 ps-8 ps-12
                    elements.push(
                        <div className={`list-row p-3 ${depth !== 0 ? ` ps-${4 + depth * 4}` : ""}`} key={`${depth}-${key}`}>
                            {feature}
                        </div>,
                    );
                }
            }
        }
    }

    return nestedElements.length > 0 ? elements.concat(nestedElements) : elements;
};

export default function SettingsList({ schema, data, set, rootOnly, namespace }: SettingsListProps) {
    const { t } = useTranslation(["settingsSchemaDescriptions", "common"]);

    return (
        <div className="list bg-base-100">
            {schema.properties && groupProperties(t, schema.properties, data, set, 0, schema.required, rootOnly, namespace)}
        </div>
    );
}
