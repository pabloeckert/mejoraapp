/**
 * PDF Export — Genera PDF del resultado del diagnóstico
 *
 * Usa jsPDF (dinámico) para generar un PDF con:
 * - Logo/header de Mejora Continua
 * - Perfil resultante con color
 * - Puntaje
 * - Síntomas
 * - Recomendación
 * - QR/link a WhatsApp
 */

import { PERFILES } from "@/data/diagnosticData";

interface DiagnosticExportData {
  perfil: string;
  puntaje: number;
  respuestas: Record<number, number>;
  fecha: string;
  userName?: string;
}

export async function exportDiagnosticPDF(data: DiagnosticExportData): Promise<void> {
  // Dynamic import to avoid bloating the bundle
  const { default: jsPDF } = await import("jspdf");

  const perfilData = PERFILES[data.perfil];
  if (!perfilData) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFillColor(73, 95, 147); // mc-dark-blue
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Mejora Continua", margin, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Diagnóstico Estratégico de Negocio", margin, 26);

  doc.setFontSize(8);
  doc.text(`Fecha: ${data.fecha}`, margin, 33);
  if (data.userName) {
    doc.text(`Nombre: ${data.userName}`, pageWidth - margin, 33, { align: "right" });
  }

  y = 55;

  // Profile result
  const colorHex = perfilData.color;
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, y - 5, contentWidth, 22, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(perfilData.tagline, pageWidth / 2, y + 5, { align: "center", maxWidth: contentWidth - 10 });

  y += 28;

  // Score
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Puntaje: ${data.puntaje}/40`, margin, y);
  y += 10;

  // Description
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(perfilData.desc, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 10;

  // Mirror section
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(73, 95, 147);
  doc.text("LO QUE TE DIJISTE ESTA SEMANA", margin, y);
  y += 7;

  doc.setFont("helvetica", "italic");
  doc.setTextColor(80, 80, 80);
  for (const m of perfilData.mirror) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(`• ${m}`, margin + 3, y);
    y += 6;
  }
  y += 8;

  // Symptoms
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(73, 95, 147);
  doc.text("LO QUE TU NEGOCIO ESTÁ MOSTRANDO", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  for (const s of perfilData.symptoms) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(`! ${s}`, margin + 3, y);
    y += 6;
  }
  y += 10;

  // CTA
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(73, 95, 147);
  doc.roundedRect(margin, y - 3, contentWidth, 28, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(perfilData.ctaTitle, pageWidth / 2, y + 5, { align: "center", maxWidth: contentWidth - 10 });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(perfilData.ctaText, pageWidth / 2, y + 13, { align: "center", maxWidth: contentWidth - 10 });

  y += 35;

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text(
    "Mejora Continua — Comunidad de Negocios | app.mejoraok.com",
    pageWidth / 2,
    285,
    { align: "center" }
  );

  // Save
  const fileName = `diagnostico-mejora-${data.perfil.toLowerCase()}-${Date.now()}.pdf`;
  doc.save(fileName);
}
