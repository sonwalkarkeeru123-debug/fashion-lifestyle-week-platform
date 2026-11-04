import QRCode from "qrcode";

export async function generateQRDataUrl(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR generation failed:", err);
    throw err;
  }
}

export function buildVerificationUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/verify/${token}`;
}
