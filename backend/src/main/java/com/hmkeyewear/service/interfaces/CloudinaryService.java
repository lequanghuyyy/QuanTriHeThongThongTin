package com.hmkeyewear.service.interfaces;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface CloudinaryService {
    String uploadFile(MultipartFile file) throws IOException;
    List<String> uploadFiles(List<MultipartFile> files) throws IOException;
}
