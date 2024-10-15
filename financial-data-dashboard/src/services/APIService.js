const BASE_URL = "https://financialmodelingprep.com/api/v3";
const API_KEY = process.env.REACT_APP_FMP_API_KEY;

export const fetchStockSymbols = async () => {
  try {
    const response = await fetch(`${BASE_URL}/stock/list?apikey=${API_KEY}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stock symbols:", error);
    return [];
  }
};

export const fetchHistoricalPrices = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/historical-price-full/${symbol}?serietype=line&apikey=${API_KEY}`
    );
    const data = await response.json();
    return data.historical;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return [];
  }
};

export const fetchFinancialRatios = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/ratios/${symbol}?apikey=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching financial ratios:", error);
    return [];
  }
};
