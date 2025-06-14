package com.example.springaichat.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.ExtractedTextFormatter;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * PDF内容管理服务
 * 负责PDF文档内容的解析、存储和检索，支持全局知识库
 */
@Service
@Slf4j
public class PdfContentService {
    
    /**
     * 存储每个聊天ID对应的PDF文档内容
     * Key: chatId, Value: PDF文档的分页内容列表
     */
    private final Map<String, List<PdfPageContent>> pdfContents = new ConcurrentHashMap<>();
    
    /**
     * 全局知识库：存储所有PDF文档的内容
     * Key: 文档名称, Value: PDF文档的分页内容列表
     */
    private final Map<String, List<PdfPageContent>> globalKnowledgeBase = new ConcurrentHashMap<>();
    
    /**
     * 文档文件路径映射
     * Key: 文档名称, Value: 文件路径
     */
    private final Map<String, String> documentPaths = new ConcurrentHashMap<>();
    
    /**
     * PDF页面内容存储类
     */
    public static class PdfPageContent {
        /** 页面内容文本 */
        private final String content;
        /** 页码 */
        private final int pageNumber;
        /** 文档元数据 */
        private final Map<String, Object> metadata;
        
        public PdfPageContent(String content, int pageNumber, Map<String, Object> metadata) {
            this.content = content;
            this.pageNumber = pageNumber;
            this.metadata = metadata;
        }
        
        public String getContent() { return content; }
        public int getPageNumber() { return pageNumber; }
        public Map<String, Object> getMetadata() { return metadata; }
        
        @Override
        public String toString() {
            String fileName = (String) metadata.get("file_name");
            return String.format("[%s-第%d页] %s", fileName, pageNumber, content);
        }
    }
    
