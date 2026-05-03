package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.service.interfaces.CloudinaryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    // Admin endpoints
    @PostMapping(value = "/api/v1/admin/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadFileAdmin(
            @RequestPart("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @PostMapping(value = "/api/v1/admin/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> uploadFilesAdmin(
            @RequestPart("files") List<MultipartFile> files) throws IOException {

        log.info("Upload /multiple - Received {} files", files.size());
        List<String> urls = cloudinaryService.uploadFiles(files);
        return ResponseEntity.ok(ApiResponse.success(urls));
    }

    // Public endpoint for authenticated users (reviews, avatars, etc.)
    @PostMapping(value = "/api/v1/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestPart("file") MultipartFile file) throws IOException {
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only image files are allowed"));
        }
        
        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File size must not exceed 5MB"));
        }
        
        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(ApiResponse.success(url));
    }
}
