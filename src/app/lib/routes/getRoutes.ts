import { FIRST_LEVEL_ROUTES, ROUTES } from './generated-routes';

export interface IAppRoute {
    id: string;
    parentId?: string;
    path: string;
    routeKey: string;
}

export function getAppRoutes(): IAppRoute[] {
    return ROUTES;
}

export function getFirstLevelRoutes(): IAppRoute[] {
    return FIRST_LEVEL_ROUTES;
}
