import { ClusterEntityType } from "@repo/api-contracts/erp";
import { IClusterStrategy } from "./types";
import { customerStrategy } from "../customer/customerStrategy";
import { itemStrategy } from "../item/itemStrategy";

export const clusterStrategies: Record<ClusterEntityType, IClusterStrategy> = {
    customer: customerStrategy,
    item: itemStrategy,
};

export const getClusterStrategy = (entityType: ClusterEntityType): IClusterStrategy => {
    return clusterStrategies[entityType] || customerStrategy;
};
