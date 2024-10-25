# Stock Market KPI Dashboard

This project is a **Custom Dashboard** designed to display key metrics of the stock market with **real-time data** using financial APIs and includes various **data visualizations** for stock prices. The dashboard is built using **React**, with **Chart.js**, **Financial Modeling Prep's API**, and **Finnhub API** to provide accurate financial data and user insights.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Technologies Used](#technologies-used)
- [License](#license)

## Features

- **Search and select** stock symbols using a styled input box.
- **Financial Ratios** and **Graphical representation** as key dashboard sections.
- **Real-time stock data** for symbols, prices, market capitalization, and other financial metrics.
- **Interactive charts** visualizing key stock information such as opening/closing prices.
- **Stock news section** providing the latest news articles (from the past three days) related to the selected stock symbol.
- **User-friendly interface** with support for both **dark** and **light** modes.
- **Responsive design**, optimized for desktop and mobile.

## Installation

To install and run this project locally, follow these steps:

1. **Clone the repository** :
   ```bash
   git clone https://github.com/KrishitaGarg/Financial-Data-Dashboard.git
   ```
2. **Navigate to the project directory** :
   ```bash
   cd financial-data-dashboard
   ```
3. **Install dependencies** :
   ```bash
   npm install
   ```
4. **Start the development server** :
   ```bash
   npm start
   ```
5. **View the app in the browser** :
   Navigate to `http://localhost:3000/` in your browser.

## Usage

1. **Login**: Start by logging into the application using the login page.
2. **Select a stock symbol**: Use the stock symbol search box to find and then select a stock.
3. **View key metrics**: The dashboard will display real-time data such as stock price, market capitalization, P/E ratio, and dividend yield.
4. **Interactive charting**: The dashboard provides charts showing stock performance (open, high, low, close prices) over time, with additional support for customized time frames.
5. **Read the latest news**: Access the news section to view the latest articles related to the selected stock.

## API Integration

This project uses two key APIs to fetch real-time stock market data:

1. **Financial Modeling Prep API**: Provides data on stock prices, financial ratios, market capitalization, and other key metrics.
2. **Finnhub API**: Used to retrieve live market data, real-time stock quotes, and stock-related news articles.

### API Key Configuration

To use these APIs, you need to configure your API keys. Add your API keys to a `.env` file:

```env
REACT_APP_FMP_API_KEY=your_fmp_api_key_here
REACT_APP_FINNHUB_API_KEY=your_finnhub_api_key_here
```

## Deployment

This project is deployed on **Vercel**. You can view the live dashboard at:

[Live Demo on Vercel](https://financial-data-dashboard.vercel.app/)

## Technologies Used

- **React.js**: Frontend library for building interactive user interfaces.
- **Chart.js**: Library used to create responsive and interactive data visualizations.
- **Material-UI**: For modern, responsive UI components.
- **Axios**: To fetch data from the financial APIs.
- **WebSockets**: For real-time data updates in stock prices and metrics.
- **Vercel**: For deployment and hosting.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.