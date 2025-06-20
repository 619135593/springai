package com.example.springaichat.controller;

import com.example.springaichat.entity.vo.Result;
import com.example.springaichat.repository.ChatHistoryRepository;
import com.example.springaichat.repository.FileRepository;
import com.example.springaichat.service.PdfContentService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import static org.springframework.ai.chat.client.advisor.AbstractChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY;

/**
 * PDF智能问答控制器
 * 提供PDF文档上传、下载和智能对话功能，支持全局知识库
 */
@Slf4j
@RestController
@RequestMapping("/ai/pdf")
public class PdfController {
    
    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private PdfContentService pdfContentService;

    @jakarta.annotation.Resource
    private ChatHistoryRepository chatHistoryRepository;

    @jakarta.annotation.Resource
    private ChatClient simplePdfChatClient;

    /**
     * 应用启动后初始化全局知识库
     */
    @PostConstruct
    public void initializeKnowledgeBase() {
        log.info("开始初始化PDF全局知识库...");
        try {
            pdfContentService.initializeGlobalKnowledgeBase();
            
            Map<String, Object> stats = pdfContentService.getGlobalKnowledgeBaseStats();
            log.info("全局知识库初始化完成 - 文档数: {}, 总页数: {}, 总内容长度: {}", 
                stats.get("documentCount"), stats.get("totalPages"), stats.get("totalContentLength"));
                
        } catch (Exception e) {
            log.error("初始化全局知识库失败", e);
        }
    }

    /**
     * 上传PDF文件并处理内容
     * @param chatId 聊天会话ID
     * @param file 上传的PDF文件
     * @return 上传结果
     */
    @PostMapping("/upload/{chatId}")
    public Result uploadPdf(@PathVariable String chatId, @RequestParam("file") MultipartFile file) {
        try {
            log.info("开始上传PDF文件，chatId: {}, 文件名: {}", chatId, file.getOriginalFilename());
            
            // 1. 校验文件是否为PDF格式
            if (!Objects.equals(file.getContentType(), "application/pdf")) {
                log.warn("文件格式不正确，只支持PDF格式，当前格式: {}", file.getContentType());
                return Result.fail("只能上传PDF文件");
            }
            
            // 2. 保存文件到本地
            boolean saveSuccess = fileRepository.save(chatId, file.getResource());
            if (!saveSuccess) {
                log.error("文件保存失败，chatId: {}", chatId);
                return Result.fail("文件保存失败");
            }
            
            // 3. 处理PDF内容（解析并存储到个人和全局知识库）
            pdfContentService.processPdfDocument(chatId, file.getResource());
            
            // 4. 获取全局知识库统计信息
            Map<String, Object> stats = pdfContentService.getGlobalKnowledgeBaseStats();
            
            log.info("PDF文件上传和处理成功，chatId: {}", chatId);
            return Result.ok("上传成功，已加入全局知识库")
                .put("globalStats", stats);
            
        } catch (Exception e) {
            log.error("上传PDF文件失败，chatId: {}", chatId, e);
            return Result.fail("上传失败: " + e.getMessage());
        }
    }

