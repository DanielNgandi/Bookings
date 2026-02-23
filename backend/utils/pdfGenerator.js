import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// ===== MONEY FORMATTER =====
const money = (amt) =>
  `US$${Number(amt || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ===== DATE FORMATTER =====
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

const shortDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
};

// ===== NIGHTS CALCULATOR =====
const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
};

// ================= INVOICE =================
export const generateInvoice = (res, booking) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${booking.invoice?.invoiceNumber || booking.id}.pdf`
  );

  doc.pipe(res);

  // ===== SAFE LOGO =====
  try {
    const logoPath = path.join(process.cwd(), "assets", "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 90 });
    }
  } catch (err) {
    console.log("Logo skipped");
  }

  // ===== HEADER =====
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("BIG FIVE TOURS & SAFARIS LTD", 40, 100)
    .font("Helvetica")
    .fontSize(10)
    .text("P.O BOX 10367 00400,", 40)
    .text("WESTLANDS, BROOKSIDE - NAIROBI, KENYA", 40);

  // ===== TITLE =====
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("PROFORMA INVOICE", 350, 40, { align: "right" });

  // ===== STATUS =====
  const statusColor =
    booking.status === "PAID"
      ? "#16a34a"
      : booking.status === "CANCELLED"
      ? "#dc2626"
      : "#f59e0b";

  doc
    .roundedRect(350, 70, 120, 18, 4)
    .fillColor(statusColor)
    .fill()
    .fillColor("white")
    .fontSize(9)
    .text(booking.status || "PENDING", 350, 75, {
      width: 120,
      align: "center",
    });

  doc.fillColor("black");

  // ===== META =====
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`INVOICE NUMBER: ${booking.invoice?.invoiceNumber || "-"}`, 350, 100)
    .text(`INVOICE DATE: ${formatDatePretty(new Date())}`, 350)
    .text(
      `LAST DATE OF PAYMENT: ${
        booking.lastPaymentDate
          ? formatDatePretty(booking.lastPaymentDate)
          : "-"
      }`,
      350
    );

  // ===== BILL TO =====
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("BILLED TO:", 40, 160)
    .font("Helvetica")
    .fontSize(10)
    .text(booking.client?.name || "-", 40)
    .text(booking.client?.company || "", 40)
    .text(booking.client?.email || "", 40);

  // ===== NIGHTS INFO (🔥 NEW) =====
  const nights = getNights(booking.checkIn, booking.checkOut);

  doc
    .fontSize(10)
    .text(`Stay Duration: ${nights} Night(s)`, 40, 210)
    .text(`Ref: ${booking.reference || "DB BFK"}`, 300, 210);

  // ===== TABLE =====
  let tableTop = 250;

  const drawTableHeader = (y) => {
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Date", 40, y);
    doc.text("Service Detail", 120, y);
    doc.text("# Pax", 300, y);
    doc.text("Cost P.P.", 360, y);
    doc.text("Amount US$", 460, y);
    doc.moveTo(40, y + 15).lineTo(550, y + 15).stroke();
  };

  drawTableHeader(tableTop);

  doc.font("Helvetica").fontSize(10);

  let y = tableTop + 25;
  let total = 0;

  const items = booking.items || [];

  if (items.length > 0) {
    items.forEach((item) => {
      if (y > 720) {
        doc.addPage();
        drawTableHeader(40);
        y = 65;
      }

      doc.text(shortDate(item.date), 40, y);
      doc.text(item.service || "-", 120, y, { width: 170 });
      doc.text(String(item.pax || 0), 300, y);
      doc.text(money(item.costPP), 360, y);
      doc.text(money(item.amount), 460, y);

      total += Number(item.amount || 0);
      y += 20;
    });
  }

  // ===== TOTAL =====
  const totalY = y + 30;

  doc.moveTo(300, totalY).lineTo(550, totalY).stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Total", 360, totalY + 10)
    .text(money(total), 460, totalY + 10);

  // ===== FOOTER =====
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "Thank you for your business with Big Five Tours & Safaris Ltd.",
      40,
      760,
      { align: "center" }
    );

  doc.end();
};

