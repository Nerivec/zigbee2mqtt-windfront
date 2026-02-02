import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type SectionProps = {
    title: string;
    icon: IconDefinition;
    iconColor?: string;
    children: React.ReactNode;
    description?: string;
};

export default function Section({ title, icon, iconColor = "text-primary", children, description }: SectionProps) {
    return (
        <div className="card bg-base-200 mb-4">
            <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={icon} className={iconColor} />
                    {title}
                </h3>
                {description && <p className="text-sm opacity-70 -mt-2">{description}</p>}
                <div className="mt-2">{children}</div>
            </div>
        </div>
    );
}
