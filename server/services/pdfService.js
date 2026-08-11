import pdfParse from "pdf-parse";

export const extractTextFromPdf = async (fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw new Error("Failed to read the content of the PDF file.");
  }
};
