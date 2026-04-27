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
@RequestMapping("/api/v1/admin/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestPart("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @PostMapping(value = "/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> uploadFiles(
            @RequestPart("files") List<MultipartFile> files) throws IOException {

        log.info("Upload /multiple - Received {} files", files.size());
        List<String> urls = cloudinaryService.uploadFiles(files);
        return ResponseEntity.ok(ApiResponse.success(urls));
    }
}
