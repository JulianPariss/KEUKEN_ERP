import { configureErpApiClient } from "@repo/erp-api-client";
import { isPathInRecoveryWhiteList } from "@/app/lib/constants/recoveryWhiteList";
import { getToken } from "@/lib/utils/token.helper";

configureErpApiClient({
    getToken,
    isPathInRecoveryWhiteList,
});
