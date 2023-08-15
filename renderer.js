document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const scrapeButton = document.getElementById('scrapeButton');
  const tagInput = document.getElementById('tagInput');
  const propertyInput = document.getElementById('propertyInput');
  const classNameInput = document.getElementById('classNameInput');
  const previewButton = document.getElementById('previewButton');
  const previewOutput = document.getElementById('previewOutput');

  scrapeButton.addEventListener('click', () => {
    const url = urlInput.value;
    const tag = tagInput.value;
    const property = propertyInput.value;
    const className = classNameInput.value;

    if (url && tag && property && className) {
      window.ipcRenderer.send('start-scraping', { tag, property, className, url });
    } else {
      alert('Please fill in all input fields.');
    }
  });

  previewButton.addEventListener('click', () => {
    const url = urlInput.value;
    const tag = tagInput.value;
    const property = propertyInput.value;
    const className = classNameInput.value;

    if (url && tag && property && className) {
      window.ipcRenderer.send('start-preview', { tag, property, className, url });
    } else {
      alert('Please fill in all input fields.');
    }
  });

  window.ipcRenderer.on('preview-data', (event, previewData) => {
    previewOutput.textContent = JSON.stringify(previewData, null, 2);
  });
});
