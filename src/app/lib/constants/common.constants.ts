export const PRICE_LIST_STATES = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'expired', label: 'Expirado' }
];

export const PRICE_LIST_POPULATE_MODES = [
    { value: 'empty', label: 'Vacía' },
    { value: 'all_products_margin', label: 'Todos los productos con margen' },
    { value: 'copy_rules', label: 'Copiar reglas' },
    { value: 'copy_rules_remargin', label: 'Copiar reglas y re-marginar' }
];

export const FIELD_LIMITS = {
    stringPico: 2,
    stringNano: 5,
    stringTeeny: 10,
    stringTiny: 20,
    stringSmall: 40,
    stringMedium: 50,
    stringShort: 64,
    stringMiddle: 100,
    stringLong: 255,
    smallIntMax: 32767,
    smallIntMaxMessage: "El valor no puede ser mayor a 32.767",
    decimalMax: 9999999999.99999,
    decimalMaxMessage: "El valor debe ser menor a 10.000.000.000",
    percentMax: 100,
    percentMaxMessage: "El porcentaje no puede superar el 100%",
} as const;


export const CONSIGNMENT_STATES = [
    { value: 'active', label: 'Activo' },
    { value: 'returned', label: 'Devuelto' },
    { value: 'expired', label: 'Expirado' }
];

export const SERIAL_NUMBER_STATES = [
    { value: 'active', label: 'Activo' },
    { value: 'transferred', label: 'Transferido' },
    { value: 'consumed', label: 'Consumido' }
];