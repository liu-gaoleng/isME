package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * 图片上传接口。仅管理员可调用（鉴权由 SecurityConfig 的 anyRequest().hasRole("ADMIN") 覆盖）。
 * 文件落盘到 app.upload.dir，按日期分目录，随机文件名避免冲突与路径穿越。
 * 返回的 url 形如 /uploads/2026/06/06/xxxx.jpg，由 WebMvcConfig 映射为静态资源公开访问。
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // 允许的图片类型与对应扩展名
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final Map<String, String> EXT_BY_TYPE = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif"
    );
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping("/image")
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException("图片大小不能超过 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException("仅支持 JPG / PNG / WebP / GIF 格式图片");
        }

        String ext = EXT_BY_TYPE.get(contentType);
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String fileName = UUID.randomUUID().toString().replace("-", "") + "." + ext;

        try {
            Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path targetDir = baseDir.resolve(datePath).normalize();
            // 防御路径穿越：目标目录必须仍在 baseDir 之下
            if (!targetDir.startsWith(baseDir)) {
                throw new BusinessException("非法的存储路径");
            }
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(fileName);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new BusinessException("图片保存失败：" + e.getMessage());
        }

        String url = "/uploads/" + datePath + "/" + fileName;
        return ApiResponse.success("上传成功", Map.of("url", url));
    }
}
