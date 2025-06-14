# 🤖 SpringAI + 阿里云 OpenAI Chat Demos

这是一个基于 **SpringAI** 和 **阿里云 OpenAI 聊天模型** 的 AI 应用演示项目，涵盖了当前主流的四种 AI 开发模式，适合作为学习和项目原型开发的参考。

---

## 🧩 功能模块

### 1. 💬 聊天机器人
- 类似 ChatGPT 的通用对话机器人
- 使用 SpringAI 的标准对话接口实现

### 2. 🧸 哄哄模拟器（Prompt 工程）
- 提供"安慰、鼓励、陪伴"等特定角色对话
- 通过 Prompt 工程实现特定风格和语气

### 3. 🛎️ 智能客服机器人（Agent + Function Calling）
- 模拟真实客服处理流程
- 支持 Function Calling 和多轮任务式对话

### 4. 📄 ChatPDF 全局知识库（RAG：Retrieval-Augmented Generation）
- **🌟 核心特性**：全局知识库RAG系统，无需向量数据库
- **📚 文档管理**：支持PDF文档上传、解析和全局知识库管理
- **🔍 智能检索**：基于关键词匹配和相关性评分的文档检索
- **💬 跨文档问答**：AI可以基于所有已上传的PDF文档进行智能问答
- **📱 响应式设计**：现代化UI界面，支持桌面端和移动端
- **⚡ 流式响应**：实时流式AI回复，提升用户体验
- **🎨 美观滚动条**：自定义渐变滚动条，支持动态效果

#### ChatPDF 技术亮点
- **内存存储**：使用ConcurrentHashMap替代向量数据库，提高性能
- **文档解析**：基于SpringAI的PagePdfDocumentReader进行PDF解析
- **智能检索**：实现中英文关键词检索和相关性评分算法
- **全局知识库**：所有上传的PDF文档自动加入全局知识库
- **文档管理**：支持文档列表查看、删除、下载等操作
- **状态管理**：完整的上传进度、处理状态和错误处理机制

---

## 🛠 技术栈

- **语言：** Java 17+
- **框架：** Spring Boot + SpringAI
- **模型服务：** 阿里云百炼 OpenAI API / Ollama本地模型
- **RAG实现：** 内存存储 + 关键词检索（无需向量数据库）
- **前端技术：** HTML5 + CSS3 + JavaScript ES6+
- **文档处理：** SpringAI PagePdfDocumentReader
- **并发处理：** ConcurrentHashMap + 线程安全设计

---

## 🚀 快速开始

### 环境要求
- **Java**：17+
- **Maven**：3.6+
- **MySQL**：8.0.x
- **浏览器**：支持ES6+的现代浏览器

### 修改配置
请在 application.yml 中配置你的阿里云 API Key 和模型相关参数：

```yml
spring:
  application:
    name: spring-ai-chat
  ai:
    ollama:
      base-url: http://localhost:11434 # ollama服务地址，这是默认值
      chat:
        model: deepseek-r1:7b # 需要更改为自己的模型名称
        options:
          temperature: 0.8 # 模型温度，影响模型生成结果的随机性，越小越稳定
    openai:
      base-url: {引用的大模型url：如阿里百炼：https://dashscope.aliyuncs.com/compatible-mode}
      api-key: {自己的API-key}
      chat:
        options:
          model: {使用的模型名称}
      embedding:
        options:
          model: {向量模型名称}

# 文件上传配置
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB
```

**注意**：ChatPDF模块已升级为无向量数据库的RAG实现，使用内存存储提高性能。

## 数据库配置

### MySQL配置要求
- **版本**：MySQL 8.0.x
- **端口**：3306 (默认端口)
- **数据库名**：itheima
- **用户名**：root
- **密码**：hsp

### 数据库初始化
```sql
-- 1. 创建数据库
CREATE DATABASE itheima DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 创建表结构
mysql -h localhost -P 3306 -u root -p itheima < create_tables.sql

-- 3. 导入初始数据
mysql -h localhost -P 3306 -u root -p itheima < init_data.sql
```

## 启动项目
```bash
# 1. 克隆项目
git clone <repository-url>
cd SpringAI-ai-chat-master

# 2. 配置数据库和API密钥
# 编辑 src/main/resources/application.yml

# 3. 启动项目
mvn spring-boot:run

# 4. 访问应用
# 主页：http://localhost:8080
# ChatPDF：http://localhost:8080/pdf.html
```

