/**
 * Darwix AI Frontend Analyzer - Optimized
 * Captures website structure & sends to backend for AI analysis
 */

(function() {
  const ENDPOINT_URL = 'https://4e30d29a-fd0b-4c02-9d9c-35fa2ef631df-00-lhloidx6exa6.pike.replit.dev/'; // Replace with your actual backend endpoint

  async function captureDOM() {
    try {
      // Get HTML structure
      const htmlContent = document.documentElement.outerHTML;

      // Get CSS styles from stylesheets
      const cssContent = await Promise.all(
        Array.from(document.styleSheets).map(async (sheet) => {
          try {
            if (sheet.href) {
              // Fetch external stylesheets (bypass CORS issues)
              const response = await fetch(sheet.href);
              return await response.text();
            } else {
              // Get inline styles
              return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
            }
          } catch (e) {
            return ''; // Ignore blocked stylesheets
          }
        })
      );

      // Capture inline JavaScript
      const jsContent = Array.from(document.scripts)
        .filter(script => !script.src) // Only inline scripts
        .map(script => script.textContent)
        .join('\n');

      // Get external resources
      const externalResources = {
        scripts: Array.from(document.scripts)
          .filter(script => script.src)
          .map(script => script.src),
        stylesheets: Array.from(document.styleSheets)
          .filter(sheet => sheet.href)
          .map(sheet => sheet.href),
        images: Array.from(document.images).map(img => img.src),
      };

      return {
        html: htmlContent,
        css: cssContent.join('\n'), // Flatten CSS array
        js: jsContent,
        externalResources,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };
    } catch (error) {
      console.error('Darwix AI Analyzer Capture Error:', error);
      return null;
    }
  }

  async function sendData(data) {
    if (!data) return;

    try {
      const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Darwix AI Analysis Complete:', result);
    } catch (error) {
      console.error('Darwix AI Analyzer Error:', error);
    }
  }

  function init() {
    console.log('Darwix AI Frontend Analyzer initialized');
    captureDOM().then(sendData);
  }

  // Run when page is fully loaded
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
