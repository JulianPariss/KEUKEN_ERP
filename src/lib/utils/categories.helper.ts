import { IFCategory } from "@repo/api-contracts/erp";


export const getSubtreeCategoryIds = (
    categories: IFCategory[],
    rootId: string
): Set<string> => {
    const validIds = new Set<string>();

    if (!rootId) return validIds;

    const childrenMap = new Map<string, string[]>();

    categories.forEach((cat) => {
        if (cat.parentId) {
            const children = childrenMap.get(cat.parentId) || [];
            children.push(cat.id);
            childrenMap.set(cat.parentId, children);
        }
    });

    const addSubtree = (currentId: string) => {
        if (validIds.has(currentId)) return;

        validIds.add(currentId);

        const children = childrenMap.get(currentId);
        if (children) {
            children.forEach(addSubtree);
        }
    };

    addSubtree(rootId);

    return validIds;
};

