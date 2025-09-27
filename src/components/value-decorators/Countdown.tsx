import { memo, useEffect, useState } from "react";

type CountdownProps = {
    seconds: number;
    hideZeroes: boolean;
};

const Countdown = memo((props: CountdownProps) => {
    const [remaining, setRemaining] = useState(props.seconds);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRemaining(remaining - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [remaining]);

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor(remaining / 60) % 60;
    const seconds = Math.floor(remaining % 60);
    const showHours = !props.hideZeroes || hours > 0;
    const showMinutes = !props.hideZeroes || minutes > 0;

    return (
        <span className="">
            {showHours ? `${hours}:` : ""}
            {showMinutes ? `${minutes.toString().padStart(2, "0")}:` : ""}
            {seconds.toString().padStart(2, "0")}
        </span>
    );
});

export default Countdown;