---

## 📖 使用指南

### ChatPDF 使用流程

1. **访问ChatPDF页面**
   - 打开浏览器访问：`http://localhost:8080/pdf.html`

2. **上传PDF文档**
   - 点击"选择PDF文件"按钮或拖拽文件到上传区域
   - 支持最大50MB的PDF文件
   - 系统会自动解析文档并加入全局知识库

3. **开始智能问答**
   - 文档上传成功后，可以开始提问
   - AI会基于全局知识库中的所有文档进行回答
   - 支持跨文档检索和关联分析

4. **管理文档**
   - 查看已上传的文档列表
   - 支持文档下载和删除操作
   - 实时查看知识库统计信息

### 示例问题
- "总结所有文档的主要内容"
- "这些文档有什么共同点？"
- "帮我找到关于XXX的信息"
- "对比不同文档的观点"

---

## 🎨 界面特性

### 现代化UI设计
- **渐变背景**：蓝紫色渐变主题
- **毛玻璃效果**：backdrop-filter模糊效果
- **响应式布局**：适配桌面端和移动端
- **动画效果**：平滑过渡和悬停动画

### 自定义滚动条
- **渐变样式**：主题色渐变滚动条
- **交互效果**：悬停缩放和发光效果
- **动态透明度**：滚动时自动调节透明度
- **跨浏览器兼容**：支持Webkit和Firefox

### 状态指示器
- **实时状态**：连接状态和文档状态显示
- **进度条**：文档上传和处理进度
- **通知系统**：成功、错误、警告通知

---

## 🔧 技术架构

### 后端架构
```
├── controller/
│   ├── PdfController.java          # PDF相关API控制器
│   └── ...
├── service/
│   ├── PdfContentService.java      # PDF内容处理服务
│   └── ...
├── repository/
│   ├── LocalPdfFileRepository.java # 本地文件存储
│   └── ...
└── config/
    ├── CommonConfiguration.java    # 通用配置
    └── ...
```

### 前端架构
```
├── static/
│   ├── pdf.html                    # ChatPDF主页面
│   ├── pdf-style.css              # ChatPDF样式文件
│   ├── pdf-script.js              # ChatPDF交互逻辑
│   └── ...
```

### 核心组件

#### PdfContentService
- **全局知识库管理**：ConcurrentHashMap存储所有文档
- **关键词检索**：中英文分词和相关性评分
- **文档解析**：SpringAI PagePdfDocumentReader集成
- **线程安全**：并发访问安全保障

#### PdfChatManager (前端)
- **状态管理**：文件上传、聊天状态管理
- **事件处理**：拖拽上传、滚动特效
- **API交互**：流式聊天、文件上传
- **UI更新**：动态界面更新和通知

---

## 🚀 性能优化

### 后端优化
- **内存存储**：避免向量数据库I/O开销
- **并发处理**：ConcurrentHashMap提高并发性能
- **流式响应**：实时返回AI回复，提升用户体验
- **文件缓存**：智能文件缓存机制

### 前端优化
- **懒加载**：按需加载文档列表
- **防抖处理**：输入防抖和滚动优化
- **内存管理**：及时清理事件监听器
- **CSS优化**：硬件加速和GPU渲染

---

## 🐛 故障排除

### 常见问题

1. **文件上传失败**
   - 检查文件大小是否超过50MB
   - 确认文件格式为PDF
   - 检查网络连接状态

2. **AI回复异常**
   - 验证API密钥配置
   - 检查模型服务可用性
   - 查看后端日志错误信息

3. **界面显示问题**
   - 清除浏览器缓存
   - 检查浏览器兼容性
   - 确认JavaScript已启用

### 日志查看
```bash
# 查看应用日志
tail -f logs/spring-ai-chat.log

# 查看错误日志
grep ERROR logs/spring-ai-chat.log
```

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发环境搭建
1. Fork项目到个人仓库
2. 克隆到本地开发环境
3. 创建功能分支进行开发
4. 提交Pull Request

### 代码规范
- 遵循Java编码规范
- 添加必要的注释和文档
- 确保代码测试覆盖率
- 前端代码使用JSDoc注释

---

## 📄 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

感谢以下开源项目的支持：
- [Spring AI](https://spring.io/projects/spring-ai)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [阿里云百炼](https://www.aliyun.com/product/bailian)


---

**🌟 如果这个项目对您有帮助，请给个Star支持一下！**
