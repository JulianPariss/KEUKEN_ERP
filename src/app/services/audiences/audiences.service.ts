import { customerClustersService } from "./customerClusters.service";
import { itemClustersService } from "./itemClusters.service";
import { clusterRulesService } from "./clusterRules.service";

export const audiencesService = {
    getCustomerClusters: customerClustersService.getAll,
    createCustomerCluster: customerClustersService.create,
    addCustomerMembers: customerClustersService.addMembers,
    getCustomerMembers: customerClustersService.getMembers,
    removeCustomerMember: customerClustersService.removeMember,
    deleteCustomerCluster: customerClustersService.delete,

    getItemClusters: itemClustersService.getAll,
    createItemCluster: itemClustersService.create,
    addItemMembers: itemClustersService.addMembers,
    getItemMembers: itemClustersService.getMembers,
    removeItemMember: itemClustersService.removeMember,
    deleteItemCluster: itemClustersService.delete,

    previewCustomerRules: clusterRulesService.previewCustomerRules,
    refreshCustomerCluster: clusterRulesService.refreshCustomerCluster,
    refreshItemCluster: clusterRulesService.refreshItemCluster,
    getCustomerClusterSummary: clusterRulesService.getCustomerClusterSummary,
    excludeCustomer: clusterRulesService.excludeCustomer,
    snapshotCustomerCluster: clusterRulesService.snapshotCustomerCluster,
};

export { customerClustersService, itemClustersService, clusterRulesService };