    /**
     * 解析并存储PDF文档内容（同时更新个人和全局知识库）
     * @param chatId 聊天会话ID
     * @param pdfResource PDF文件资源
     * @throws Exception 解析异常
     */
    public void processPdfDocument(String chatId, Resource pdfResource) throws Exception {
        log.info("开始处理PDF文档，chatId: {}, 文件名: {}", chatId, pdfResource.getFilename());
        
        try {
            String fileName = pdfResource.getFilename();
            
            // 1. 检查全局知识库中是否已存在该文档
            if (globalKnowledgeBase.containsKey(fileName)) {
                log.info("文档已存在于全局知识库中，直接使用: {}", fileName);
                // 复制全局知识库中的内容到当前会话
                List<PdfPageContent> existingContent = new ArrayList<>(globalKnowledgeBase.get(fileName));
                pdfContents.put(chatId, existingContent);
                return;
            }
            
            // 2. 创建PDF读取器
            PagePdfDocumentReader reader = new PagePdfDocumentReader(
                pdfResource,
                PdfDocumentReaderConfig.builder()
                    .withPageExtractedTextFormatter(ExtractedTextFormatter.defaults())
                    .withPagesPerDocument(1) // 每页作为一个独立的Document
                    .build()
            );
            
            // 3. 读取PDF文档并拆分为Document对象
            List<Document> documents = reader.read();
            
            // 4. 转换为我们的存储格式
            List<PdfPageContent> pageContents = new ArrayList<>();
            for (int i = 0; i < documents.size(); i++) {
                Document doc = documents.get(i);
                String content = doc.getText();
                
                // 获取页码信息（如果有的话）
                int pageNumber = i + 1;
                Map<String, Object> metadata = new HashMap<>(doc.getMetadata());
                metadata.put("file_name", fileName);
                metadata.put("chat_id", chatId);
                metadata.put("processed_time", new Date());
                
                if (content != null && !content.trim().isEmpty()) {
                    pageContents.add(new PdfPageContent(content.trim(), pageNumber, metadata));
                }
            }
            
            // 5. 存储到个人知识库
            pdfContents.put(chatId, pageContents);
            
            // 6. 存储到全局知识库
            globalKnowledgeBase.put(fileName, new ArrayList<>(pageContents));
            
            // 7. 记录文档路径
            try {
                File file = pdfResource.getFile();
                documentPaths.put(fileName, file.getAbsolutePath());
            } catch (Exception e) {
                log.warn("无法获取文件路径: {}", fileName);
            }
            
            log.info("PDF文档处理完成，chatId: {}, 文件名: {}, 总页数: {}", chatId, fileName, pageContents.size());
            log.info("全局知识库已更新，当前包含 {} 个文档", globalKnowledgeBase.size());
            
        } catch (Exception e) {
            log.error("处理PDF文档失败，chatId: {}", chatId, e);
            throw new Exception("PDF文档处理失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 初始化时加载uploads目录下的所有PDF文档到全局知识库
     */
    public void initializeGlobalKnowledgeBase() {
        log.info("开始初始化全局知识库...");
        
        File uploadsDir = new File("uploads");
        if (!uploadsDir.exists() || !uploadsDir.isDirectory()) {
            log.info("uploads目录不存在，跳过全局知识库初始化");
            return;
        }
        
        File[] pdfFiles = uploadsDir.listFiles((dir, name) -> 
            name.toLowerCase().endsWith(".pdf"));
        
        if (pdfFiles == null || pdfFiles.length == 0) {
            log.info("uploads目录中没有PDF文件");
            return;
        }
        
        int loadedCount = 0;
        for (File pdfFile : pdfFiles) {
            try {
                String fileName = pdfFile.getName();
                
                // 跳过已加载的文档
                if (globalKnowledgeBase.containsKey(fileName)) {
                    continue;
                }
                
                log.info("加载PDF文档到全局知识库: {}", fileName);
                
                // 使用临时chatId处理文档
                String tempChatId = "init_" + System.currentTimeMillis() + "_" + fileName;
                
                // 创建Resource对象
                org.springframework.core.io.FileSystemResource resource = 
                    new org.springframework.core.io.FileSystemResource(pdfFile);
                
                // 处理文档
                processPdfDocument(tempChatId, resource);
                
                // 移除临时的chatId映射
                pdfContents.remove(tempChatId);
                
                loadedCount++;
                log.info("成功加载文档: {} (第 {}/{} 个)", fileName, loadedCount, pdfFiles.length);
                
            } catch (Exception e) {
                log.error("加载PDF文档失败: {}", pdfFile.getName(), e);
            }
        }
        
        log.info("全局知识库初始化完成，已加载 {} 个PDF文档", loadedCount);
    }
    
    /**
     * 根据用户问题从全局知识库检索相关内容
     * @param userQuery 用户问题
     * @param maxResults 最大返回结果数
     * @return 相关内容列表
     */
    public List<PdfPageContent> searchGlobalKnowledgeBase(String userQuery, int maxResults) {
        if (globalKnowledgeBase.isEmpty()) {
            log.warn("全局知识库为空");
            return Collections.emptyList();
        }
        
        // 收集所有文档的所有页面内容
        List<PdfPageContent> allContents = new ArrayList<>();
        for (List<PdfPageContent> docContents : globalKnowledgeBase.values()) {
            allContents.addAll(docContents);
        }
        
        return searchInContents(allContents, userQuery, maxResults);
    }
    
    /**
     * 根据用户问题检索相关的PDF内容（仅当前聊天的文档 + 全局知识库）
     * @param chatId 聊天会话ID
     * @param userQuery 用户问题
     * @param maxResults 最大返回结果数
     * @return 相关内容列表
     */
    public List<PdfPageContent> searchRelevantContent(String chatId, String userQuery, int maxResults) {
        // 优先从全局知识库搜索
        return searchGlobalKnowledgeBase(userQuery, maxResults);
    }
    
    /**
     * 在指定内容中搜索相关信息
     * @param contents 要搜索的内容列表
     * @param userQuery 用户问题
     * @param maxResults 最大返回结果数
     * @return 相关内容列表
     */
    private List<PdfPageContent> searchInContents(List<PdfPageContent> contents, String userQuery, int maxResults) {
        if (contents.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 提取查询关键词（简单的中文分词）
        Set<String> queryKeywords = extractKeywords(userQuery.toLowerCase());
        
        if (queryKeywords.isEmpty()) {
            // 如果没有关键词，返回各文档的前几页内容
            Map<String, List<PdfPageContent>> byDocument = contents.stream()
                .collect(Collectors.groupingBy(c -> (String) c.getMetadata().get("file_name")));
            
            return byDocument.values().stream()
                .flatMap(docContents -> docContents.stream().limit(2))
                .limit(maxResults)
                .collect(Collectors.toList());
        }
        
        // 计算每页内容的相关性得分
        List<ScoredContent> scoredContents = new ArrayList<>();
        for (PdfPageContent content : contents) {
            double score = calculateRelevanceScore(content.getContent().toLowerCase(), queryKeywords);
            if (score > 0) {
                scoredContents.add(new ScoredContent(content, score));
            }
        }
        
        // 按得分排序并返回top结果
        return scoredContents.stream()
            .sorted((a, b) -> Double.compare(b.score, a.score))
            .limit(maxResults)
            .map(sc -> sc.content)
            .collect(Collectors.toList());
    }
    
    /**
     * 提取关键词（简单实现）
     * @param text 输入文本
     * @return 关键词集合
     */
    private Set<String> extractKeywords(String text) {
        Set<String> keywords = new HashSet<>();
        
        // 移除标点符号并分割
        String cleanText = text.replaceAll("[\\p{Punct}\\s]+", " ").trim();
        String[] words = cleanText.split("\\s+");
        
        for (String word : words) {
            if (word.length() >= 2) { // 只保留长度>=2的词
                keywords.add(word);
            }
        }
        
        // 对于中文，也可以尝试字符级别的匹配
        if (text.matches(".*[\\u4e00-\\u9fa5].*")) {
            // 包含中文字符，添加2-4字的子串作为关键词
            for (int i = 0; i <= text.length() - 2; i++) {
                for (int len = 2; len <= Math.min(4, text.length() - i); len++) {
                    String substr = text.substring(i, i + len);
                    if (substr.matches(".*[\\u4e00-\\u9fa5].*") && !substr.matches(".*[\\s\\p{Punct}].*")) {
                        keywords.add(substr);
                    }
                }
            }
        }
        
        return keywords;
    }
    
    /**
     * 计算文本与关键词的相关性得分
     * @param content 文本内容
     * @param keywords 关键词集合
     * @return 相关性得分
     */
    private double calculateRelevanceScore(String content, Set<String> keywords) {
        double score = 0.0;
        int totalMatches = 0;
        
        for (String keyword : keywords) {
            int count = countOccurrences(content, keyword);
            if (count > 0) {
                // 较长的关键词给予更高权重
                double weight = Math.min(keyword.length() / 2.0, 3.0);
                score += count * weight;
                totalMatches += count;
            }
        }
        
        // 归一化得分
        if (totalMatches > 0) {
            score = score / Math.log(content.length() + 1) * Math.log(totalMatches + 1);
        }
        
        return score;
    }
    
    /**
     * 计算子字符串在文本中的出现次数
     * @param text 文本
     * @param substring 子字符串
     * @return 出现次数
     */
    private int countOccurrences(String text, String substring) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(substring, index)) != -1) {
            count++;
            index += substring.length();
        }
        return count;
    }
    
    /**
     * 获取全局知识库中的所有文档信息
     * @return 文档信息列表
     */
    public List<Map<String, Object>> getAllDocuments() {
        return globalKnowledgeBase.entrySet().stream()
            .map(entry -> {
                String fileName = entry.getKey();
                List<PdfPageContent> contents = entry.getValue();
                
                Map<String, Object> docInfo = new HashMap<>();
                docInfo.put("fileName", fileName);
                docInfo.put("pageCount", contents.size());
                docInfo.put("filePath", documentPaths.get(fileName));
                
                // 获取第一页的处理时间
                if (!contents.isEmpty()) {
                    Object processedTime = contents.get(0).getMetadata().get("processed_time");
                    docInfo.put("processedTime", processedTime);
                }
                
                return docInfo;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 从全局知识库中移除指定文档
     * @param fileName 文件名
     * @return 是否成功移除
     */
    public boolean removeDocumentFromGlobalKnowledgeBase(String fileName) {
        boolean removed = globalKnowledgeBase.remove(fileName) != null;
        if (removed) {
            documentPaths.remove(fileName);
            log.info("已从全局知识库中移除文档: {}", fileName);
        }
        return removed;
    }
    
    /**
     * 获取指定聊天的所有内容
     * @param chatId 聊天会话ID
     * @return 内容列表
     */
    public List<PdfPageContent> getAllContent(String chatId) {
        return pdfContents.getOrDefault(chatId, Collections.emptyList());
    }
    
    /**
     * 移除指定聊天的内容
     * @param chatId 聊天会话ID
     */
    public void removeContent(String chatId) {
        pdfContents.remove(chatId);
        log.info("已移除聊天内容: {}", chatId);
    }
    
    /**
     * 检查是否有指定聊天的内容
     * @param chatId 聊天会话ID
     * @return 是否存在内容
     */
    public boolean hasContent(String chatId) {
        return pdfContents.containsKey(chatId) && !pdfContents.get(chatId).isEmpty();
    }
    
    /**
     * 获取全局知识库统计信息
     * @return 统计信息
     */
    public Map<String, Object> getGlobalKnowledgeBaseStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("documentCount", globalKnowledgeBase.size());
        
        int totalPages = globalKnowledgeBase.values().stream()
            .mapToInt(List::size)
            .sum();
        stats.put("totalPages", totalPages);
        
        long totalContentLength = globalKnowledgeBase.values().stream()
            .flatMap(List::stream)
            .mapToLong(content -> content.getContent().length())
            .sum();
        stats.put("totalContentLength", totalContentLength);
        
        return stats;
    }
    
    /**
     * 内容得分包装类
     */
    private static class ScoredContent {
        final PdfPageContent content;
        final double score;
        
        ScoredContent(PdfPageContent content, double score) {
            this.content = content;
            this.score = score;
        }
    }
} 