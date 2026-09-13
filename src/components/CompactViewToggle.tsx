import { faList, faTableCellsLarge } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type Dispatch, memo, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button.js";

type CompactViewToggleProps = {
    compact: boolean;
    setCompact: Dispatch<SetStateAction<boolean>>;
};

const CompactViewToggle = memo(({ compact, setCompact }: CompactViewToggleProps) => {
    const { t } = useTranslation("common");
    const label = compact ? t(($) => $.expanded_view) : t(($) => $.compact_view);

    return (
        <Button
            onClick={() => setCompact(!compact)}
            className="btn btn-outline btn-primary btn-square btn-sm tooltip tooltip-left"
            title={label}
            aria-label={label}
        >
            <FontAwesomeIcon icon={compact ? faTableCellsLarge : faList} />
        </Button>
    );
});

export default CompactViewToggle;
