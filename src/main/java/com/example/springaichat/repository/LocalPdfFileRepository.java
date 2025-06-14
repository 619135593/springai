package com.example.springaichat.repository;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Properties;

/**
 * 本地PDF文件存储实现
 * 负责PDF文件的本地文件系统存储和管理
 */
@Service
@Slf4j
public class LocalPdfFileRepository implements FileRepository {

    /**
     * 会话id与文件名的对应关系，方便查询会话历史时重新加载文件
     * Properties 类是一个键值对集合，用于存储和检索键值对
     */
    private final Properties chatFiles = new Properties();

    /**
     * 保存文件到本地磁盘，并记录ChatId与文件的映射关系
     * @param chatId 聊天会话ID
     * @param resource 文件资源
     * @return 保存是否成功
     */
    @Override
    public boolean save(String chatId, Resource resource) {
        try {
            log.info("开始保存PDF文件，chatId: {}, 文件名: {}", chatId, resource.getFilename());
            
            // 1. 获取文件名
            String filename = resource.getFilename();
            if (filename == null || filename.isEmpty()) {
                log.error("文件名为空，无法保存");
                return false;
            }
            
            // 2. 创建uploads目录
            File uploadsDir = new File("uploads");
            if (!uploadsDir.exists()) {
                boolean created = uploadsDir.mkdirs();
                if (created) {
                    log.info("创建uploads目录成功: {}", uploadsDir.getAbsolutePath());
                } else {
                    log.warn("创建uploads目录失败: {}", uploadsDir.getAbsolutePath());
                }
            }
            
            // 3. 创建目标文件路径（保存到uploads目录）
            File target = new File(uploadsDir, filename);
            
            // 4. 如果文件不存在，则保存文件
            if (!target.exists()) {
                try {
                    // 将resource文件保存到本地磁盘
                    Files.copy(resource.getInputStream(), target.toPath());
                    log.info("文件保存成功：{}", target.getAbsolutePath());
                } catch (IOException e) {
                    log.error("保存文件失败，文件名: {}", filename, e);
                    return false;
                }
            } else {
                log.info("文件已存在，跳过保存：{}", target.getAbsolutePath());
            }
            
            // 5. 保存ChatId与文件名的映射关系（存储相对路径）
            String relativePath = "uploads" + File.separator + filename;
            chatFiles.put(chatId, relativePath);
            log.info("保存文件映射关系成功，chatId: {} -> 文件路径: {}", chatId, relativePath);
            
            return true;
            
        } catch (Exception e) {
            log.error("保存文件过程出现异常，chatId: {}", chatId, e);
            return false;
        }
    }

    /**
     * 根据ChatId获取文件
     * @param chatId 聊天会话ID
     * @return 文件资源
     */
    @Override
    public Resource getFile(String chatId) {
        try {
            String filePath = chatFiles.getProperty(chatId);
            if (filePath == null || filePath.isEmpty()) {
                log.warn("未找到chatId对应的文件路径，chatId: {}", chatId);
                return null;
            }
            
            // 兼容性处理：如果存储的是旧格式（只有文件名），转换为新格式
            File file = new File(filePath);
            if (!file.exists() && !filePath.contains(File.separator)) {
                // 旧格式：只有文件名，尝试从uploads目录读取
                filePath = "uploads" + File.separator + filePath;
                file = new File(filePath);
                if (file.exists()) {
                    // 更新映射关系为新格式
                    chatFiles.put(chatId, filePath);
                    log.info("更新文件映射关系为新格式，chatId: {} -> 文件路径: {}", chatId, filePath);
                }
            }
            
            FileSystemResource resource = new FileSystemResource(filePath);
            if (!resource.exists()) {
                log.warn("文件不存在，chatId: {}, 文件路径: {}", chatId, filePath);
                return null;
            }
            
            log.info("成功获取文件，chatId: {}, 文件路径: {}", chatId, filePath);
            return resource;
            
        } catch (Exception e) {
            log.error("获取文件失败，chatId: {}", chatId, e);
            return null;
        }
    }

    /**
     * 初始化方法，加载已有的文件映射关系
     */
    @PostConstruct
    private void init() {
        try {
            log.info("开始初始化PDF文件仓库");
            
            // 加载文件映射关系
            FileSystemResource pdfResource = new FileSystemResource("chat-pdf.properties");
            if (pdfResource.exists()) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(pdfResource.getInputStream()))) {
                    chatFiles.load(reader);
                    log.info("成功加载文件映射关系，共{}条记录", chatFiles.size());
                } catch (IOException e) {
                    log.error("加载文件映射关系失败", e);
                }
            } else {
                log.info("文件映射配置文件不存在，将创建新的配置");
            }
            
            log.info("PDF文件仓库初始化完成");
            
        } catch (Exception e) {
            log.error("PDF文件仓库初始化失败", e);
        }
    }

    /**
     * 销毁方法，持久化文件映射关系
     */
    @PreDestroy
    private void persistent() {
        try {
            log.info("开始持久化PDF文件映射关系");
            
            // 保存文件映射关系
            try (FileWriter writer = new FileWriter("chat-pdf.properties")) {
                chatFiles.store(writer, "PDF文件映射关系 - " + LocalDateTime.now().toString());
                log.info("成功持久化文件映射关系，共{}条记录", chatFiles.size());
            } catch (IOException e) {
                log.error("持久化文件映射关系失败", e);
            }
            
        } catch (Exception e) {
            log.error("持久化过程出现异常", e);
        }
    }
    
    /**
     * 获取所有文件映射关系（用于调试）
     * @return 文件映射关系
     */
    public Properties getAllFileMappings() {
        return new Properties(chatFiles);
    }
    
    /**
     * 清除指定chatId的文件映射
     * @param chatId 聊天会话ID
     * @return 是否成功清除
     */
    public boolean removeFileMapping(String chatId) {
        try {
            String filePath = chatFiles.getProperty(chatId);
            if (filePath != null) {
                chatFiles.remove(chatId);
                log.info("已清除文件映射关系，chatId: {}, 文件路径: {}", chatId, filePath);
                return true;
            } else {
                log.warn("未找到要清除的文件映射关系，chatId: {}", chatId);
                return false;
            }
        } catch (Exception e) {
            log.error("清除文件映射关系失败，chatId: {}", chatId, e);
            return false;
        }
    }
}
