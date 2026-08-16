/**
 * HULLOR — অর্ডার সংগ্রহ Apps Script
 * ---------------------------------------------------------
 * এই স্ক্রিপ্টটি একটি Google Sheet-এ যুক্ত করতে হবে (Extensions > Apps Script)।
 * ওয়েবসাইট থেকে আসা প্রতিটি অর্ডার এই শিটে একটি নতুন সারি (row) হিসেবে যোগ হবে।
 *
 * সেটআপ ধাপ README.md ফাইলে বিস্তারিত দেওয়া আছে।
 */

const SHEET_NAME = "Orders";

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),                 // টাইমস্ট্যাম্প
      data.orderId || "",         // অর্ডার আইডি
      data.name || "",            // কাস্টমারের নাম
      data.phone || "",           // মোবাইল নম্বর
      data.district || "",        // জেলা
      data.address || "",         // সম্পূর্ণ ঠিকানা
      data.note || "",            // অর্ডার নোট
      data.products || "",        // প্রোডাক্ট তালিকা
      data.total || 0,            // সর্বমোট টাকা
      "ক্যাশ অন ডেলিভারি",         // পেমেন্ট পদ্ধতি
      "নতুন",                     // অর্ডার স্ট্যাটাস (ম্যানুয়ালি আপডেট করুন: নতুন / প্রসেসিং / ডেলিভারড / বাতিল)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "HULLOR Order API চালু আছে।" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "টাইমস্ট্যাম্প",
      "অর্ডার আইডি",
      "নাম",
      "মোবাইল",
      "জেলা",
      "সম্পূর্ণ ঠিকানা",
      "অর্ডার নোট",
      "পণ্য তালিকা",
      "সর্বমোট (৳)",
      "পেমেন্ট",
      "স্ট্যাটাস",
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 11).setFontWeight("bold");
    sheet.autoResizeColumns(1, 11);
  }
  return sheet;
}
