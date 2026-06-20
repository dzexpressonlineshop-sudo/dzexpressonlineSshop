export default async function handler(req, res) {
  const SHEETDB_URL = process.env.SHEETDB_URL; // سيقرأ الرابط من إعدادات Vercel بأمان
  
  try {
    const response = await fetch(`${SHEETDB_URL}?sheet=Product`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}
