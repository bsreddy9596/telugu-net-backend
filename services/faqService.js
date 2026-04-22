const Faq = require("../models/Faq");

const getFaqs = async () => {
  const faqs = await Faq.find({ isActive: true }).limit(5).lean();
  return faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer,
  }));
};

module.exports = {
  getFaqs,
};
