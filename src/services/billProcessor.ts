import { GoogleGenAI } from "@google/genai";
import Tesseract from 'tesseract.js';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });

export interface BillData {
  patientName?: string;
  hospitalName?: string;
  date?: string;
  lineItems?: Array<{
    item: string;
    quantity: number;
    cost: number;
  }>;
  totalAmount?: number;
  categoryBreakdown?: {
    consultation?: number;
    medicine?: number;
    tests?: number;
    procedures?: number;
    other?: number;
  };
  anomalies?: string[];
  confidence?: number;
}

interface ProcessingResult {
  success: boolean;
  data?: BillData;
  error?: string;
  confidence?: number;
}

export class BillProcessor {
  private model = "gemini-flash-latest";

  private cleanText(text: string): string {
    return text
      .replace(/[^\w\s\-\.\,\:\;\(\)\[\]\/\$\%\d]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private chunkText(text: string, chunkSize: number = 2000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private createProcessingPrompt(billText: string): string {
    return `
You are a medical bill processing expert. Analyze the following medical bill text and extract structured information.

BILL TEXT:
"""
${billText}
"""

Please extract and return ONLY a JSON object with the following structure:
{
  "patientName": "full patient name if found",
  "hospitalName": "hospital/clinic name if found", 
  "date": "date of service in YYYY-MM-DD format if found",
  "lineItems": [
    {
      "item": "description of item/service",
      "quantity": number,
      "cost": number
    }
  ],
  "totalAmount": number,
  "categoryBreakdown": {
    "consultation": number,
    "medicine": number,
    "tests": number,
    "procedures": number,
    "other": number
  },
  "anomalies": ["any inconsistencies or suspicious items found"]
}

IMPORTANT:
- Return ONLY valid JSON, no explanations
- Use 0 for missing numeric values
- Use empty string for missing text values
- Normalize costs to numbers (remove currency symbols)
- Categorize items appropriately
- Detect and flag any anomalies (duplicate charges, unusual amounts, etc.)
- If confident about the data extraction, include "confidence": 0.8-1.0
- If uncertain, include "confidence": 0.3-0.7
- If very uncertain, include "confidence": 0.1-0.3
`;
  }

  async processBillText(rawText: string): Promise<ProcessingResult> {
    try {
      // Step 1: Clean and prepare text
      const cleanedText = this.cleanText(rawText);
      
      if (!cleanedText || cleanedText.length < 50) {
        return {
          success: false,
          error: "Insufficient text data to process"
        };
      }

      // Step 2: Create prompt and process
      const prompt = this.createProcessingPrompt(cleanedText);
      
      const result = await ai.models.generateContent({
      model: this.model,
      contents: prompt
    });
    const text = result.text;

      // Step 3: Parse and validate JSON response
      try {
        const cleanJsonText = text.replace(/```json\n?|\n?```/g, '').trim();
        const structuredData = JSON.parse(cleanJsonText) as BillData;

        // Step 4: Validate and post-process data
        const validatedData = this.validateAndCleanData(structuredData);

        return {
          success: true,
          data: validatedData,
          confidence: structuredData.confidence || 0.7
        };
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        return {
          success: false,
          error: "Failed to parse AI response as valid JSON"
        };
      }
    } catch (error) {
      console.error('Bill processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown processing error"
      };
    }
  }

  private validateAndCleanData(data: BillData): BillData {
    return {
      patientName: data.patientName || "",
      hospitalName: data.hospitalName || "",
      date: this.normalizeDate(data.date),
      lineItems: (data.lineItems || []).map(item => ({
        item: item.item || "",
        quantity: Math.max(0, Number(item.quantity) || 1),
        cost: Math.max(0, Number(item.cost) || 0)
      })),
      totalAmount: Math.max(0, Number(data.totalAmount) || 0),
      categoryBreakdown: {
        consultation: Math.max(0, Number(data.categoryBreakdown?.consultation) || 0),
        medicine: Math.max(0, Number(data.categoryBreakdown?.medicine) || 0),
        tests: Math.max(0, Number(data.categoryBreakdown?.tests) || 0),
        procedures: Math.max(0, Number(data.categoryBreakdown?.procedures) || 0),
        other: Math.max(0, Number(data.categoryBreakdown?.other) || 0)
      },
      anomalies: Array.isArray(data.anomalies) ? data.anomalies : []
    };
  }

  private normalizeDate(dateString?: string): string {
    if (!dateString) return "";
    
    // Try to parse various date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    // If parsing fails, return original string
    return dateString;
  }

  async extractTextFromFile(file: File): Promise<string> {
    try {
      // Handle text files directly
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        return await file.text();
      }

      // Handle images with OCR
      if (file.type.startsWith('image/')) {
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => console.log(m),
        });
        return result.data.text;
      }

      // Handle PDFs (basic support - would need PDF.js for full support)
      if (file.type === 'application/pdf') {
        // For now, throw error - PDF support would require additional library
        throw new Error('PDF support coming soon. Please use text files or images for now.');
      }

      throw new Error(`Unsupported file type: ${file.type}. Please use text files, images, or paste manually.`);
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const billProcessor = new BillProcessor();
