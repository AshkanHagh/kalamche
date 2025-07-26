import { IFrTokenPlanInsertForm } from "src/drizzle/schemas";

export const FrTokenPlanDatasets: IFrTokenPlanInsertForm[] = [
  {
    name: "Starter Pack",
    description:
      "Perfect for small businesses or beginners testing the waters. Get 300 clicks to promote your products and see results without breaking the bank.",
    tokens: 300,
    totalPrice: 1500,
    pricePerToken: 5,
  },
  {
    name: "Growth Pack",
    description:
      "Scale up your reach with 1000 clicks. Ideal for growing businesses looking to boost product visibility and drive steady traffic.",
    tokens: 1000,
    totalPrice: 4500,
    pricePerToken: 4,
  },
  {
    name: "Pro Pack",
    description:
      "Dominate the market with 5000 clicks. Designed for high-volume advertisers who want maximum exposure at the best value per click.",
    tokens: 5000,
    totalPrice: 20000,
    pricePerToken: 4,
  },
];
