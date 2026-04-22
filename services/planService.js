const Plan = require("../models/Plan");

const getPlan = async (userId) => {
  const plan = await Plan.findOne({ userId }).lean();
  if (!plan) return null;
  return {
    planName: plan.planName,
    speed: plan.speed,
    data: plan.dataLimit,
    billAmount: plan.billAmount || 0,
    status: plan.status,
  };
};

module.exports = {
  getPlan,
};
