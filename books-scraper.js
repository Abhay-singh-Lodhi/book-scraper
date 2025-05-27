const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const XLSX = require("xlsx");

const URL = "https://books.toscrape.com/";
const booksArray = [];

request(URL, (err, res, html) => {
  if (err) {
    console.log(err);
  } else {
    extractDetails(html);
  }
});

function extractDetails(html) {
  const $ = cheerio.load(html);
  const products = $("li ul li a");

  for (let i = 0; i < products.length; i++) {
    let link = $(products[i]).attr("href");
    let fullLink = URL + link;
    allBooksLink(fullLink);
  }
}

function allBooksLink(url) {
  request(url, (err, res, html) => {
    if (err) {
      console.log(err);
    } else {
      extractBooks(html);
    }
  });

  function extractBooks(html) {
    const $ = cheerio.load(html);
    const books = $("ol.row > li");

    for (let i = 0; i < books.length; i++) {
      let bookLink = $(books[i]).find("a").attr("href");
      let bookFullLink =
        URL + "catalogue/" + bookLink.replace(/^(\.\.\/)+/, "");
      booksData(bookFullLink);
    }
  }
}

let totalExpected = 0;
let processedCount = 0;

function booksData(bookFullLink) {
  totalExpected++;

  request(bookFullLink, (err, res, html) => {
    if (err) {
      console.log(err);
    } else {
      const $ = cheerio.load(html);
      const info = $(".product_page");

      const imgsrc =
        URL +
        info
          .find(".thumbnail img")
          .attr("src")
          .replace(/^(\.\.\/)+/, "")
          .trim();
      const title = info.find("h1").text().trim();
      const price = info
        .find(".product_main .price_color")
        .text()
        .trim()
        .replace(/[^\d.]/g, "");
      const availability = info
        .find(".product_main .instock")
        .text()
        .trim()
        .replace(/\s+/g, " ");

      const ratingText =
        info.find(".star-rating").attr("class")?.split(" ")[1]?.toLowerCase() ||
        "zero";
      const wordToNumber = { one: 1, two: 2, three: 3, four: 4, five: 5 };
      const rating = wordToNumber[ratingText] || 0;

      const description =
        info
          .find("#product_description + p")
          .text()
          .trim()
          .replace(/\s+/g, " ") || "N/A";

      const product = info.find(".table tr");
      const productInfo = {};
      for (let i = 0; i < product.length; i++) {
        const row = $(product[i]);
        const key = row.find("th").text().trim().replace(/\s+/g, " ");
        const value =
          row.find("td").text().trim().replace(/\s+/g, " ") || "N/A";
        productInfo[key] = value;
      }

      const bookData = {
        Title: title,
        Price: price,
        Availability: availability,
        Rating: rating,
        Description: description,
        ImageURL: imgsrc,
        UPC: productInfo["UPC"] || "",
        ProductType: productInfo["Product Type"] || "",
        Tax: productInfo["Tax"] || "",
        NumberOfReviews: productInfo["Number of reviews"] || "",
      };

      booksArray.push(bookData);
      processedCount++;

      // When all books are scraped
      if (processedCount === totalExpected) {
        saveToCSVandExcel(booksArray);
      }
    }
  });
}

function saveToCSVandExcel(data) {
  // === CSV ===
  const headers = Object.keys(data[0]).join(",") + "\n";
  const rows = data
    .map((book) =>
      Object.values(book)
        .map((val) => `"${val}"`)
        .join(",")
    )
    .join("\n");

  fs.writeFileSync("books.csv", headers + rows);
  console.log("CSV file written successfully as books.csv ");

  // === Excel ===
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Books");

  XLSX.writeFile(workbook, "books.xlsx");
  console.log("Excel file written successfully as books.xlsx ");

  function saveSummary(data) {
  const totalBooks = data.length;
  const avgRating =
    data.reduce((sum, book) => sum + book.Rating, 0) / totalBooks;

  const summary = `Summary Report:
  Total Books Scraped: ${totalBooks}
  Average Rating: ${avgRating.toFixed(2)}

  This dataset contains book details including title, price, availability, rating, description, and product info.
  `;

  fs.writeFileSync('summary.txt', summary);
  console.log("Summary written to summary.txt");
}
saveSummary(booksArray);

}

