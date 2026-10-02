// scripts/generateRoutes.mjs
import fs from 'fs';
import path from 'path';

const IGNORED_ROUTE_KEYS = ['login', 'refused', 'api', '_not-found', 'default'];

function getRoutes(dir, parentId = '', currentPath = '') {
    const items = [];
    if (!fs.existsSync(dir)) return items;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            const isGroup = file.startsWith('(') && file.endsWith(')');
            const nextPath = isGroup ? currentPath : `${currentPath}/${file}`;
            const currentId = parentId ? `${parentId}/${file}` : file;
            const uniqueKey = file.replace(/[()]/g, '').toLowerCase();
            if (IGNORED_ROUTE_KEYS.includes(uniqueKey)) return;
            // REGLA DE ORO: Si entramos en '(home)', reseteamos el parentId a vacío
            // para que sus hijos directos (users, products, etc.) sean la RAÍZ del Sidebar.
            if (file === '(home)') {
                items.push(...getRoutes(filePath, '', currentPath));
                return;
            }
            if (fs.existsSync(path.join(filePath, 'page.tsx'))) {
                items.push({
                    id: currentId,
                    parentId: parentId || undefined,
                    path: nextPath || '/',
                    routeKey: uniqueKey,
                });
            }
            items.push(...getRoutes(filePath, currentId, nextPath));
        }
    });
    return items;
}

function getTopLevelRoutes(dir) {
    const items = [];
    if (!fs.existsSync(dir)) return items;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            const uniqueKey = file.replace(/[()]/g, '').toLowerCase();
            if (IGNORED_ROUTE_KEYS.includes(uniqueKey) || uniqueKey === 'home') return;

            if (fs.existsSync(path.join(filePath, 'page.tsx'))) {
                items.push({
                    id: file,
                    path: `/${file}`,
                    routeKey: uniqueKey,
                });
            }
        }
    });
    return items;
}

const allRoutes = getRoutes('src/app');
const firstLevelRoutes = getTopLevelRoutes('src/app/(home)');

const content = `// ESTE ARCHIVO ES GENERADO AUTOMÁTICAMENTE. NO EDITAR.
export const ROUTES = ${JSON.stringify(allRoutes, null, 2)};
export const FIRST_LEVEL_ROUTES = ${JSON.stringify(firstLevelRoutes, null, 2)};
`;

fs.writeFileSync('src/app/lib/routes/generated-routes.ts', content);
console.log('✅ Rutas generadas exitosamente en src/app/lib/routes/generated-routes.ts');
