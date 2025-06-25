import stampDutyRates from "@/data/stampDutyRates.json";

export function getStampDuty(state, type) {
  return (stampDutyRates)[state]?.[type] || null;
}
