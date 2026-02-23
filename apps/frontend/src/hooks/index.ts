// Starknet contract interaction hooks — barrel export
export { useUsdtBalance, useMbtcBalance, useUsdtAllowance } from './useContractBalance';
export {
  useDCAUserBalance,
  useDCAPlan,
  useDCAUserPlanCount,
  useDCAPlanCount,
  useDCAIsPaused,
} from './useDCAContract';
export {
  useDeposit,
  useWithdraw,
  useCreatePlan,
  useCancelPlan,
  useApproveUsdt,
} from './useDCAWrite';
export {
  formatTokenAmount,
  parseTokenAmount,
  felt252ToString,
  truncateAddress,
  planStatusLabel,
} from './useStarknetHelpers';
export { useStarknetConnect } from './useStarknetConnect';
