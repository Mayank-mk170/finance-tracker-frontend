
import api from "./api";

// Get all transactions
export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

// Get transaction summary
export const getTransactionSummary = async () => {
  const response = await api.get("/transactions/summary");
  return response.data;
};

// Get monthly trends
export const getMonthlyTrends = async (months = 6) => {
  const response = await api.get("/transactions/monthly-trends", {
    params: { months },
  });
  return response.data;
};

// Get category summary
export const getCategorySummary = async () => {
  const response = await api.get("/transactions/category-summary");
  return response.data;
};

// Get monthly summary

export const getMonthlyCategorySummary = async (month) => {
  const response = await api.get(
    "/transactions/category-summary/monthly",
    {
      params: { month },
    }
  );

  return response.data;
};


// Get budget summary
export const getBudgetSummary = async (month) => {
  const response = await api.get("/budgets/summary", {
    params: { month },
  });
  return response.data;
};