    /**
     * 下载PDF文件
     * @param chatId 聊天会话ID
     * @return PDF文件响应
     */
    @GetMapping("/file/{chatId}")
    public ResponseEntity<Resource> download(@PathVariable String chatId) {
        try {
            log.info("开始下载PDF文件，chatId: {}", chatId);
            
            // 1. 读取文件
            Resource resource = fileRepository.getFile(chatId);
            if (resource == null || !resource.exists()) {
                log.warn("文件不存在，chatId: {}", chatId);
                return ResponseEntity.notFound().build();
            }
            
            // 2. 文件名编码写入响应头
            String filename = URLEncoder.encode(Objects.requireNonNull(resource.getFilename()), StandardCharsets.UTF_8);
            
            // 3. 返回文件
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("下载PDF文件失败，chatId: {}", chatId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 基于全局知识库的智能对话
     * @param prompt 用户提问
     * @param chatId 聊天会话ID
     * @return 流式响应
     */
    @GetMapping(value = "/chat", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
    public Flux<String> chat(@RequestParam String prompt, 
                             @RequestParam(value = "chatId", defaultValue = "default_pdf_chat") String chatId) {
        log.info("开始基于全局知识库的对话，chatId: {}, 用户问题: {}", chatId, prompt);
        
        try {
            // 1. 从全局知识库搜索相关内容
            List<PdfContentService.PdfPageContent> relevantContents = 
                pdfContentService.searchGlobalKnowledgeBase(prompt, 5);
            
            if (relevantContents.isEmpty()) {
                log.warn("未找到相关内容，chatId: {}", chatId);
                return Flux.just("抱歉，我在全局知识库中没有找到与您问题相关的内容。请确保已上传相关的PDF文档。");
            }
            
            // 2. 构建上下文
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("基于以下PDF文档内容回答用户问题:\n\n");
            
            for (int i = 0; i < relevantContents.size(); i++) {
                PdfContentService.PdfPageContent content = relevantContents.get(i);
                String fileName = (String) content.getMetadata().get("file_name");
                contextBuilder.append(String.format("【文档%d: %s - 第%d页】\n", 
                    i + 1, fileName, content.getPageNumber()));
                contextBuilder.append(content.getContent());
                contextBuilder.append("\n\n");
            }
            
            contextBuilder.append("用户问题: ").append(prompt);
            contextBuilder.append("\n\n请基于上述文档内容准确回答问题，如果文档中没有相关信息，请明确说明。");
            
            String contextPrompt = contextBuilder.toString();
            log.info("构建的上下文长度: {} 字符，包含 {} 个文档片段", contextPrompt.length(), relevantContents.size());
            
            // 3. 调用AI进行对话
            return simplePdfChatClient.prompt()
                .user(contextPrompt)
                .advisors(advisorSpec -> advisorSpec.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId))
                .stream()
                .content();
                
        } catch (Exception e) {
            log.error("对话处理失败，chatId: {}", chatId, e);
            return Flux.just("对话处理失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取全局知识库中的所有文档信息
     * @return 文档列表
     */
    @GetMapping("/documents")
    public Result getAllDocuments() {
        try {
            List<Map<String, Object>> documents = pdfContentService.getAllDocuments();
            Map<String, Object> stats = pdfContentService.getGlobalKnowledgeBaseStats();
            
            return Result.ok("获取文档列表成功")
                .put("documents", documents)
                .put("stats", stats);
                
        } catch (Exception e) {
            log.error("获取文档列表失败", e);
            return Result.fail("获取文档列表失败");
        }
    }
    
    /**
     * 从全局知识库中删除指定文档
     * @param fileName 文件名
     * @return 删除结果
     */
    @DeleteMapping("/documents/{fileName}")
    public Result removeDocument(@PathVariable String fileName) {
        try {
            boolean removed = pdfContentService.removeDocumentFromGlobalKnowledgeBase(fileName);
            if (removed) {
                return Result.ok("文档已从知识库中移除: " + fileName);
            } else {
                return Result.fail("未找到指定文档: " + fileName);
            }
        } catch (Exception e) {
            log.error("删除文档失败，文件名: {}", fileName, e);
            return Result.fail("删除文档失败: " + e.getMessage());
        }
    }
    
    /**
     * 重新初始化全局知识库
     * @return 初始化结果
     */
    @PostMapping("/reinitialize")
    public Result reinitializeKnowledgeBase() {
        try {
            log.info("开始重新初始化全局知识库...");
            pdfContentService.initializeGlobalKnowledgeBase();
            
            Map<String, Object> stats = pdfContentService.getGlobalKnowledgeBaseStats();
            log.info("全局知识库重新初始化完成");
            
            return Result.ok("全局知识库重新初始化成功")
                .put("stats", stats);
                
        } catch (Exception e) {
            log.error("重新初始化全局知识库失败", e);
            return Result.fail("重新初始化失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取全局知识库统计信息
     * @return 统计信息
     */
    @GetMapping("/stats")
    public Result getGlobalKnowledgeBaseStats() {
        try {
            Map<String, Object> stats = pdfContentService.getGlobalKnowledgeBaseStats();
            return Result.ok("获取统计信息成功")
                .put("stats", stats);
        } catch (Exception e) {
            log.error("获取统计信息失败", e);
            return Result.fail("获取统计信息失败");
        }
    }

    /**
     * 获取PDF信息
     * @param chatId 聊天会话ID
     * @return PDF信息
     */
    @GetMapping("/info/{chatId}")
    public Result getPdfInfo(@PathVariable String chatId) {
        try {
            if (!pdfContentService.hasContent(chatId)) {
                return Result.fail("未找到PDF内容");
            }
            
            List<PdfContentService.PdfPageContent> allContents = pdfContentService.getAllContent(chatId);
            
            return Result.ok("PDF信息获取成功")
                    .put("totalPages", allContents.size())
                    .put("hasContent", true);
                    
        } catch (Exception e) {
            log.error("获取PDF信息失败，chatId: {}", chatId, e);
            return Result.fail("获取PDF信息失败");
        }
    }
    
    /**
     * 清除PDF内容缓存
     * @param chatId 聊天会话ID
     * @return 清除结果
     */
    @DeleteMapping("/content/{chatId}")
    public Result clearPdfContent(@PathVariable String chatId) {
        try {
            pdfContentService.removeContent(chatId);
            return Result.ok("PDF内容已清除");
        } catch (Exception e) {
            log.error("清除PDF内容失败，chatId: {}", chatId, e);
            return Result.fail("清除PDF内容失败");
        }
    }
}
