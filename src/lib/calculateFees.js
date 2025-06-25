export const calculateAOAFee = (aoa, capital, baseSpice, fallbackAOA) => {
  if (typeof aoa === "number") return aoa;

  if (aoa.type === "same_as_base") {
    if (!fallbackAOA) return 0;
    return calculateAOAFee(fallbackAOA, capital, baseSpice);
  }

  switch (aoa.type) {
    case "percentage":
      const percentFee = capital * (aoa.rate ?? 0);
      if (aoa.min && percentFee < aoa.min) return aoa.min;
      if (aoa.max && percentFee > aoa.max) return aoa.max;
      return percentFee;

    case "slab":
      const slabs = Math.ceil(capital / (aoa.per ?? 1));
      const slabFee = (aoa.rate ?? 0) * slabs;
      return aoa.max ? Math.min(slabFee, aoa.max) : slabFee;

    case "conditional":
      return capital <= (aoa.condition ?? 0) ? aoa.below ?? 0 : aoa.above ?? 0;

    case "tiered":
      for (const tier of aoa.tiers ?? []) {
        if (tier.max && capital <= tier.max) return tier.rate;
        if (tier.above && capital > tier.above)
          return capital * (tier.rate ?? 0);
      }
      return 0;

    default:
      return 0;
  }
};
