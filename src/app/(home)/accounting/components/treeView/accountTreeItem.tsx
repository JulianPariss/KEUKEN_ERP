'use client';

import { IFAccountNode } from "@repo/api-contracts/erp";
import { useSearchParams } from "next/navigation";

const AccountTreeItem = ({
    account,
    childrenMap,
    collapsedAccounts,
    setCollapsedAccounts,
    onSelect,
    mirrored
}: {
    account: IFAccountNode;
    childrenMap: Map<string, IFAccountNode[]>;
    collapsedAccounts: Record<string, boolean>;
    setCollapsedAccounts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    onSelect: (account: IFAccountNode) => void;
    mirrored?: boolean;
}) => {
    const searchParams = useSearchParams();
    const activePath = searchParams.get('path') || '';
    const isSelected = activePath === account.id;

    const isParentOfActive = activePath.startsWith(account.id + '.');

    const children = childrenMap.get(account.id) ?? [];
    const hasChildren = children.length > 0;

    const isCollapsed = collapsedAccounts[account.id] ?? !isParentOfActive;

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedAccounts(prev => ({ ...prev, [account.id]: !isCollapsed }));
    };

    const isImputable = account.status === 'active';

    return (
        <div className="flex flex-col gap-1">
            <div
                onClick={() => {
                    onSelect(account)
                    if (isSelected) return;
                    setCollapsedAccounts(prev => ({ ...prev, [account.id]: false }));
                }}
                className={`flex justify-between items-center p-2 rounded-dx border-1 transition-all cursor-pointer 
                    ${isImputable ? 'bg-primary-500/80' : 'bg-primary-900'}
                    ${mirrored ? 'flex-row-reverse' : ''}
                    ${isSelected ? 'border-focus-100 !bg-primary-500 shadow-sm shadow-black/10' : 'border-none hover:bg-primary-500'}`}
            >
                <div className={`flex items-center gap-2 overflow-hidden ${mirrored ? 'flex-row-reverse' : ''}`}>
                    {hasChildren ? (
                        <button onClick={toggle} className="text-sm text-main/40 hover:text-main transition-colors">
                            <i className={isCollapsed ? "dx-icon-chevronright" : "dx-icon-chevrondown"}></i>
                        </button>
                    ) :
                        <div className="rounded-full size-[6px] mx-[4px] border-1 border-main/40" />
                    }
                    <i className={`${isImputable ? 'dx-icon-money text-focus-300' : 'dx-icon-inactivefolder text-primary-300'} text-[14px]`}></i>
                    <div className={`flex flex-col ${mirrored ? 'items-end text-right' : ''}`}>
                        <span className="text-xs text-main/50  leading-none">
                            {isImputable ? 'Imputable' : 'No Imputable'}
                        </span>
                        <span className={`text-sm font-mono truncate ${isSelected ? 'text-focus-100 font-bold' : 'text-focus-200'}`}>
                            {account.name}
                        </span>
                    </div>
                </div>
            </div>

            {!isCollapsed && hasChildren && (
                <div className="flex flex-col gap-1 ml-3 border-l border-main/10 pl-2">
                    {children.map(child => (
                        <AccountTreeItem
                            key={child.id}
                            account={child}
                            childrenMap={childrenMap}
                            collapsedAccounts={collapsedAccounts}
                            setCollapsedAccounts={setCollapsedAccounts}
                            onSelect={onSelect}
                            mirrored={mirrored}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


export default AccountTreeItem;