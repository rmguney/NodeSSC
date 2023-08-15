// ide based version

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const port = 8000;
const app = express();
const url = "https://www.nytimes.com/live/2023/08/03/world/russia-ukraine-news";
const tag = "p";
const property = "class";
const className = "live-blog-post-content";
const urlProp = "href";

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') 
    .slice(0, length);
}

axios.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  }
})  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const articles = [];
    $(`${tag}[${property}*="${className}"]`).each(function () {
      const content = $(this).text().replace(/"/g, '""'); 
      const link = $(this).attr(urlProp); 
      if (link) {
        articles.push({ content, link: link.replace(/"/g, '""') }); 
      } else {
        articles.push({ content, link: "" });
      }
    });
    
    console.log(articles);

    const randomString = generateRandomString(8);

    const csvData = ['Content;Link'];
    articles.forEach(article => {
      csvData.push(`"${article.content}";"${article.link}"`);
    });

    const fileName = `articles-${randomString}.csv`; 
    const csvFilePath = path.join(__dirname, fileName);
    fs.writeFile(csvFilePath, csvData.join('\n'), (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
      } else {
        console.log(`Articles exported to ${fileName}`);
      }
    });
  })
  .catch(err => console.log(err));

app.listen(port, () => console.log(`with love from port ${port}`));