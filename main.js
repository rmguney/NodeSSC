const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    title: "NodeSSc",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

  ipcMain.on('start-scraping', async (event, { tag, property, className, url }) => {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const articles = [];
      const urlProp = "href";

      $(`${tag}[${property}*="${className}"]`).each(function () {
        const content = $(this).text().replace(/"/g, '""');
        const link = $(this).attr(urlProp);
        articles.push({ content, link: link ? link.replace(/"/g, '""') : "" });
      });

      const randomString = generateRandomString(8);

      const csvData = ['Content;Link'];
      articles.forEach(article => {
        csvData.push(`"${article.content}";"${article.link}"`);
      });

      dialog.showSaveDialog(mainWindow, {
        defaultPath: `articles-${randomString}.csv`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      }).then(({ filePath }) => {
        if (filePath) {
          fs.writeFile(filePath, csvData.join('\n'), (err) => {
            if (err) {
              console.error('Error writing to CSV file:', err);
            } else {
              console.log(`Articles exported to ${filePath}`);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  });

  ipcMain.on('start-preview', async (event, { tag, property, className, url }) => {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const previewData = [];
      const urlProp = "href";

      $(`${tag}[${property}*="${className}"]`).each(function () {
        const content = $(this).text();
        const link = $(this).attr(urlProp);
        previewData.push({ content, link: link ? link : "" });
      });

      event.sender.send('preview-data', previewData);
    } catch (error) {
      console.error('Error:', error);
    }
  });
});
