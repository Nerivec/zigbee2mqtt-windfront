import { useEffect, useRef } from "react";
import { cancel, format, type Opts, render, type TDate } from "timeago.js";

interface TimeAgoProps {
    datetime: TDate;
    locale?: string;
    opts?: Opts;
}

const toDateTime = (input: TDate): string => {
    return input instanceof Date ? `${input.toISOString()}` : `${input}`;
};

const TimeAgo = ({ datetime, locale, opts }: TimeAgoProps) => {
    const domRef = useRef<HTMLTimeElement>(null);

    useEffect(() => {
        if (!domRef.current) {
            return;
        }

        // cancel interval
        cancel(domRef.current);
        domRef.current.setAttribute("datetime", toDateTime(datetime));
        render(domRef.current, locale, opts);

        return () => {
            if (domRef.current) {
                cancel(domRef.current);
            }
        };
    }, [datetime, locale, opts]);

    return <time ref={domRef}>{format(datetime, locale, opts)}</time>;
};

export default TimeAgo;
