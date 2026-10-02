"use client";
import React from "react";

interface SectionHeaderProps {
    title: string;
    children?: React.ReactNode;
    actionIcon?: string;
    onAction?: () => void;
    actionAriaLabel?: string;
    actionClassName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    children,
    actionIcon,
    onAction,
    actionAriaLabel = "Acción",
    actionClassName = "",
}) => (
    <div className="p-2 px-3 flex flex-col gap-2 w-full border-b border-focus-500/35 bg-linear-to-r from-primary-500 to-primary-900/80 rounded-dx shadow-xs">
        <div className="flex items-center justify-between">
            <div className="w-full">
                <div className="text-xl">{title}</div>
                {children && <div className="mt-2 w-full">{children}</div>}
            </div>
            {actionIcon && (
                <button
                    className={`bg-focus-500 rounded-dx w-10 h-10 flex items-center justify-center ${actionClassName}`}
                    onClick={onAction}
                    aria-label={actionAriaLabel}
                >
                    <img
                        src={actionIcon}
                        alt=""
                        className="w-6 h-6"
                        style={{ filter: "invert(1)" }}
                    />
                </button>
            )}
        </div>
    </div>
);

export default SectionHeader;