// ================= VOUCHER =================
export const generateVoucher = (res, booking) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=voucher-${booking.id}.pdf`
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  const nights = getNights(booking.checkIn, booking.checkOut);
  const reference = booking.reference || "084901";

  
  try {
    
    const logoPath = path.join(process.cwd(), "assets", "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 90 });
    }
  } catch (err) {
    doc.fontSize(18).font("Helvetica-Bold").text("Big Five", 50, 30);
  }

  // Company Name (right aligned)
  doc.fontSize(14).font("Helvetica-Bold")
    .text("TOURS & SAFARIS LTD.", 200, 35, { align: "right", width: 350 });

  // Address line 1
  doc.fontSize(9).font("Helvetica")
    .text("Rhapta Road, Westlands, P.O. Box 10367-00400, Nairobi - Kenya", 200, 55, { align: "right", width: 350 });

  // Telephone line
  doc.fontSize(9)
    .text("Telephone: 254-20-4450548, 4450549, 4450681, Telefax: 254-20-4450680 Cell: +254", 200, 70, { align: "right", width: 350 });

  // Email line
  doc.fontSize(9)
    .text("E-mail: bigfive@bigfiveafrica.com & bigfive@kenyaweb.com", 200, 85, { align: "right", width: 350 });

  // Website line
  doc.fontSize(9)
    .text("Website: www.bigfiveafrica.com / www.facebook.com/bigfiveafrica", 200, 100, { align: "right", width: 350 });

  // ===== RIGHT HEADER with reference =====
  doc.fontSize(10).font("Helvetica");
  doc.text(`DUFF PENNIE \\=${reference}`, 400, 120, { align: "right" });

  // ===== TITLE =====
  doc.moveDown(3);
  doc.fontSize(18).font("Helvetica-Bold").text("HOTEL VOUCHER", 50, 140);

  // ===== VOUCHER DETAILS TABLE =====
  const startY = 180;
  const col1X = 70;
  const col2X = 200;
  const lineHeight = 25;

  // Draw a light border around the details
  doc.rect(50, startY - 10, 500, 160).stroke("#cccccc");

  // Guest Name
  doc.fontSize(11).font("Helvetica-Bold").text("GUEST NAME:", col1X, startY);
  doc.font("Helvetica").text(booking.client?.name?.toUpperCase() || "_________________________", col2X, startY);

  // Hotel Name
  doc.font("Helvetica-Bold").text("HOTEL:", col1X, startY + lineHeight);
  doc.font("Helvetica").text(booking.hotel?.name?.toUpperCase() || "_________________________", col2X, startY + lineHeight);

  // Room Type / Accommodation
  doc.font("Helvetica-Bold").text("ACCOMMODATION:", col1X, startY + (lineHeight * 2));
  doc.font("Helvetica").text(`${booking.rooms} ROOM(S)`, col2X, startY + (lineHeight * 2));

  // Check-in and Check-out
  doc.font("Helvetica-Bold").text("CHECK IN:", col1X, startY + (lineHeight * 3));
  doc.font("Helvetica").text(formatDatePretty(booking.checkIn), col2X, startY + (lineHeight * 3));

  doc.font("Helvetica-Bold").text("CHECK OUT:", col1X, startY + (lineHeight * 4));
  doc.font("Helvetica").text(formatDatePretty(booking.checkOut), col2X, startY + (lineHeight * 4));

  // Nights
  doc.font("Helvetica-Bold").text("NIGHTS:", col1X, startY + (lineHeight * 5));
  doc.font("Helvetica").text(`${nights} NIGHT(S)`, col2X, startY + (lineHeight * 5));

  // ===== MEAL PLAN / ADDITIONAL INFO =====
  doc.fontSize(10).font("Helvetica-Bold").text("MEAL PLAN / OBS:", 50, startY + 170);
  doc.font("Helvetica").text("_________________________", 150, startY + 170);

  // ===== SPECIAL REQUESTS / NOTES =====
  doc.fontSize(10).font("Helvetica-Bold").text("SPECIAL REQUESTS:", 50, startY + 200);
  doc.font("Helvetica").text(booking.notes || "_________________________", 150, startY + 200);

  // ===== FOOTER / TERMS =====
  doc.fontSize(9).font("Helvetica").text(
    "This voucher must be presented upon arrival. All rates are in US Dollars and include taxes.",
    50, 520,
    { align: "center", width: 500 }
  );

  doc.moveDown(0.5);
  doc.text(
    "Cancellation policy applies as per booking terms and conditions.",
    { align: "center", width: 500 }
  );

  // ===== BOTTOM REFERENCE =====
  doc.fontSize(8).text(
    `Voucher generated on: ${formatDatePretty(new Date())} | Ref: ${reference}`,
    50, 750,
    { align: "center", width: 500 }
  );

  doc.end();
};
// ================= RECEIPT =================
export const generateReceipt = (res, booking, payment, receipt) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${receipt?.receiptNumber || booking.id}.pdf`
  );

  doc.pipe(res);

  // ===== SAFE LOGO =====
  try {
    const logoPath = path.join(process.cwd(), "assets", "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 90 });
    }
  } catch (err) {
    console.log("Logo skipped");
  }

  // ===== HEADER =====
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("BIG FIVE TOURS & SAFARIS LTD", 40, 100)
    .font("Helvetica")
    .fontSize(10)
    .text("P.O BOX 10367 00400,", 40)
    .text("WESTLANDS, BROOKSIDE - NAIROBI, KENYA", 40);

  // ===== TITLE =====
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("OFFICIAL RECEIPT", 350, 40, { align: "right" });

  // ===== STATUS BADGE =====
  doc
    .roundedRect(350, 70, 140, 20, 4)
    .fillColor("#16a34a")
    .fill()
    .fillColor("white")
    .fontSize(9)
    .text("PAYMENT CONFIRMED", 350, 75, {
      width: 140,
      align: "center",
    });

  doc.fillColor("black");

  // ===== META =====
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`RECEIPT NUMBER: ${receipt?.receiptNumber || "-"}`, 350, 105)
    .text(`RECEIPT DATE: ${formatDatePretty(payment?.paymentDate)}`, 350)
    .text(`BOOKING REF: ${booking.reference || booking.id}`, 350);

  // ===== RECEIVED FROM =====
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("RECEIVED FROM:", 40, 160)
    .font("Helvetica")
    .fontSize(10)
    .text(booking.client?.name || "-", 40)
    .text(booking.client?.company || "", 40)
    .text(booking.client?.email || "", 40);

  // ===== PAYMENT DETAILS =====
  const detailsY = 230;

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("PAYMENT DETAILS:", 40, detailsY);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Booking ID: ${booking.id}`, 40, detailsY + 25)
    .text(`Amount Paid: ${money(payment?.amount)}`, 40, detailsY + 45)
    .text(`Payment Method: ${payment?.method}`, 40, detailsY + 65)
    .text(
      `Transaction ID: ${payment?.transactionId || "N/A"}`,
      40,
      detailsY + 85
    );

  // ===== HOTEL INFO (nice professional touch) =====
  doc
    .text(`Hotel: ${booking.hotel?.name || "-"}`, 300, detailsY + 25)
    .text(
      `Check-in: ${shortDate(booking.checkIn)}`,
      300,
      detailsY + 45
    )
    .text(
      `Check-out: ${shortDate(booking.checkOut)}`,
      300,
      detailsY + 65
    );

  // ===== FOOTER =====
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This receipt confirms full payment for the above booking.",
      40,
      760,
      { align: "center", width: 500 }
    );

  doc.end();
};