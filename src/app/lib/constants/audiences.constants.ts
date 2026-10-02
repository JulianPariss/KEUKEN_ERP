export const CLUSTER_KIND_OPTIONS = [
    { id: 'static', name: 'Estática' },
    { id: 'dynamic', name: 'Dinámica' },
    { id: 'hybrid', name: 'Híbrida' },
];

export const PREDICATE_TYPES = [
    { id: 'purchase_exists', name: 'Historial de Compras' },
    { id: 'purchase_agg', name: 'Volumen o Monto Acumulado' },
    { id: 'customer_attr', name: 'Atributo del Cliente' },
    { id: 'in_cluster', name: 'Incluir miembros de otro Clúster' },
    { id: 'not_in_cluster', name: 'Excluir miembros de otro Clúster' },
    { id: 'purchase_compare_period', name: 'Comparación Temporal' },
];

export const EXISTS_OPS = [
    { id: 'any', name: 'Compró al menos una vez' },
    { id: 'none', name: 'No realizó compras' },
];

export const AGG_METRICS = [
    { id: 'amount', name: 'Monto Facturado' },
    { id: 'weight_kg', name: 'Peso en Kilos' },
    { id: 'qty', name: 'Cantidad de Unidades' },
];

export const AGG_OPS = [
    { id: 'gt', name: '> Mayor que' },
    { id: 'gte', name: '>= Mayor o igual a' },
    { id: 'lt', name: '< Menor que' },
    { id: 'lte', name: '<= Menor o igual a' },
    { id: 'eq', name: '= Igual a' },
];

export const DAYS_OPTIONS = [
    { id: 30, name: 'Últimos 30 días' },
    { id: 60, name: 'Últimos 60 días' },
    { id: 90, name: 'Últimos 90 días' },
    { id: 180, name: 'Últimos 180 días (6 meses)' },
    { id: 365, name: 'Últimos 365 días (1 año)' },
];

export const ATTR_FIELDS = [
    { id: 'price_segment_id', name: 'Segmento Comercial (price_segment_id)' },
    { id: 'tax_category_id', name: 'Categoría Fiscal (tax_category_id)' },
    { id: 'city_id', name: 'Localidad / Ciudad (city_id)' },
];

export const REFRESH_MODE_OPTIONS = [
    { id: 'manual', name: 'Manual' },
    { id: 'scheduled', name: 'Programada' },
    { id: 'on_read', name: 'Al consultar' },
];

export const CLUSTER_KIND_LABELS: Record<string, string> = {
    static: 'Estática',
    dynamic: 'Dinámica',
    hybrid: 'Híbrida',
};

export const REFRESH_MODE_LABELS: Record<string, string> = {
    manual: 'Manual',
    scheduled: 'Programada',
    on_read: 'Al consultar',
};

export const ITEMS_ORGIN_LABELS: Record<string, string> = {
    manual: 'Manual',
    category_expand: 'Categoría'
}

export const CUSTOMERS_ORGIN_LABELS: Record<string, string> = {
    manual: 'Manual',
    rule: 'Regla'
}