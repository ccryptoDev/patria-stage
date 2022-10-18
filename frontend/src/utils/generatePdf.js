import { ServerStyleSheet } from "styled-components";
import { renderToString } from "react-dom/server";
import { generatePdfFromHtml, downloadPdf } from "../api/application";

export const generatePdf = async ({ component: Component, screenId }) => {
  const sheet = new ServerStyleSheet();
  const pagePlaceholder = renderToString(sheet.collectStyles(Component));
  const styles = sheet.getStyleTags();

  const html = `
    <!doctype html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Stately</title>
            <style type="text/css">
              body { margin: 0; padding: 0; font-size: 8px }

            </style>
            ${styles}
        </head>
        <body>
            ${pagePlaceholder}
        </body>
    </html>
    `;

  const response = await generatePdfFromHtml(html, screenId);
  if (!response.error || response.error === null) {
    return response.data.pdf;
  }
  return { error: { message: "Error on generating." } };
};

export const downloadRicPdf = (fileName) => {
  downloadPdf(fileName);
};
