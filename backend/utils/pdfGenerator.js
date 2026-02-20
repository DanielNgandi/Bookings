import PDFDocument from "pdfkit";
// ===== MONEY FORMATTER =====
const money = (amt) =>
  `US$${Number(amt || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ===== DATE FORMATTER (17TH FEBRUARY 2026 style) =====
const formatDatePretty = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
};

export const generateInvoice = (res, booking) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${booking.id}.pdf`
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  // ================= HEADER =================
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("BIG FIVE TOURS & SAFARIS LTD", { align: "center" });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("P.O BOX 10367 00400,", { align: "center" })
    .text("WESTLANDS, BROOKSIDE - NAIROBI, KENYA", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("PROFORMA INVOICE", { align: "center" });

  doc.moveDown(1.5);

  // ================= INVOICE META =================
  doc.fontSize(10).font("Helvetica");

  doc.text(`INVOICE NUMBER: ${booking.invoiceNumber || "—"}`);
  doc.text(
    `INVOICE DATE: ${formatDatePretty(
      booking.invoiceDate || new Date()
    )}`
  );
  doc.text(
    `LAST DATE OF PAYMENT: ${formatDatePretty(
      booking.lastPaymentDate
    )}`
  );

  doc.moveDown();

  // ================= BILLED TO =================
  doc.font("Helvetica-Bold").text("BILLED TO :");
  doc.font("Helvetica");

  doc.text(booking.client?.name || "—");
  if (booking.client?.address) {
    doc.text(booking.client.address);
  }

  doc.moveDown();

  // ================= REF LINE =================
  doc.fontSize(10).font("Helvetica-Bold");

  const refY = doc.y;

  doc.text(`Ref: ${booking.ref || "—"}`, 50, refY);
  doc.text(`Name: ${booking.client?.name || "—"}`, 200, refY);
  doc.text(
    `Invoice #: ${booking.invoiceNumber || booking.id}`,
    400,
    refY
  );

  doc.moveDown(2);

  // ================= TABLE HEADER =================
  const tableTop = doc.y;

  const colX = {
    date: 50,
    detail: 130,
    pax: 300,
    cost: 350,
    amount: 450,
  };

  doc.font("Helvetica-Bold").fontSize(10);

  doc.text("Date", colX.date, tableTop);
  doc.text("Service Detail", colX.detail, tableTop);
  doc.text("# Pax", colX.pax, tableTop);
  doc.text("Cost P.P.", colX.cost, tableTop);
  doc.text("Amount US$", colX.amount, tableTop);

  // underline
  doc
    .moveTo(50, tableTop + 12)
    .lineTo(550, tableTop + 12)
    .stroke();

  // ================= TABLE ROWS =================
  doc.font("Helvetica");

  let y = tableTop + 20;

  booking.services?.forEach((s) => {
    doc.text(s.date || "—", colX.date, y);
    doc.text(s.detail || "—", colX.detail, y);
    doc.text(String(s.pax || "—"), colX.pax, y);
    doc.text(money(s.costPP), colX.cost, y);
    doc.text(money(s.amount), colX.amount, y);
    y += 18;
  });

  // ================= TOTAL =================
  doc
    .moveTo(300, y + 5)
    .lineTo(550, y + 5)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(12);

  doc.text("Total", 350, y + 15);
  doc.text(money(booking.totalAmount), 450, y + 15);

  doc.moveDown(4);

  // ================= FOOTER =================
  doc.fontSize(10).font("Helvetica");

  doc.text("Deposit Payment", 50, doc.y);

  doc.end();
};
export const generateVoucher = (res, booking) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=voucher-${booking.id}.pdf`
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  // ===== HEADER =====
  doc
    .fontSize(22)
    .text("BIG FIVE BOOKINGS", { align: "center" })
    .moveDown(0.5);

  doc.fontSize(16).text("HOTEL VOUCHER", { align: "center" }).moveDown();

  // ===== DETAILS =====
  doc.fontSize(12);
  doc.text(`Guest: ${booking.client?.name}`);
  doc.text(`Hotel: ${booking.hotel?.name}`);
  doc.text(`Check-in: ${booking.checkIn.toISOString().slice(0, 10)}`);
  doc.text(`Check-out: ${booking.checkOut.toISOString().slice(0, 10)}`);
  doc.text(`Rooms: ${booking.rooms}`);

  doc.moveDown(2);
  doc
    .fontSize(12)
    .text("Please present this voucher upon arrival.", {
      align: "center",
    });

  doc.end();
};