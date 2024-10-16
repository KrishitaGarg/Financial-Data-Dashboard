const BASE_URL = "https://financialmodelingprep.com/api/v3";
const API_KEY = process.env.REACT_APP_FMP_API_KEY; // Ensure the .env file contains the correct key

// Fetch stock symbols
export const fetchStockSymbols = async () => {
  try {
    const response = await fetch(`${BASE_URL}/stock/list?apikey=${API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch stock symbols");
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching stock symbols:", error.message);
    return [];
  }
};

// Fetch historical prices for a given stock symbol
export const fetchHistoricalPrices = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/historical-price-full/${symbol}?serietype=line&apikey=${API_KEY}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch historical prices for ${symbol}`);
    const data = await response.json();
    return data.historical || [];
  } catch (error) {
    console.error("Error fetching historical prices:", error.message);
    return [];
  }
};

// Fetch Financial Ratios data for a given stock symbol
export const fetchFinancialRatios = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/ratios/${symbol}?apikey=${API_KEY}`
    );
    if (!response.ok) throw new Error(`Failed to fetch Financial Ratios data for ${symbol}`);
    const FRData = await response.json();
    return FRData[0] || {}; // Return the first element if it exists
  } catch (error) {
    console.error("Error fetching Financial Ratios data:", error.message);
    return {};
  }
};

// Fetch KPI data for a given stock symbol
export const fetchKPIData = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/key-metrics/${symbol}?apikey=${API_KEY}`
    );
    if (!response.ok) throw new Error(`Failed to fetch KPI data for ${symbol}`);
    const kpiData = await response.json();
    return kpiData[0] || {}; // Return the first element if it exists
  } catch (error) {
    console.error("Error fetching KPI data:", error.message);
    return {};
  }
};