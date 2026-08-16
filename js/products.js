// HULLOR — পণ্যের তালিকা
// নতুন প্রোডাক্ট যোগ করতে চাইলে এই অ্যারেতে একটি নতুন অবজেক্ট যোগ করুন।
// image ফাইলগুলো public/images/ ফোল্ডারে রাখতে হবে। এখন সবগুলো ডেমো ছবি ব্যবহার করা হয়েছে।

const CATEGORIES = [
  { id: "all", name: "সকল পণ্য" },
  { id: "shirt", name: "শার্ট" },
  { id: "polo", name: "পোলো টি-শার্ট" },
  { id: "dropshoulder", name: "ড্রপ শোল্ডার" },
  { id: "pants", name: "প্যান্ট" },
  { id: "combo", name: "কম্বো অফার" },
  { id: "punjabi", name: "পাঞ্জাবি" },
  { id: "jersey", name: "জার্সি" },
];

const PRODUCTS = [
  { featured: true, id: "shirt-01", code: "HL-SHT-01", name: "ক্লাসিক অক্সফোর্ড শার্ট", category: "shirt", fabric: "১০০% প্রিমিয়াম কটন", fit: "রেগুলার ফিট", care: "৩০°C ঠান্ডা পানিতে ধোয়া, আয়রন মিডিয়াম হিটে", price: 850, oldPrice: 1050, image: "/images/shirt1-demo.jpg", sizes: ["S", "M", "L", "XL"], desc: "প্রিমিয়াম কটন ফেব্রিকে তৈরি ফরমাল-ক্যাজুয়াল শার্ট, প্রতিদিনের ব্যবহারের জন্য আরামদায়ক।" },
  { id: "shirt-02", code: "HL-SHT-02", name: "লিনেন কেজুয়াল শার্ট", category: "shirt", fabric: "১০০% প্রিমিয়াম কটন", fit: "রেগুলার ফিট", care: "৩০°C ঠান্ডা পানিতে ধোয়া, আয়রন মিডিয়াম হিটে", price: 950, oldPrice: 1150, image: "/images/shirt2-demo.jpg", sizes: ["M", "L", "XL", "XXL"], desc: "গরমে আরাম দেবে এমন হালকা লিনেন কাপড়ের শার্ট।" },
  { id: "shirt-03", code: "HL-SHT-03", name: "চেক প্রিন্ট শার্ট", category: "shirt", fabric: "১০০% প্রিমিয়াম কটন", fit: "রেগুলার ফিট", care: "৩০°C ঠান্ডা পানিতে ধোয়া, আয়রন মিডিয়াম হিটে", price: 890, oldPrice: null, image: "/images/shirt3-demo.jpg", sizes: ["S", "M", "L", "XL"], desc: "ক্লাসিক চেক প্যাটার্নের কটন শার্ট, ক্যাজুয়াল লুকের জন্য পারফেক্ট।" },

  { featured: true, id: "polo-01", code: "HL-POLO-01", name: "প্রিমিয়াম পিকে পোলো", category: "polo", fabric: "কটন পিকে ফেব্রিক", fit: "স্লিম ফিট", care: "মেশিন ওয়াশ, ব্লিচ পরিহার করুন", price: 650, oldPrice: 800, image: "/images/polo1-demo.jpg", sizes: ["S", "M", "L", "XL"], desc: "১০০% কটন পিকে ফেব্রিক, স্মার্ট-ক্যাজুয়াল লুকের জন্য সেরা পছন্দ।" },
  { id: "polo-02", code: "HL-POLO-02", name: "স্লিম ফিট পোলো", category: "polo", fabric: "কটন পিকে ফেব্রিক", fit: "স্লিম ফিট", care: "মেশিন ওয়াশ, ব্লিচ পরিহার করুন", price: 700, oldPrice: null, image: "/images/polo2-demo.jpg", sizes: ["M", "L", "XL"], desc: "স্লিম ফিট কাটিং, দৈনন্দিন স্টাইলিশ লুকের জন্য।" },
  { id: "polo-03", code: "HL-POLO-03", name: "স্ট্রাইপড পোলো", category: "polo", fabric: "কটন পিকে ফেব্রিক", fit: "স্লিম ফিট", care: "মেশিন ওয়াশ, ব্লিচ পরিহার করুন", price: 680, oldPrice: 820, image: "/images/polo3-demo.jpg", sizes: ["S", "M", "L", "XL", "XXL"], desc: "ক্লাসিক স্ট্রাইপ ডিজাইনের নরম কটন পোলো টি-শার্ট।" },

  { featured: true, id: "ds-01", code: "HL-DS-01", name: "ওভারসাইজড ড্রপ শোল্ডার", category: "dropshoulder", fabric: "হেভি কটন জার্সি নিট", fit: "ওভারসাইজড / রিল্যাক্সড ফিট", care: "ঠান্ডা পানিতে ধোয়া, উল্টে শুকান", price: 750, oldPrice: 900, image: "/images/dropshoulder1-demo.jpg", sizes: ["M", "L", "XL"], desc: "ট্রেন্ডি ওভারসাইজড ফিট, স্ট্রিটওয়্যার লুকের জন্য পারফেক্ট।" },
  { id: "ds-02", code: "HL-DS-02", name: "মিনিমাল ড্রপ শোল্ডার টি", category: "dropshoulder", fabric: "হেভি কটন জার্সি নিট", fit: "ওভারসাইজড / রিল্যাক্সড ফিট", care: "ঠান্ডা পানিতে ধোয়া, উল্টে শুকান", price: 720, oldPrice: null, image: "/images/dropshoulder2-demo.jpg", sizes: ["S", "M", "L", "XL"], desc: "সাদামাটা ডিজাইন, প্রতিদিনের আরামদায়ক পরিধানের জন্য।" },

  { featured: true, id: "pants-01", code: "HL-PANT-01", name: "স্লিম ফিট গ্যাবার্ডিন প্যান্ট", category: "pants", fabric: "গ্যাবার্ডিন / টুইল কটন", fit: "স্লিম-স্ট্রেইট ফিট", care: "ড্রাই ওয়াশ প্রাধান্য দিন", price: 950, oldPrice: 1150, image: "/images/pants1-demo.jpg", sizes: ["30", "32", "34", "36"], desc: "উন্নতমানের গ্যাবার্ডিন কাপড়ে তৈরি, অফিস ও ক্যাজুয়াল উভয় ব্যবহারের উপযোগী।" },
  { id: "pants-02", code: "HL-PANT-02", name: "কার্গো প্যান্ট", category: "pants", fabric: "গ্যাবার্ডিন / টুইল কটন", fit: "স্লিম-স্ট্রেইট ফিট", care: "ড্রাই ওয়াশ প্রাধান্য দিন", price: 1050, oldPrice: null, image: "/images/pants2-demo.jpg", sizes: ["30", "32", "34", "36", "38"], desc: "মাল্টিপল পকেট সহ টেকসই কার্গো প্যান্ট।" },

  { featured: true, id: "SHCMWH", code: "SHCMWH", name: "শার্ট + প্যান্ট কম্বো", category: "combo", fabric: "কম্বো অনুযায়ী মিশ্র ফেব্রিক", fit: "রেগুলার ফিট", care: "প্রতিটি আইটেমের কেয়ার লেবেল অনুসরণ করুন", price: 1000, oldPrice: 1500, image: "/images/SHCMWH", sizes: ["M", "L", "XL"], desc: "একটি শার্ট এবং একটি প্যান্টের বিশেষ কম্বো অফার, একসাথে বাঁচান।" },
  { id: "SHCMNVB", code: "SHCMNVB", name: "পোলো + ড্রপ শোল্ডার কম্বো", category: "combo", fabric: "কম্বো অনুযায়ী মিশ্র ফেব্রিক", fit: "রেগুলার ফিট", care: "প্রতিটি আইটেমের কেয়ার লেবেল অনুসরণ করুন", price: 1000, oldPrice: 1500, image: "/images/SHCMNVB", sizes: ["M", "L", "XL"], desc: "দুটি ট্রেন্ডি আইটেম একসাথে, সাশ্রয়ী মূল্যে।" },

  { featured: true, id: "punjabi-01", code: "HL-PUNJ-01", name: "সেমি-সিল্ক পাঞ্জাবি", category: "punjabi", fabric: "সেমি-সিল্ক / প্রিমিয়াম কটন", fit: "রেগুলার ফিট", care: "ড্রাই ওয়াশ প্রাধান্য দিন, হালকা আয়রন", price: 1200, oldPrice: 1500, image: "/images/punjabi1-demo.jpg", sizes: ["S", "M", "L", "XL"], desc: "উৎসব ও বিশেষ অনুষ্ঠানের জন্য এলিগেন্ট সেমি-সিল্ক পাঞ্জাবি।" },
  { featured: true, id: "punjabi-02", code: "HL-PUNJ-02", name: "কটন এমব্রয়ডারি পাঞ্জাবি", category: "punjabi", fabric: "সেমি-সিল্ক / প্রিমিয়াম কটন", fit: "রেগুলার ফিট", care: "ড্রাই ওয়াশ প্রাধান্য দিন, হালকা আয়রন", price: 1350, oldPrice: 1600, image: "/images/punjabi2-demo.jpg", sizes: ["M", "L", "XL", "XXL"], desc: "হাতের কাজের নকশাযুক্ত প্রিমিয়াম কটন পাঞ্জাবি।" },
  { id: "punjabi-03", code: "HL-PUNJ-03", name: "সলিড কালার পাঞ্জাবি", category: "punjabi", fabric: "সেমি-সিল্ক / প্রিমিয়াম কটন", fit: "রেগুলার ফিট", care: "ড্রাই ওয়াশ প্রাধান্য দিন, হালকা আয়রন", price: 1100, oldPrice: null, image: "/images/punjabi3-demo.jpg", sizes: ["S", "M", "L", "XL"], desc: "সাধারণ ব্যবহার ও নামাজের জন্য আরামদায়ক সলিড কালার পাঞ্জাবি।" },

  { featured: true, id: "jersey-01", code: "HL-JER-01", name: "ক্লাব এডিশন জার্সি", category: "jersey", fabric: "স্পোর্টস-গ্রেড পলিয়েস্টার (ঘাম শোষণক্ষম)", fit: "অ্যাথলেটিক ফিট", care: "ঠান্ডা পানিতে ধোয়া, ব্লিচ পরিহার করুন", price: 900, oldPrice: 1100, image: "/images/jersey1-demo.jpg", sizes: ["S", "M", "L", "XL"], desc: "স্পোর্টস-গ্রেড ফেব্রিকে তৈরি ক্লাব এডিশন জার্সি, ঘাম শোষণে সক্ষম।" },
  { id: "jersey-02", code: "HL-JER-02", name: "ন্যাশনাল টিম জার্সি", category: "jersey", fabric: "স্পোর্টস-গ্রেড পলিয়েস্টার (ঘাম শোষণক্ষম)", fit: "অ্যাথলেটিক ফিট", care: "ঠান্ডা পানিতে ধোয়া, ব্লিচ পরিহার করুন", price: 950, oldPrice: null, image: "/images/jersey2-demo.jpg", sizes: ["S", "M", "L", "XL", "XXL"], desc: "সাপোর্টারদের জন্য বিশেষভাবে ডিজাইন করা ন্যাশনাল টিম জার্সি।" },
];
