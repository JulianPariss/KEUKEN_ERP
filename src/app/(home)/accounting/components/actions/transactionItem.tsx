import { IFAccountNode } from "@repo/api-contracts/erp";
import NumberBox from 'devextreme-react/number-box';
import { SelectBox } from '@repo/devextreme';
import { RangeRule, RequiredRule, Validator } from 'devextreme-react/validator';
import React from 'react';

interface AdditionalLine {
    id: string;
    accountId: string;
    type: 'debit' | 'accredit';
    amount: number;
}

interface TransactionItemProps {
    type: 'debit' | 'accredit';
    lines: AdditionalLine[];
    accounts: IFAccountNode[];
    setLines: React.Dispatch<React.SetStateAction<AdditionalLine[]>>;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ type, lines, accounts, setLines }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
                {lines.filter(l => l.type === type).map((line) => (
                    <div key={line.id} className="flex gap-1 bg-primary-0/10 p-2 rounded-dx border border-primary-500/10 relative group">
                        <SelectBox
                            items={accounts.filter(a => a.status === 'active')}
                            displayExpr={(item: any) => item ? `${item.name} (${item.code})` : ''}
                            searchExpr={['name', 'code']}
                            valueExpr="id"
                            value={line.accountId}
                            onValueChanged={(e) => {
                                setLines(prev => prev.map(l => l.id === line.id ? { ...l, accountId: e.value } : l));
                            }}
                            placeholder="Cuenta..."
                            className="w-full"
                            stylingMode="filled"
                            searchEnabled={true}
                        >
                            <Validator>
                                <RequiredRule message="La cuenta es obligatoria" />
                            </Validator>
                        </SelectBox>
                        <div className="flex gap-1">
                            <NumberBox
                                value={line.amount}
                                onValueChanged={(e) => {
                                    setLines(prev => prev.map(l => l.id === line.id ? { ...l, amount: e.value } : l));
                                }}
                                format="$ #,##0.##"
                                min={0}
                                className="flex-1"
                                stylingMode="filled"
                                showSpinButtons={false}
                            >
                                <Validator>
                                    <RequiredRule message="Monto requerido" />
                                    <RangeRule min={0.01} message="El monto debe ser mayor a 0" />
                                </Validator>
                            </NumberBox>
                            <button
                                onClick={() => setLines(prev => prev.filter(l => l.id !== line.id))}
                                className="text-main/50 hover:text-red-500 transition-colors w-8 flex justify-center items-center bg-primary-0/5 rounded"
                            >
                                <i className="dx-icon-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionItem;