# 🤖 基于Spring AI的多功能对话式AI系统

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring AI](https://img.shields.io/badge/Spring%20AI-1.0.0--M6-blue.svg)](https://spring.io/projects/spring-ai)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

这是一个基于Spring AI框架的企业级多功能对话式AI系统，集成了**智能聊天助手**、**哄哄模拟器**、**智能客服**和**RAG文档问答**四大核心模块。项目采用最新的Spring AI 1.0.0-M6版本，结合阿里云百炼API，实现了从基础对话到复杂业务场景的全方位AI应用开发。

## 🌟 项目亮点

### 🎯 四大核心功能模块
- **💬 智能聊天助手** - 基于大语言模型的通用对话系统
- **🎮 哄哄模拟器** - 高级Prompt工程示例，实现角色扮演和游戏化交互
- **🛎️ 智能客服** - 企业级客服解决方案，支持Function Calling
- **📚 RAG文档问答** - 轻量级检索增强生成，无需向量数据库

### 🚀 技术特色
- **🔥 最新技术栈** - Spring AI 1.0.0-M6 + Spring Boot 3.4.4
- **⚡ 流式响应** - 基于Spring WebFlux的实时流式AI回复
- **🎨 现代化UI** - 响应式设计，支持桌面端和移动端
- **🔒 企业级架构** - 分层设计，高内聚低耦合
- **💾 轻量级RAG** - 内存存储替代向量数据库，降低部署复杂度

---

## 🧩 功能模块详解

### 1. 💬 智能聊天助手 (ChatController)
**技术实现：** 基于Spring AI的ChatClient，支持同步和异步调用模式
- ✨ **流式对话** - 实时返回AI生成内容，提升用户体验
- 🧠 **记忆功能** - 集成ChatMemory，支持多轮对话上下文

**核心API：**
```http
GET /ai/chat/stream?prompt=你好&chatId=chat_001
```

### 2. 🎮 哄哄模拟器 (GameController)
**技术实现：** 高级Prompt工程 + 系统角色设定
- 🎭 **角色扮演** - AI扮演女友，具有独特性格和话语风格
- 🎯 **游戏机制** - 基于对话质量的动态评分系统（20-100分）
- 📝 **示例学习** - 通过Few-shot Examples指导AI行为模式

**核心API：**
```http
GET /ai/game/chat?chatId=game_001&message=我今天工作很累
```

### 3. 🛎️ 智能客服 (CustomerServiceController)
**技术实现：** AI Agent + Function Calling + 企业业务流程
- 🤖 **AI代理** - 自主理解用户意图并执行相应业务流程
- 📞 **Function Calling** - 实时查询MySQL数据库获取课程信息
- 💼 **业务流程** - 标准化销售流程，从需求挖掘到成交转化
- 📊 **数据驱动** - 基于真实业务数据提供准确信息

**核心API：**
```http
GET /ai/service/chat?chatId=service_001&message=我想了解Java课程
```

### 4. 📚 RAG文档问答 (PdfController)
**技术实现：** 轻量级RAG + 全局知识库 + 智能检索
- 📄 **文档解析** - 基于Spring AI的PagePdfDocumentReader
- 🔍 **智能检索** - 关键词匹配 + 相关性评分算法
- 💾 **内存存储** - ConcurrentHashMap替代向量数据库
- 🌐 **全局知识库** - 跨文档检索和关联分析
- ⚡ **实时问答** - 流式响应，支持复杂查询

**核心API：**
```http
POST /ai/pdf/upload/{chatId}    # 上传PDF文档
GET /ai/pdf/chat?prompt=总结文档内容&chatId=pdf_001
GET /ai/pdf/documents           # 获取文档列表
```

---

## 🛠 技术架构

### 后端技术栈
```
📦 Spring Boot 3.4.4
├── 🧠 Spring AI 1.0.0-M6        # AI框架
├── 🌊 Spring WebFlux            # 响应式编程
├── 💾 MyBatis-Plus 3.5.7       # 数据访问
├── 🗄️ MySQL 8.0.x              # 数据库
├── 📄 Spring AI PDF Reader     # PDF文档处理
└── ☁️ 阿里云百炼API             # 大语言模型服务
```

### 项目结构
```
src/main/java/com/example/springaichat/
├── 🎮 controller/              # 控制器层
│   ├── ChatController.java     # 智能聊天
│   ├── GameController.java     # 哄哄模拟器  
│   ├── CustomerServiceController.java  # 智能客服
│   └── PdfController.java      # RAG文档问答
├── 🧠 service/                 # 服务层
│   ├── PdfContentService.java  # PDF内容处理
│   └── ...
├── 💾 repository/              # 数据访问层
├── 🏗️ config/                  # 配置类
└── 📋 entity/                  # 实体类

src/main/resources/
├── 🌐 static/                  # 前端静态资源
│   ├── index.html              # 智能聊天页面
│   ├── game.html               # 哄哄模拟器页面
│   ├── service.html            # 智能客服页面
│   └── pdf.html                # RAG文档问答页面
├── ⚙️ application.yml          # 应用配置
└── 🗄️ mapper/                  # MyBatis映射文件
```

---

## 🚀 快速开始

### 📋 环境要求
- **Java**: 17+ (推荐使用OpenJDK 17或更高版本)
- **Maven**: 3.6+ (依赖管理工具)
- **MySQL**: 8.0.x (数据库)
- **浏览器**: 支持ES6+的现代浏览器
- **内存**: 建议4GB以上可用内存

### 1️⃣ 克隆项目
```bash
git clone https://github.com/your-username/SpringAI-ai-chat-master.git
cd SpringAI-ai-chat-master
```

### 2️⃣ 数据库配置

#### 创建数据库
```sql
-- 1. 创建数据库
CREATE DATABASE itheima DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 使用数据库
USE itheima;
```

#### 初始化数据
```bash
# 方式一：使用提供的SQL脚本（推荐）
mysql -h localhost -P 3306 -u root -p itheima < 完整数据库初始化脚本.sql

# 方式二：分步执行
mysql -h localhost -P 3306 -u root -p itheima < create_tables.sql
mysql -h localhost -P 3306 -u root -p itheima < init_data.sql
```

### 3️⃣ 配置文件修改

编辑 `src/main/resources/application.yml`：

```yaml
spring:
  application:
    name: spring-ai-chat
  ai:
    openai:
      # 阿里云百炼API配置
      base-url: https://dashscope.aliyuncs.com/compatible-mode
      api-key: YOUR_API_KEY_HERE  # 🔑 替换为您的API密钥
      chat:
        options:
          model: qwen-plus           # 或 qwen-turbo、qwen-max
          temperature: 0.8
      embedding:
        options:
          model: text-embedding-v3
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/itheima?serverTimezone=Asia/Shanghai&useSSL=false&useUnicode=true&characterEncoding=utf-8
    username: root
    password: YOUR_DB_PASSWORD     # 🔑 替换为您的数据库密码
```

### 4️⃣ 获取API密钥

1. 访问 [阿里云百炼控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通"百炼大模型服务"
4. 创建API密钥
5. 将密钥配置到 `application.yml` 中

### 5️⃣ 启动应用

#### 使用Maven启动
```bash
# 安装依赖并启动
mvn clean install
mvn spring-boot:run
```

#### 使用IDE启动
1. 导入项目到IntelliJ IDEA或Eclipse
2. 等待Maven依赖下载完成
3. 运行 `SpringAiChatApplication.java` 主类

### 6️⃣ 访问应用

应用启动成功后，访问以下页面：

| 功能模块 | 访问地址 | 说明 |
|---------|---------|------|
| 🏠 **主页** | http://localhost:8080 | 项目首页和导航 |
| 💬 **智能聊天** | http://localhost:8080/index.html | 基础聊天功能 |
| 🎮 **哄哄模拟器** | http://localhost:8080/game.html | 游戏化交互体验 |
| 🛎️ **智能客服** | http://localhost:8080/service.html | 企业客服场景 |
| 📚 **RAG文档问答** | http://localhost:8080/pdf.html | PDF智能问答 |

---

## 📖 使用指南

### 💬 智能聊天助手使用

1. **访问页面**: 打开 http://localhost:8080/index.html
2. **开始对话**: 在输入框中输入问题，点击发送
3. **查看响应**: AI会以流式方式实时返回答案
4. **多轮对话**: 支持上下文记忆，可进行连续对话

**示例对话：**
```
用户: 请介绍一下Spring AI框架
AI: Spring AI是Spring生态系统中的一个新兴项目...
用户: 它与传统的AI开发有什么区别？
AI: 基于我们刚才的讨论，Spring AI的主要区别在于...
```

### 🎮 哄哄模拟器使用

1. **进入游戏**: 访问 http://localhost:8080/game.html
2. **查看状态**: 观察当前好感度（初始值20分）
3. **开始对话**: 尝试通过合适的话语提升好感度
4. **达成目标**: 将好感度提升到100分即可获胜

**使用技巧：**
- 😊 温柔体贴的话语会加分
- 😤 敷衍或冷淡的回复会扣分
- 🎯 目标是从20分提升到100分
- 💝 可以尝试道歉、撒娇、表达关心等策略

### 🛎️ 智能客服使用

1. **访问客服**: 打开 http://localhost:8080/service.html
2. **咨询课程**: 询问Java、Python等IT课程信息
3. **获取详情**: AI会从数据库查询实时课程信息
4. **预约试听**: 可以引导预约免费试听课程

**示例对话：**
```
用户: 我想了解Java课程
AI: 您好！我是光光，很高兴为您介绍我们的Java课程...
用户: 学费是多少？
AI: [AI自动查询数据库] 我们的Java全栈开发课程学费是...
```

### 📚 RAG文档问答使用

#### 上传文档
1. **进入页面**: 访问 http://localhost:8080/pdf.html
2. **选择文件**: 点击"选择PDF文件"或拖拽文件到上传区域
3. **等待处理**: 系统会自动解析PDF并加入全局知识库
4. **查看状态**: 观察上传进度和处理状态

#### 智能问答
1. **开始提问**: 文档上传成功后，在聊天框输入问题
2. **跨文档检索**: AI会在所有已上传的文档中搜索相关内容
3. **获得答案**: 基于文档内容生成准确、详细的回答

#### 文档管理
1. **查看列表**: 点击"查看文档列表"查看所有已上传文档
2. **下载文档**: 支持重新下载已上传的PDF文件
3. **删除文档**: 从知识库中移除不需要的文档

**高级查询示例：**
```
📝 "总结所有文档的主要内容"
📝 "这些文档有什么共同点？" 
📝 "帮我找到关于人工智能的信息"
📝 "对比不同文档对于某个概念的阐述"
📝 "根据文档内容，给我一些学习建议"
```

---

## 🔧 开发与定制

### API接口说明

#### 智能聊天接口
```http
# 流式聊天
GET /ai/chat/stream?prompt={message}&chatId={sessionId}

# 同步聊天（不推荐）
POST /ai/chat/call
Content-Type: application/json
{
  "prompt": "用户消息"
}
```

#### 哄哄模拟器接口
```http
# 游戏对话
GET /ai/game/chat?chatId={gameId}&message={userMessage}
```

#### 智能客服接口
```http
# 客服对话
GET /ai/service/chat?chatId={serviceId}&message={userMessage}
```

#### RAG文档问答接口
```http
# 上传PDF文档
POST /ai/pdf/upload/{chatId}
Content-Type: multipart/form-data
file: [PDF文件]

# 文档问答
GET /ai/pdf/chat?prompt={question}&chatId={sessionId}

# 获取文档列表
GET /ai/pdf/documents

# 删除文档
DELETE /ai/pdf/documents/{fileName}

# 获取知识库统计
GET /ai/pdf/stats
```

### 自定义配置

#### 模型参数调优
```yaml
spring:
  ai:
    openai:
      chat:
        options:
          model: qwen-plus        # 模型选择
          temperature: 0.8        # 创造性 (0.0-2.0)
          max-tokens: 2048        # 最大输出长度
          top-p: 0.9             # 核采样参数
```

#### 系统提示词定制
在相应的Controller中修改系统提示词：
```java
// 示例：修改客服系统提示
private static final String CUSTOMER_SERVICE_PROMPT = """
您是专业的IT课程顾问...
[在此处自定义您的提示词]
""";
```

### 数据库扩展

项目使用MyBatis-Plus进行数据访问，可以轻松扩展：

```java
// 示例：添加新的实体类
@Entity
@TableName("courses")
public class Course {
    @TableId
    private Long id;
    private String name;
    private BigDecimal price;
    // ... getters and setters
}

// 示例：添加新的Mapper
@Mapper
public interface CourseMapper extends BaseMapper<Course> {
    // 自定义查询方法
}
```

---

## 🐛 故障排除

### 常见问题解决

#### 1. 应用启动失败
**问题**: 启动时出现端口占用错误
```bash
Port 8080 was already in use
```
**解决方案**:
```bash
# 查找占用端口的进程
netstat -ano | findstr :8080
# 杀死进程（Windows）
taskkill /PID <PID> /F
# 或者修改端口
echo "server.port=8081" >> src/main/resources/application.yml
```

#### 2. 数据库连接失败
**问题**: 数据库连接超时或认证失败
```
Access denied for user 'root'@'localhost'
```
**解决方案**:
1. 检查MySQL服务是否启动
2. 验证用户名密码配置
3. 确认数据库已创建
```sql
-- 创建用户（如需要）
CREATE USER 'springai'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON itheima.* TO 'springai'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. API调用失败
**问题**: AI响应异常或超时
```
Request timeout or API key invalid
```
**解决方案**:
1. 检查API密钥是否正确配置
2. 验证网络连接和阿里云服务状态
3. 检查账户余额和调用限制

#### 4. PDF上传失败
**问题**: 文件上传报错或处理失败
**解决方案**:
1. 检查文件大小（限制50MB）
2. 确认文件格式为PDF
3. 检查uploads目录权限
```bash
# 创建上传目录
mkdir uploads
chmod 755 uploads
```

### 日志调试

#### 查看应用日志
```bash
# 实时查看日志
tail -f logs/spring-ai-chat.log

# 过滤错误日志
grep "ERROR" logs/spring-ai-chat.log

# 查看Spring AI相关日志
grep "spring.ai" logs/spring-ai-chat.log
```

#### 开启调试模式
在 `application.yml` 中添加：
```yaml
logging:
  level:
    com.example.springaichat: DEBUG
    org.springframework.ai: DEBUG
    org.springframework.web: DEBUG
```

---

## 🚀 性能优化

### 后端优化建议

#### 1. 内存使用优化
```java
// 在PdfContentService中合理设置缓存大小
private final Map<String, List<PdfPageContent>> pdfContents = 
    new ConcurrentHashMap<>(100); // 限制初始容量

// 定期清理过期缓存
@Scheduled(fixedRate = 3600000) // 每小时执行一次
public void cleanupExpiredCache() {
    // 清理逻辑
}
```

#### 2. 数据库连接池优化
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20        # 最大连接数
      minimum-idle: 5              # 最小空闲连接
      connection-timeout: 30000    # 连接超时
      idle-timeout: 600000         # 空闲超时
```

#### 3. AI API调用优化
```java
// 实现请求缓存
@Cacheable(value = "aiResponses", key = "#prompt")
public String getCachedResponse(String prompt) {
    return chatClient.prompt(prompt).call().content();
}
```

### 前端优化建议

#### 1. 静态资源优化
- 启用Gzip压缩
- 配置浏览器缓存
- 使用CDN加速（生产环境）

#### 2. 用户体验优化
- 实现请求防抖
- 添加加载状态提示
- 优化移动端适配

---

## 🤝 贡献指南

### 开发流程

1. **Fork项目** - 将项目Fork到您的GitHub账户
2. **创建分支** - 基于main分支创建功能分支
```bash
git checkout -b feature/your-feature-name
```
3. **开发功能** - 在本地进行开发和测试
4. **提交代码** - 遵循提交规范
```bash
git commit -m "feat: add new feature description"
```
5. **推送分支** - 推送到您的远程仓库
```bash
git push origin feature/your-feature-name
```
6. **创建PR** - 在GitHub上创建Pull Request

### 代码规范

#### Java代码规范
- 遵循阿里巴巴Java开发手册
- 使用JSDoc风格注释
- 保持方法长度合理（建议<50行）
- 使用有意义的变量和方法名

#### 前端代码规范
- 使用ES6+语法
- 保持代码格式一致
- 添加必要的注释
- 遵循语义化HTML

#### 提交信息规范
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型说明：
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具、辅助工具变动

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)，您可以自由使用、修改和分发代码。

---

## 🙏 致谢

### 开源项目
- [Spring AI](https://spring.io/projects/spring-ai) - 提供了优秀的AI集成框架
- [Spring Boot](https://spring.io/projects/spring-boot) - 简化了Java企业级开发
- [MyBatis-Plus](https://baomidou.com/) - 提供了便捷的数据访问功能

### 技术支持
- [阿里云百炼](https://www.aliyun.com/product/bailian) - 提供强大的大语言模型服务
- [通义千问](https://tongyi.aliyun.com/) - 优秀的中文大语言模型

---


<div align="center">

**⭐ 如果这个项目对您有帮助，请给个Star支持一下！**

Made with ❤️ by [Your Name]

</div>


---

