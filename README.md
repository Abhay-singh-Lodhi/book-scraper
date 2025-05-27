# 📚 Book Scraper using Node.js

This is a Node.js web scraping project that extracts detailed information about books listed on [Books to Scrape](https://books.toscrape.com/), an online bookstore meant for practicing web scraping. The script collects data like title, price, availability, rating, product info, and description, then exports it into CSV, Excel, and a summary report.

---

## 🚀 Features

- Scrapes **book details** from all categories
- Extracts key information:
  - Title
  - Price
  - Availability
  - Rating (converted to numeric)
  - Product description
  - Image URL
  - UPC, Product Type, Tax, and Number of Reviews
- Outputs:
  - `books.csv` – Cleaned data in CSV format
  - `books.xlsx` – Data in Excel format
  - `summary.txt` – Summary report (total books + average rating)

---

## 🛠️ Technologies Used

- [Node.js](https://nodejs.org/)
- [`request`](https://www.npmjs.com/package/request) – HTTP client for making requests
- [`cheerio`](https://www.npmjs.com/package/cheerio) – jQuery-like HTML parser
- [`xlsx`](https://www.npmjs.com/package/xlsx) – For Excel file creation
- `fs` – Built-in Node.js module for file handling


