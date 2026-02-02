import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type SettingCardProps = {
    title: string;
    description: string;
    icon: IconDefinition;
    iconColor?: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    children?: React.ReactNode;
    badge?: { text: string; color: string };
    comingSoon?: boolean;
};

export default function SettingCard({
    title,
    description,
    icon,
    iconColor = "text-primary",
    enabled,
    onToggle,
    children,
    badge,
    comingSoon,
}: SettingCardProps) {
    return (
        <div className={`card bg-base-100 border ${enabled ? "border-primary" : "border-base-300"} mb-3`}>
            <div className="card-body p-4">
                <div className="flex items-start gap-3">
                    <div className={`text-2xl ${enabled ? iconColor : "text-base-content/30"}`}>
                        <FontAwesomeIcon icon={icon} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{title}</h4>
                            {badge && <span className={`badge badge-sm ${badge.color}`}>{badge.text}</span>}
                            {comingSoon && <span className="badge badge-sm badge-ghost">Coming Soon</span>}
                        </div>
                        <p className="text-sm opacity-70">{description}</p>
                    </div>
                    <div className="form-control">
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={enabled}
                                onChange={(e) => onToggle(e.target.checked)}
                                disabled={comingSoon}
                            />
                        </label>
                    </div>
                </div>
                {enabled && children && (
                    <div className="mt-3 pt-3 border-t border-base-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
