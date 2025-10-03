package com.crypto.analysis.pdf.service;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDSignatureField;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;

@Service
public class PdfSignatureInspectService {

    /** Where each signature widget sits on the page. */
    public static class SignatureLocation {
        public String fieldName;
        public int page;                 // 1-based
        // bottom-left origin (relative to CropBox)
        public float x, y, w, h;
        public int rotation;             // page rotation (0/90/180/270)
        public float cropLLX, cropLLY;   // CropBox origin (for reference)
        // viewer/upright coords (what you see in a viewer; Y from top)
        public float xUpright, yTopUpright, wUpright, hUpright;
    }
    public byte[] renderSignatureAppearancePng(byte[] pdf, String fieldName, int dpi) throws Exception {
        try (PDDocument d = Loader.loadPDF(pdf)) {
            PDAcroForm acro = d.getDocumentCatalog().getAcroForm();
            if (acro == null) throw new IllegalArgumentException("No AcroForm/signature fields found.");

            // Pick the signature field
            PDSignatureField chosen = null;
            if (fieldName != null && !fieldName.isBlank()) {
                PDField f = acro.getField(fieldName);
                if (f instanceof PDSignatureField) {
                    chosen = (PDSignatureField) f;
                } else {
                    for (PDField ft : acro.getFieldTree()) {
                        if (ft instanceof PDSignatureField &&
                                fieldName.equals(ft.getFullyQualifiedName())) { chosen = (PDSignatureField) ft; break; }
                    }
                }
                if (chosen == null) throw new IllegalArgumentException("Signature field not found: " + fieldName);
            } else {
                for (PDField ft : acro.getFieldTree()) {
                    if (ft instanceof PDSignatureField) { chosen = (PDSignatureField) ft; break; }
                }
                if (chosen == null) throw new IllegalArgumentException("No signature fields in PDF.");
            }

            List<PDAnnotationWidget> widgets = chosen.getWidgets();
            if (widgets == null || widgets.isEmpty())
                throw new IllegalStateException("Signature field has no widgets.");

            PDAnnotationWidget w = widgets.get(0);
            PDPage page = w.getPage();
            if (page == null) throw new IllegalStateException("Widget has no associated page.");

            // Resolve page index robustly
            int pageIndex = -1, i = 0;
            for (PDPage p : d.getPages()) {
                if (p == page || p.getCOSObject() == page.getCOSObject()
                        || p.getCOSObject().equals(page.getCOSObject())) { pageIndex = i; break; }
                i++;
            }
            if (pageIndex < 0) throw new IllegalStateException("Widget page not found in document.");

            // Use CropBox (visible area)
            PDRectangle crop = page.getCropBox() != null ? page.getCropBox() : page.getMediaBox();
            float pageW = crop.getWidth(), pageH = crop.getHeight();
            float offX  = crop.getLowerLeftX(), offY = crop.getLowerLeftY();

            // Rect relative to CropBox origin
            PDRectangle rect = w.getRectangle();
            float x = rect.getLowerLeftX() - offX;
            float y = rect.getLowerLeftY() - offY;
            float rw = rect.getWidth();
            float rh = rect.getHeight();

            // Map to upright/viewer image coords (handle rotation)
            int rotation = ((page.getRotation() % 360) + 360) % 360;
            float rx, ry, rW, rH;
            switch (rotation) {
                case 90:  rx = y;                    ry = pageW - (x + rw); rW = rh; rH = rw; break;
                case 180: rx = pageW - (x + rw);      ry = pageH - (y + rh); rW = rw; rH = rh; break;
                case 270: rx = pageH - (y + rh);      ry = x;               rW = rh; rH = rw; break;
                default:  rx = x;                    ry = y;               rW = rw; rH = rh;
            }

            // Render page image and crop to widget
            PDFRenderer renderer = new PDFRenderer(d);
            BufferedImage full = renderer.renderImageWithDPI(pageIndex, dpi);

            float scale = dpi / 72f;
            int px = Math.round(rx * scale), py = Math.round(ry * scale);
            int pw = Math.round(rW * scale), ph = Math.round(rH * scale);
            int imgY = full.getHeight() - (py + ph);

            int x1 = Math.max(0, Math.min(full.getWidth(), px));
            int y1 = Math.max(0, Math.min(full.getHeight(), imgY));
            int x2 = Math.max(0, Math.min(full.getWidth(), px + pw));
            int y2 = Math.max(0, Math.min(full.getHeight(), imgY + ph));
            int cw = Math.max(1, x2 - x1), ch = Math.max(1, y2 - y1);

            BufferedImage cropImg = full.getSubimage(x1, y1, cw, ch);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(cropImg, "png", baos);
            return baos.toByteArray();
        }
    }
    /** List every signature widget location in the PDF. */
    public List<SignatureLocation> listSignatureLocations(byte[] pdf) throws Exception {
        List<SignatureLocation> out = new ArrayList<>();
        try (PDDocument doc = Loader.loadPDF(pdf)) {
            PDAcroForm acro = doc.getDocumentCatalog().getAcroForm();
            if (acro == null) return out;

            for (PDField f : acro.getFieldTree()) {
                if (!(f instanceof PDSignatureField)) continue;
                PDSignatureField sig = (PDSignatureField) f;
                List<PDAnnotationWidget> ws = sig.getWidgets();
                if (ws == null) continue;

                for (PDAnnotationWidget w : ws) {
                    PDPage page = w.getPage();
                    if (page == null) continue;

                    // Resolve 0-based page index robustly (COS object compare)
                    int idx = -1, i = 0;
                    for (PDPage p : doc.getPages()) {
                        if (p == page || p.getCOSObject() == page.getCOSObject()
                                || p.getCOSObject().equals(page.getCOSObject())) { idx = i; break; }
                        i++;
                    }
                    if (idx < 0) continue;

                    PDRectangle rect = w.getRectangle();
                    PDRectangle crop = page.getCropBox() != null ? page.getCropBox() : page.getMediaBox();
                    float pageW = crop.getWidth(), pageH = crop.getHeight();
                    float offX  = crop.getLowerLeftX(), offY = crop.getLowerLeftY();

                    // rect relative to CropBox origin (bottom-left)
                    float x = rect.getLowerLeftX() - offX;
                    float y = rect.getLowerLeftY() - offY;
                    float rw = rect.getWidth();
                    float rh = rect.getHeight();

                    int rotation = page.getRotation();
                    rotation = ((rotation % 360) + 360) % 360;

                    // Map to "upright viewer" coords (what you see in a viewer image)
                    float rx, ry, rW, rH;
                    switch (rotation) {
                        case 90:  rx = y;               ry = pageW - (x + rw); rW = rh; rH = rw; break;
                        case 180: rx = pageW - (x + rw); ry = pageH - (y + rh); rW = rw; rH = rh; break;
                        case 270: rx = pageH - (y + rh); ry = x;                rW = rh; rH = rw; break;
                        default:  rx = x;               ry = y;                 rW = rw; rH = rh;
                    }
                    float uprightW = (rotation % 180 == 0) ? pageW : pageH;
                    float uprightH = (rotation % 180 == 0) ? pageH : pageW;
                    float yTop = uprightH - (ry + rH);

                    SignatureLocation sl = new SignatureLocation();
                    sl.fieldName = sig.getFullyQualifiedName();
                    sl.page = idx + 1;
                    sl.x = x; sl.y = y; sl.w = rw; sl.h = rh;
                    sl.rotation = rotation;
                    sl.cropLLX = offX; sl.cropLLY = offY;
                    sl.xUpright = rx; sl.yTopUpright = yTop; sl.wUpright = rW; sl.hUpright = rH;

                    out.add(sl);
                }
            }
        }
        return out;
    }

    /** Convenience: find one location by field name (first matching widget). */
    public @Nullable SignatureLocation getSignatureLocation(byte[] pdf, String fieldName) throws Exception {
        for (SignatureLocation sl : listSignatureLocations(pdf)) {
            if (sl.fieldName != null && sl.fieldName.equals(fieldName)) return sl;
        }
        return null;
    }
}