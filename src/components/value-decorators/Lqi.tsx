import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { getLinkQualityIcon } from "../features/index.js";
import DisplayValue from "./DisplayValue.js";

type LqiProps = {
    value: number | undefined;
};

const Lqi = memo(({ value }: LqiProps) => {
    const [icon, className] = getLinkQualityIcon(value);

    return (
        <>
            <FontAwesomeIcon icon={icon} className={className} /> <DisplayValue value={value} name="linkquality" />
        </>
    );
});

export default Lqi;
