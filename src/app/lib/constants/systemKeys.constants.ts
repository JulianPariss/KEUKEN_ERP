export interface ISystemKeyTemplate {
    key: string;
    dataType: 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'datetime' | 'list' | 'json';
    category: string;
    description: string;
    isSecret?: boolean;
}

export const SYSTEM_KEY_TEMPLATES: ISystemKeyTemplate[] = [
    { key: 'storage.short_link.base_url', dataType: 'string', category: 'storage', description: 'Base URL para enlaces cortos' },
    { key: 'storage.short_link.ttl_days', dataType: 'integer', category: 'storage', description: 'Días de expiración (TTL) para enlaces cortos' },
    { key: 'gcs.region', dataType: 'string', category: 'gcs', description: 'Región de Google Cloud Storage' },
    { key: 's3.endpoint_url', dataType: 'string', category: 's3', description: 'URL de endpoint para almacenamiento compatible con S3' },
    { key: 's3.region', dataType: 'string', category: 's3', description: 'Región de almacenamiento S3' },
    { key: 's3.access_key_id', dataType: 'string', category: 's3', description: 'ID de clave de acceso S3', isSecret: true },
    { key: 's3.secret_access_key', dataType: 'string', category: 's3', description: 'Clave de acceso secreta S3', isSecret: true },
    { key: 'osm.static.endpoint', dataType: 'string', category: 'osm', description: 'Endpoint de mapas estáticos de OpenStreetMap' },
    { key: 'osm.static.zoom', dataType: 'integer', category: 'osm', description: 'Nivel de zoom para mapas estáticos de OpenStreetMap' },
    { key: 'osm.static.size', dataType: 'string', category: 'osm', description: 'Tamaño de imagen para mapas estáticos de OpenStreetMap' },
    { key: 'media.local_dir', dataType: 'string', category: 'media', description: 'Directorio local para almacenamiento de archivos multimedia' },
    { key: 'media.max_upload_bytes', dataType: 'integer', category: 'media', description: 'Tamaño máximo de archivo multimedia permitido en bytes' },
    { key: 'jwt.algorithm', dataType: 'string', category: 'jwt', description: 'Algoritmo de firma JWT' },
    { key: 'jwt.expire_minutes', dataType: 'integer', category: 'jwt', description: 'Tiempo de expiración de token JWT en minutos' },
    { key: 'jwt.expire_max_minutes', dataType: 'integer', category: 'jwt', description: 'Tiempo máximo de expiración de token JWT en minutos' },
    { key: 'pagination.default_page_limit', dataType: 'integer', category: 'pagination', description: 'Límite de página por defecto para consultas' },
    { key: 'pagination.max_page_limit', dataType: 'integer', category: 'pagination', description: 'Límite máximo de página permitido para consultas' },
    { key: 'legacy_firebird.enabled', dataType: 'boolean', category: 'legacy_firebird', description: 'Habilitar conexión a base de datos legacy Firebird' },
];
