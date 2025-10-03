package com.crypto.analysis.pdf.service;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDSignatureField;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfStampService {

    private static final int DPI = 300; // high-res

    /**
     * If srcW/srcH > 0 → manual crop from source.
     * If srcW==0 && srcH==0 → auto-use the first signature widget on srcPage.
     * Coords are in points. If you measured Y from top, set coordsFromTop=true.
     */
    public byte[] copySignatureAppearance(
            MultipartFile sourceSignedPdf, int srcPage,     // 1-based
            MultipartFile targetPdf, int dstPage,           // 1-based
            float srcX, float srcY, float srcW, float srcH, // manual crop fallback (optional)
            float dstX, float dstY, float dstW, float dstH, // destination placement
            boolean coordsFromTop, boolean debugBorder) throws Exception {

        byte[] croppedPng;

        // ---- Prefer: crop the signature widget on srcPage ----
        try (PDDocument d = Loader.loadPDF(sourceSignedPdf.getBytes())) {
            ensurePageInRange(d, srcPage, "srcPage");

            // Locate first signature widget on srcPage (match by COS object)
            PDAcroForm acro = d.getDocumentCatalog().getAcroForm();
            PDAnnotationWidget chosenW = null;
            if (acro != null) {
                outer:
                for (PDField f : acro.getFieldTree()) {
                    if (f instanceof PDSignatureField) {
                        PDSignatureField sig = (PDSignatureField) f;
                        List<PDAnnotationWidget> ws = sig.getWidgets();
                        if (ws == null) continue;
                        for (PDAnnotationWidget w : ws) {
                            PDPage wp = w.getPage();
                            if (wp == null) continue;
                            // resolve page index robustly
                            int idx = 0;
                            for (PDPage p : d.getPages()) {
                                if (p == wp || p.getCOSObject() == wp.getCOSObject()
                                        || p.getCOSObject().equals(wp.getCOSObject())) break;
                                idx++;
                            }
                            if (idx == srcPage - 1) { chosenW = w; break outer; }
                        }
                    }
                }
            }

            if (chosenW != null) {
                // Render srcPage upright and crop the widget rect (CropBox + rotation aware)
                PDPage page = chosenW.getPage();
                PDRectangle rect = chosenW.getRectangle();

                PDFRenderer r = new PDFRenderer(d);
                BufferedImage full = r.renderImageWithDPI(srcPage - 1, DPI);

                // Use CropBox (visible area); account for its offset
                PDRectangle box = page.getCropBox() != null ? page.getCropBox() : page.getMediaBox();
                float pageW = box.getWidth(), pageH = box.getHeight();
                float offX  = box.getLowerLeftX(), offY = box.getLowerLeftY();

                // Rect relative to CropBox origin
                float x = rect.getLowerLeftX() - offX;
                float y = rect.getLowerLeftY() - offY;
                float w = rect.getWidth();
                float h = rect.getHeight();

                // Rotation mapping (map page user space -> rendered image upright space)
                int rotation = page.getRotation();
                rotation = ((rotation % 360) + 360) % 360;

                float rx, ry, rw, rh;
                switch (rotation) {
                    case 90:  rx = y;                    ry = pageW - (x + w); rw = h; rh = w; break;
                    case 180: rx = pageW - (x + w);      ry = pageH - (y + h); rw = w; rh = h; break;
                    case 270: rx = pageH - (y + h);      ry = x;               rw = h; rh = w; break;
                    default:  rx = x;                    ry = y;               rw = w; rh = h;
                }

                // Convert to pixel crop in rendered image
                float scale = DPI / 72f;
                int px = Math.round(rx * scale), py = Math.round(ry * scale);
                int pw = Math.round(rw * scale), ph = Math.round(rh * scale);
                int imgY = full.getHeight() - (py + ph);

                int x1 = clamp(px, 0, full.getWidth());
                int y1 = clamp(imgY, 0, full.getHeight());
                int x2 = clamp(px + pw, 0, full.getWidth());
                int y2 = clamp(imgY + ph, 0, full.getHeight());
                int cw = Math.max(1, x2 - x1), ch = Math.max(1, y2 - y1);

                BufferedImage crop = full.getSubimage(x1, y1, cw, ch);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(crop, "png", baos);
                croppedPng = baos.toByteArray();

            } else if (srcW > 0 && srcH > 0) {
                // ---- Fallback: manual source crop (upright viewer coords) ----
                BufferedImage full = new PDFRenderer(d).renderImageWithDPI(srcPage - 1, DPI);
                float scale = DPI / 72f;
                int px = Math.round(srcX * scale);
                int pw = Math.round(srcW * scale);
                int ph = Math.round(srcH * scale);
                int yTop = coordsFromTop
                        ? Math.round(srcY * scale)
                        : full.getHeight() - Math.round((srcY + srcH) * scale);
                int x1 = clamp(px, 0, full.getWidth());
                int y1 = clamp(yTop, 0, full.getHeight());
                int x2 = clamp(px + pw, 0, full.getWidth());
                int y2 = clamp(yTop + ph, 0, full.getHeight());
                int cw = Math.max(1, x2 - x1);
                int ch = Math.max(1, y2 - y1);

                BufferedImage crop = full.getSubimage(x1, y1, cw, ch);
                ByteArrayOutputStream png = new ByteArrayOutputStream();
                ImageIO.write(crop, "png", png);
                croppedPng = png.toByteArray();

            } else {
                throw new IllegalArgumentException("No signature widget found on srcPage " + srcPage +
                        " and no manual crop (srcW/srcH) provided.");
            }
        }

        // ---- Place PNG onto destination (handles CropBox & rotation)
        return placePngOnPdf(
                targetPdf.getBytes(), dstPage,
                dstX, dstY, dstW, dstH,
                croppedPng, coordsFromTop, debugBorder);
    }


    // Back-compat overload (page 1 both sides; bottom-left; no border)
    public byte[] copySignatureAppearance(MultipartFile sourceSignedPdf,
                                          MultipartFile targetPdf,
                                          float srcX, float srcY, float srcW, float srcH,
                                          float dstX, float dstY, float dstW, float dstH) throws Exception {
        return copySignatureAppearance(
                sourceSignedPdf, 1, targetPdf, 1,
                srcX, srcY, srcW, srcH,
                dstX, dstY, dstW, dstH,
                false, false);
    }

    /* ====================== helpers ====================== */

    private static int clamp(int v, int min, int max) { return Math.min(Math.max(v, min), max); }

    private static void ensurePageInRange(PDDocument doc, int page, String name) {
        if (page < 1 || page > doc.getNumberOfPages()) {
            throw new IllegalArgumentException(name + " out of range: " + page);
        }
    }

    /** Render the first signature widget on the given page (1-based). */
    private static byte[] renderFirstSignatureWidgetPng(byte[] pdf, int page1, int dpi) throws Exception {
        try (PDDocument d = Loader.loadPDF(pdf)) {
            ensurePageInRange(d, page1, "srcPage");
            int targetIdx = page1 - 1;

            PDAcroForm acro = d.getDocumentCatalog().getAcroForm();
            if (acro == null) throw new IllegalStateException("No AcroForm/signature fields in source PDF.");

            PDSignatureField chosen = null;
            PDAnnotationWidget chosenW = null;
            for (PDField f : acro.getFieldTree()) {
                if (f instanceof PDSignatureField) {
                    PDSignatureField sig = (PDSignatureField) f;
                    List<PDAnnotationWidget> ws = sig.getWidgets();
                    if (ws != null) {
                        for (PDAnnotationWidget w : ws) {
                            if (w.getPage() == null) continue;
                            // match by COS object to be robust
                            int idx = 0;
                            for (PDPage p : d.getPages()) {
                                if (p == w.getPage() || p.getCOSObject() == w.getPage().getCOSObject()
                                        || p.getCOSObject().equals(w.getPage().getCOSObject())) break;
                                idx++;
                            }
                            if (idx == targetIdx) { chosen = sig; chosenW = w; break; }
                        }
                    }
                }
                if (chosen != null) break;
            }
            if (chosen == null || chosenW == null) {
                throw new IllegalArgumentException("No signature widget found on page " + page1);
            }

            PDRectangle rect = chosenW.getRectangle();
            PDPage page = chosenW.getPage();

            // Render page upright and crop the widget (rotation-aware)
            PDFRenderer r = new PDFRenderer(d);
            BufferedImage full = r.renderImageWithDPI(targetIdx, dpi);

            int rotation = page.getRotation(); rotation = ((rotation % 360) + 360) % 360;
            PDRectangle mb = page.getMediaBox();
            float pageW = mb.getWidth(), pageH = mb.getHeight();

            float x = rect.getLowerLeftX(), y = rect.getLowerLeftY(), w = rect.getWidth(), h = rect.getHeight();
            float rx, ry, rw, rh;
            switch (rotation) {
                case 90:  rx = y; ry = pageW - (x + w); rw = h; rh = w; break;
                case 180: rx = pageW - (x + w); ry = pageH - (y + h); rw = w; rh = h; break;
                case 270: rx = pageH - (y + h); ry = x; rw = h; rh = w; break;
                default:  rx = x; ry = y; rw = w; rh = h;
            }

            float scale = dpi / 72f;
            int px = Math.round(rx * scale), py = Math.round(ry * scale);
            int pw = Math.round(rw * scale), ph = Math.round(rh * scale);
            int imgY = full.getHeight() - (py + ph);

            int x1 = clamp(px, 0, full.getWidth());
            int y1 = clamp(imgY, 0, full.getHeight());
            int x2 = clamp(px + pw, 0, full.getWidth());
            int y2 = clamp(imgY + ph, 0, full.getHeight());
            int cw = Math.max(1, x2 - x1), ch = Math.max(1, y2 - y1);

            BufferedImage crop = full.getSubimage(x1, y1, cw, ch);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(crop, "png", baos);
            return baos.toByteArray();
        }
    }

	public byte[] placePngOnAllPages(byte[] targetPdf, float relX, float relY, float relW, float relH, // 0..1 fractions
																										// of page
																										// width/height
			byte[] pngBytes, boolean debugBorder) throws Exception {
		try (PDDocument dstDoc = org.apache.pdfbox.Loader.loadPDF(targetPdf)) {
			org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject img = org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory
					.createFromImage(dstDoc, javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(pngBytes)));

			for (int i = 0; i < dstDoc.getNumberOfPages(); i++) {
				org.apache.pdfbox.pdmodel.PDPage page = dstDoc.getPage(i);
				org.apache.pdfbox.pdmodel.common.PDRectangle box = page.getCropBox() != null ? page.getCropBox()
						: page.getMediaBox();

				float pageW = box.getWidth(), pageH = box.getHeight();
				float offX = box.getLowerLeftX(), offY = box.getLowerLeftY();

// Target rect in upright (bottom-left) coords as fractions
				float xBL = relX * pageW;
				float yBL = relY * pageH;
				float w = relW * pageW;
				float h = relH * pageH;

// Map to actual page rotation (same mapping as placePngOnPdf)
				int rotation = page.getRotation();
				rotation = ((rotation % 360) + 360) % 360;

				float ux = xBL, uy = yBL, uw = w, uh = h;
				switch (rotation) {
				case 90:
					ux = pageW - yBL - w;
					uy = xBL;
					uw = h;
					uh = w;
					break;
				case 180:
					ux = pageW - xBL - w;
					uy = pageH - yBL - h;
					break;
				case 270:
					ux = yBL;
					uy = pageH - xBL - h;
					uw = h;
					uh = w;
					break;
				default:
					/* 0 */ break;
				}

// Add CropBox offset
				ux += offX;
				uy += offY;

				try (org.apache.pdfbox.pdmodel.PDPageContentStream cs = new org.apache.pdfbox.pdmodel.PDPageContentStream(
						dstDoc, page, org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode.APPEND, true, true)) {
					cs.drawImage(img, ux, uy, uw, uh);
					if (debugBorder) {
						cs.setLineWidth(1f);
						cs.setStrokingColor(0f, 0f, 0f); // PDFBox 3.x uses 0..1 floats
						cs.addRect(ux, uy, uw, uh);
						cs.stroke();
					}
				}
			}

			java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
			dstDoc.save(baos);
			return baos.toByteArray();
		}
	}
    /** Place a PNG onto destination page honoring CropBox, rotation, and optional top-origin Y. */
    public byte[] placePngOnPdf(byte[] targetPdf,
                                int dstPage, float dstX, float dstY, float dstW, float dstH,
                                byte[] pngBytes, boolean coordsFromTop, boolean debugBorder) throws Exception {
        try (PDDocument dstDoc = Loader.loadPDF(targetPdf)) {
            ensurePageInRange(dstDoc, dstPage, "dstPage");
            PDPage page = dstDoc.getPage(dstPage - 1);

            // Use CropBox if present, otherwise MediaBox
            PDRectangle box = page.getCropBox() != null ? page.getCropBox() : page.getMediaBox();
            float pageW = box.getWidth(), pageH = box.getHeight();
            float offX = box.getLowerLeftX(), offY = box.getLowerLeftY();

            // Convert to bottom-left origin if needed
            float yBL = coordsFromTop ? (pageH - dstY - dstH) : dstY;
            float xBL = dstX;

            // Normalize rotation
            int rotation = page.getRotation();
            rotation = ((rotation % 360) + 360) % 360;

            // Compute un-offset, rotation-aware placement box (ux,uy,uw,uh)
            float ux = xBL, uy = yBL, uw = dstW, uh = dstH;
            switch (rotation) {
                case 90:
                    ux = pageW - yBL - dstW;
                    uy = xBL;
                    uw = dstH;   // swap W/H
                    uh = dstW;
                    break;
                case 180:
                    ux = pageW - xBL - dstW;
                    uy = pageH - yBL - dstH;
                    // uw/uh unchanged
                    break;
                case 270:
                    ux = yBL;
                    uy = pageH - xBL - dstH;
                    uw = dstH;   // swap W/H
                    uh = dstW;
                    break;
                default:
                    // 0 degrees: keep (ux,uy,uw,uh) as is
            }

            // Apply CropBox offset
            ux += offX;
            uy += offY;

            // Create image
            BufferedImage bi = ImageIO.read(new java.io.ByteArrayInputStream(pngBytes));
            PDImageXObject img = LosslessFactory.createFromImage(dstDoc, bi);

            try (PDPageContentStream cs = new PDPageContentStream(
                    dstDoc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                // Draw the image
                cs.drawImage(img, ux, uy, uw, uh);

                // Optional debug border
                if (debugBorder) {
                    // If you want the border exactly on the image box, set borderInset = 0f.
                    // If you want it visibly inside (so stroke isn't clipped), use a small inset (e.g., 1f–2f).
                    final float borderInset = 0f; // <-- tweak if desired

                    float bx = ux + borderInset;
                    float by = uy + borderInset;
                    float bw = Math.max(0, uw - 2 * borderInset);
                    float bh = Math.max(0, uh - 2 * borderInset);

                    cs.setLineWidth(1f);
                    // PDFBox 3 uses 0..1 float components
                    cs.setStrokingColor(0f, 0f, 0f);
                    cs.addRect(bx, by, bw, bh);
                    cs.stroke();
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            dstDoc.save(baos);
            return baos.toByteArray();
        }
        
    }
}