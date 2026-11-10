import { platformApi } from "@/lib/api/endpoints";

export const getCoinTransactions = platformApi.wallet.transactions;
export const listMerchandise = platformApi.wallet.merchandise;
export const redeemMerchandise = platformApi.wallet.redeem;
