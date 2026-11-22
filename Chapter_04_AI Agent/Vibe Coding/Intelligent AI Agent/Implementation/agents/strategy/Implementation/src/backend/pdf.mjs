import PDFDocument from "pdfkit";

const ink = "#183153";
const muted = "#526174";
const accent = "#2f6feb";

function addTable(doc, table) {
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columns = table.headers.length;
  const colWidth = width / columns;
  const padding = 6;
  const renderRow = (values, header = false) => {
    const heights = values.map((value, index) => doc.heightOfString(String(value ?? ""), {
      width: colWidth - padding * 2,
      font: header ? "Helvetica-Bold" : "Helvetica",
      fontSize: header ? 8 : 8
    }));
    const rowHeight = Math.max(24, Math.max(...heights) + padding * 2);
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const top = doc.y;
    values.forEach((value, index) => {
      const x = left + index * colWidth;
      doc.rect(x, top, colWidth, rowHeight).fillAndStroke(header ? "#eaf0f8" : "#ffffff", "#d4dce6");
      doc.fillColor(ink).font(header ? "Helvetica-Bold" : "Helvetica").fontSize(8)
        .text(String(value ?? ""), x + padding, top + padding, {
          width: colWidth - padding * 2,
          height: rowHeight - padding * 2,
          ellipsis: true
        });
    });
    doc.y = top + rowHeight;
  };
  renderRow(table.headers, true);
  table.rows.forEach((row) => renderRow(row));
  doc.moveDown(0.7);
}

function addBullets(doc, bullets = []) {
  bullets.forEach((bullet) => {
    doc.font("Helvetica").fontSize(9).fillColor("#273548")
      .text(`•  ${bullet}`, { indent: 10, hanging: 3, paragraphGap: 3 });
  });
}

export function createStrategyPdf(strategy) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 54, right: 46, bottom: 56, left: 46 }, bufferPages: true });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.font("Helvetica-Bold").fontSize(18).fillColor(ink).text(strategy.header.title);
    doc.moveDown(0.6);
    addTable(doc, {
      headers: ["Field", "Value"],
      rows: [
        ["Version", strategy.header.version],
        ["Date", strategy.header.date],
        ["Author", strategy.header.author],
        ["Reviewers", strategy.header.reviewers.join(", ")],
        ["Related documents", strategy.header.relatedDocuments.join("; ") || "To be confirmed"]
      ]
    });

    strategy.sections.forEach((section) => {
      doc.font("Helvetica-Bold").fontSize(12).fillColor(accent)
        .text(section.title, { paragraphGap: 5, keepWithNext: true });
      if (section.paragraphs) {
        section.paragraphs.forEach((paragraph) => {
          doc.font("Helvetica").fontSize(9).fillColor("#273548")
            .text(paragraph, { paragraphGap: 4, lineGap: 2 });
        });
      }
      if (section.bullets) addBullets(doc, section.bullets);
      if (section.table) addTable(doc, section.table);
      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text(subsection.title, { paragraphGap: 3, keepWithNext: true });
          addBullets(doc, subsection.bullets);
        });
      }
      doc.moveDown(0.5);
    });
    const range = doc.bufferedPageRange();
    for (let page = range.start; page < range.start + range.count; page += 1) {
      doc.switchToPage(page);
      doc.font("Helvetica").fontSize(8).fillColor(muted)
        .text("Test Strategy | Draft for review", 46, doc.page.height - 34, { width: 300, lineBreak: false });
      doc.text(`Page ${page + 1}`, doc.page.width - 92, doc.page.height - 34, { width: 46, align: "right", lineBreak: false });
    }
    doc.end();
  });
}
