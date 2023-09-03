import mongoose from "mongoose";
export const Plan = mongoose.model(
  "Plan",
  {
    url: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9HqiBAwvgkx7ZZ7o0LXWdajPzBpOI7qmo8X6PfEVddpIW5MGD5x-E6FVNDhS1nS-e30s&usqp=CAU",
    },
    name: String,
    includes: {
      type: [String],
      default: [
        "Saúde Balanceada",
        "Energia Nutritiva",
        "Alimentação Equilibrada",
      ],
    },
  },
  "Plans"
);
