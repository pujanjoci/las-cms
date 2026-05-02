/**
 * Determines the routing path for a proposal based on its sanctioned limit and the available chain stages.
 * 
 * Logic:
 * Filter stages by amount - from approval_stages, select only stages where:
 * - amount_min <= proposal.amount
 * - amount_max >= proposal.amount OR amount_max IS NULL
 * 
 * @param proposal The proposal object containing amount and facility_type
 * @param stages All available stages for the selected chain
 */
export function determineRoutingPath(proposal: any, stages: any[]) {
  const proposalAmount = Number(proposal.amount);
  
  return stages
    .filter(stage => {
      const min = Number(stage.amount_min || 0);
      const max = stage.amount_max === null ? null : Number(stage.amount_max);
      
      return amount >= min && (max === null || amount <= max);
    })
    .sort((a, b) => a.stage_order - b.stage_order);
}
