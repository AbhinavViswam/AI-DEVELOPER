import { generateResult } from "../middleware/ai.middleware.js";

export const getResult = async (req, res) => {
  const { prompt } = req.query;
  const result = await generateResult(prompt);
  res.send(result);
};
