package com.crypto.analysis.pdf.controller;

import com.crypto.analysis.pdf.service.PdfSignatureInspectService;   // ✅ renamed service
import com.crypto.analysis.pdf.service.PdfStampService;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/pdf")
public class PdfController {

    private final PdfStampService stampService;
    private final PdfSignatureInspectService inspectService; // ✅ renamed field
    
    public PdfController(PdfStampService stampService,
                         PdfSignatureInspectService inspectService) { // ✅ renamed param
        this.stampService = stampService;
        this.inspectService = inspectService; // ✅ assign
    }

  
    // ---------------------------------------------------------------------
    // A) VISUAL STAMP (image only, not a cryptographic signature)
    // ---------------------------------------------------------------------
    @PostMapping(value = "/stamp-safe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> stampSafe(
        @RequestParam("sourceSignedPdf") MultipartFile sourceSignedPdf,
        @RequestParam("srcPage") int srcPage,
        @RequestParam("targetPdf") MultipartFile targetPdf,
        @RequestParam("dstPage") int dstPage,
        @RequestParam float srcX, @RequestParam float srcY,
        @RequestParam float srcW, @RequestParam float srcH,
        @RequestParam float dstX, @RequestParam float dstY,
        @RequestParam float dstW, @RequestParam float dstH,
        @RequestParam(name="coordsFromTop", defaultValue="false") boolean coordsFromTop,
        @RequestParam(name="debugBorder", defaultValue="true") boolean debugBorder
    ) throws Exception {
        byte[] out = stampService.copySignatureAppearance(
            sourceSignedPdf, srcPage, targetPdf, dstPage,
            srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH,
            coordsFromTop, debugBorder);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stamped.pdf")
            .body(out);
    }

@PostMapping(value = "/stamp-safe-sign", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<byte[]> stampSafe(
    @RequestParam("sourceSignedPdf") MultipartFile sourceSignedPdf,
    @RequestParam("srcPage") int srcPage,
    @RequestParam("targetPdf") MultipartFile targetPdf,
    @RequestParam("dstPage") int dstPage,
    @RequestParam float srcX, @RequestParam float srcY,
    @RequestParam float srcW, @RequestParam float srcH,
    @RequestParam float dstX, @RequestParam float dstY,
    @RequestParam float dstW, @RequestParam float dstH,
    @RequestParam(name="coordsFromTop", defaultValue="false") boolean coordsFromTop,
    @RequestParam(name="debugBorder", defaultValue="true") boolean debugBorder,

    // existing flags
    @RequestParam(name="useOriginalLocation", defaultValue="false") boolean useOriginalLocation,
    @RequestParam(name="normalizeToTarget",   defaultValue="true")  boolean normalizeToTarget,

    // NEW: stamp on every page
    @RequestParam(name="applyToAllPages", defaultValue="true") boolean applyToAllPages
) throws Exception {

    // If we’re applying to ALL pages, compute relative placement once, crop the widget once, then fan out.
    if (applyToAllPages) {
        // 1) Find the signature widget on srcPage (you already have this service)
        var all = inspectService.listSignatureLocations(sourceSignedPdf.getBytes());
        var onPage = all.stream().filter(sl -> sl.page == srcPage).findFirst()
            .orElseThrow(() -> new IllegalArgumentException("No signature widget found on source page " + srcPage));

        // 2) Source page size (CropBox)
        float srcPageW, srcPageH;
        try (PDDocument sDoc = Loader.loadPDF(sourceSignedPdf.getBytes())) {
            var sc = sDoc.getPage(srcPage - 1).getCropBox() != null
                    ? sDoc.getPage(srcPage - 1).getCropBox()
                    : sDoc.getPage(srcPage - 1).getMediaBox();
            srcPageW = sc.getWidth(); srcPageH = sc.getHeight();
        }

        // 3) Relative fractions of the page (so it scales on any page size)
        float relX = onPage.x / srcPageW;
        float relY = onPage.y / srcPageH;
        float relW = onPage.w / srcPageW;
        float relH = onPage.h / srcPageH;

        // 4) Render ONLY the signature widget once to PNG (sharp)
        byte[] sigPng = inspectService.renderSignatureAppearancePng(sourceSignedPdf.getBytes(),
                onPage.fieldName, 300);

        // 5) Stamp that PNG on ALL pages at the same relative spot
        byte[] outAll = stampService.placePngOnAllPages(
                targetPdf.getBytes(), relX, relY, relW, relH, sigPng, debugBorder);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stamped_all_pages.pdf")
                .body(outAll);
    }

    // ---- existing single-page behavior (unchanged) ----
    float effDstX = dstX, effDstY = dstY, effDstW = dstW, effDstH = dstH;
    boolean effCoordsFromTop = coordsFromTop;
    float effSrcX = srcX, effSrcY = srcY, effSrcW = srcW, effSrcH = srcH;

    if (useOriginalLocation || (dstX == 0f && dstY == 0f && dstW == 0f && dstH == 0f)) {
        var all = inspectService.listSignatureLocations(sourceSignedPdf.getBytes());
        var onPage = all.stream().filter(sl -> sl.page == srcPage).findFirst()
            .orElseThrow(() -> new IllegalArgumentException("No signature widget found on source page " + srcPage));

        float sx = onPage.x, sy = onPage.y, sw = onPage.w, sh = onPage.h;

        float srcPageW, srcPageH, dstPageW, dstPageH;
        try (PDDocument sDoc = Loader.loadPDF(sourceSignedPdf.getBytes())) {
            PDRectangle sc = sDoc.getPage(srcPage - 1).getCropBox() != null
                    ? sDoc.getPage(srcPage - 1).getCropBox()
                    : sDoc.getPage(srcPage - 1).getMediaBox();
            srcPageW = sc.getWidth(); srcPageH = sc.getHeight();
        }
        try (PDDocument dDoc = Loader.loadPDF(targetPdf.getBytes())) {
            PDRectangle dc = dDoc.getPage(dstPage - 1).getCropBox() != null
                    ? dDoc.getPage(dstPage - 1).getCropBox()
                    : dDoc.getPage(dstPage - 1).getMediaBox();
            dstPageW = dc.getWidth(); dstPageH = dc.getHeight();
        }

        if (normalizeToTarget) {
            effDstX = (sx / srcPageW) * dstPageW;
            effDstY = (sy / srcPageH) * dstPageH;
            effDstW = (sw / srcPageW) * dstPageW;
            effDstH = (sh / srcPageH) * dstPageH;
        } else {
            effDstX = sx; effDstY = sy; effDstW = sw; effDstH = sh;
        }

        effCoordsFromTop = false;
        effSrcX = 0f; effSrcY = 0f; effSrcW = 0f; effSrcH = 0f; // auto-crop signature widget
    }

    byte[] out = stampService.copySignatureAppearance(
        sourceSignedPdf, srcPage, targetPdf, dstPage,
        effSrcX, effSrcY, effSrcW, effSrcH,
        effDstX, effDstY, effDstW, effDstH,
        effCoordsFromTop, debugBorder);

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stamped.pdf")
        .body(out);
}
}