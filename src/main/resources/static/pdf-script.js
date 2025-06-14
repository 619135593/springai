/**
 * ChatPDF智能问答JavaScript逻辑
 * 负责文件上传、聊天交互和状态管理
 * 
 * @description 专业的PDF智能问答前端逻辑实现
 * @author SpringAI Team
 * @version 2.0
 */

/**
 * PDF聊天管理器类
 * 处理整个PDF聊天应用的生命周期和交互逻辑
 */
class PdfChatManager {
    /**
     * 构造函数 - 初始化PDF聊天管理器
     */
    constructor() {
        /** @type {string} 聊天会话ID */
        this.chatId = this.generateChatId();
        
        /** @type {boolean} 是否正在发送消息 */
        this.isSending = false;
        
        /** @type {boolean} 是否正在上传文件 */
        this.isUploading = false;
        
        /** @type {boolean} 文件是否已上传 */
        this.fileUploaded = false;
        
        /** @type {string} 当前文档名称 */
        this.currentFileName = '';
        
        /** @type {number} 当前文档大小 */
        this.currentFileSize = 0;
        
        // 初始化界面元素和事件监听
        this.initializeElements();
        this.bindEvents();
        
        console.log('📄 PdfChatManager初始化完成，会话ID:', this.chatId);
    }
    
    /**
     * 生成唯一的聊天会话ID
     * @returns {string} 聊天会话ID
     */
    generateChatId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `pdf_${timestamp}_${random}`;
    }
    
    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 状态指示器
        this.chatStatus = document.getElementById('chatStatus');
        this.fileStatus = document.getElementById('fileStatus');
        
        // 文档区域
        this.documentSection = document.getElementById('documentSection');
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadButton = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.documentInfo = document.getElementById('documentInfo');
        this.docName = document.getElementById('docName');
        this.docSize = document.getElementById('docSize');
        
        // 全局知识库区域
        this.globalKnowledgeBase = document.getElementById('globalKnowledgeBase');
        this.kbStats = document.getElementById('kbStats');
        this.documentsList = document.getElementById('documentsList');
        this.toggleDocsButton = document.getElementById('toggleDocsButton');
        
        // 聊天区域
        this.chatSection = document.getElementById('chatSection');
        this.chatMessages = document.getElementById('chatMessages');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        
        // 输入区域
        this.inputArea = document.getElementById('inputArea');
        this.messageInput = document.getElementById('messageInput');
        this.charCount = document.getElementById('charCount');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // 通知容器
        this.notificationContainer = document.getElementById('notificationContainer');
        
        // 检查必要元素是否存在
        this.validateElements();
    }
    
    /**
     * 验证必要DOM元素是否存在
     */
    validateElements() {
        const requiredElements = [
            'chatStatus', 'fileStatus', 'documentSection', 'uploadArea', 
            'uploadButton', 'fileInput', 'uploadProgress', 'progressFill', 'chatSection',
            'chatMessages', 'messageInput', 'sendButton'
        ];
        
        for (const elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                console.error(`❌ 缺少必要DOM元素: ${elementId}`);
            }
        }
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 文件选择事件
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // 上传按钮点击事件
        if (this.uploadButton) {
            this.uploadButton.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡
                this.fileInput?.click();
            });
        }
        
        // 上传区域点击事件（只在非按钮区域）
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', (e) => {
                // 如果点击的是按钮或按钮内的元素，不触发
                if (e.target.closest('.upload-button')) {
                    return;
                }
                this.fileInput?.click();
            });
            
            // 拖拽上传事件
            this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        }
        
        // 输入框事件
        if (this.messageInput) {
            this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
            this.messageInput.addEventListener('input', () => this.updateCharCount());
            this.messageInput.addEventListener('paste', () => {
                setTimeout(() => this.updateCharCount(), 0);
            });
        }
        
        // 发送按钮事件
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        // 滚动条特效事件
        this.bindScrollbarEffects();
        
        // 页面可见性变化事件
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.fileUploaded) {
                console.log('🔄 页面重新激活，检查连接状态');
            }
        });
    }
    
    /**
     * 绑定滚动条特效事件
     */
    bindScrollbarEffects() {
        if (!this.chatMessages) return;
        
        let scrollTimer = null;
        
        // 滚动开始时添加特效类
        this.chatMessages.addEventListener('scroll', () => {
            // 添加滚动中的类名
            this.chatMessages.classList.add('scrolling');
            
            // 清除之前的定时器
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            
            // 设置新的定时器，滚动停止后移除特效类
            scrollTimer = setTimeout(() => {
                this.chatMessages.classList.remove('scrolling');
            }, 500);
        });
        
        // 鼠标进入聊天区域时增强滚动条显示
        this.chatMessages.addEventListener('mouseenter', () => {
            this.chatMessages.style.setProperty('--scrollbar-opacity', '1');
        });
        
        // 鼠标离开聊天区域时恢复滚动条显示
        this.chatMessages.addEventListener('mouseleave', () => {
            this.chatMessages.style.setProperty('--scrollbar-opacity', '0.7');
        });
        
        console.log('✨ 滚动条特效事件绑定完成');
    }
    
    /**
     * 更新状态指示器
     * @param {string} chatStatus 聊天状态
     * @param {string} fileStatus 文件状态
     */
    updateStatus(chatStatus, fileStatus) {
        if (this.chatStatus) this.chatStatus.textContent = chatStatus;
        if (this.fileStatus) this.fileStatus.textContent = fileStatus;
        
        console.log(`📊 状态更新 - 连接: ${chatStatus}, 文档: ${fileStatus}`);
    }
    
    /**
     * 处理文件选择事件
     * @param {Event} event 文件选择事件
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('📁 用户选择文件:', file.name);
            this.uploadFile(file);
        }
    }
    
    /**
     * 处理拖拽悬停事件
     * @param {DragEvent} event 拖拽事件
     */
    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea?.classList.add('dragover');
    }
    
    /**
     * 处理拖拽离开事件
     * @param {DragEvent} event 拖拽事件
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea?.classList.remove('dragover');
    }
    
    /**
     * 处理文件拖拽放置事件
     * @param {DragEvent} event 拖拽事件
     */
    handleFileDrop(event) {
        event.preventDefault();
        this.uploadArea?.classList.remove('dragover');
        
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            console.log('📁 用户拖拽文件:', file.name);
            this.uploadFile(file);
        }
    }
    
    /**
     * 上传PDF文件到服务器
     * @param {File} file 要上传的PDF文件
     */
    async uploadFile(file) {
        // 防止重复上传
        if (this.isUploading) {
            console.log('⚠️ 文件正在上传中，忽略重复请求');
            return;
        }
        
        // 如果已经上传了文件，询问是否替换
        if (this.fileUploaded) {
            if (!confirm('检测到已有PDF文档，是否要替换为新文档？')) {
                return;
            }
        }
        
        console.log('📤 开始上传文件:', file.name, '大小:', this.formatFileSize(file.size));
        
        // 文件类型验证
        if (file.type !== 'application/pdf') {
            this.showNotification('error', '文件格式错误', '只能上传PDF格式的文件！');
            return;
        }
        
        // 文件大小验证（50MB限制）
        if (file.size > 50 * 1024 * 1024) {
            this.showNotification('error', '文件过大', '文件大小不能超过50MB！');
            return;
        }
        
        // 文件名验证
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            this.showNotification('error', '文件格式错误', '请选择有效的PDF文件！');
            return;
        }
        
        // 设置上传状态
        this.isUploading = true;
        
        try {
            // 显示上传进度
            this.showUploadProgress();
            this.updateStatus('连接中', '处理中');
            
            // 构建上传数据
            const formData = new FormData();
            formData.append('file', file);
            
            console.log('🚀 发送上传请求到服务器，chatId:', this.chatId);
            
            // 发送上传请求
            const response = await fetch(`/ai/pdf/upload/${this.chatId}`, {
                method: 'POST',
                body: formData
            });
            
            // 检查HTTP状态码
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📤 服务器响应:', result);
            
            // 检查响应结构
            if (typeof result !== 'object' || result === null) {
                throw new Error('服务器返回了无效的响应格式');
            }
            
            // 根据Result类的结构判断成功/失败 (ok=1表示成功，ok=0表示失败)
            if (result.ok === 1) {
                // 上传成功
                this.fileUploaded = true;
                this.currentFileName = file.name;
                this.currentFileSize = file.size;
                
                this.showChatSection(file);
                this.updateStatus('已连接', '已上传');
                this.showNotification('success', '上传成功', result.msg || '文件上传并处理成功！');
                console.log('✅ 文件上传成功:', file.name);
                
            } else {
                // 上传失败
                const errorMsg = result.msg || '上传失败，请稍后重试';
                this.showNotification('error', '上传失败', errorMsg);
                this.hideUploadProgress();
                this.updateStatus('未开始', '上传失败');
                console.error('❌ 文件上传失败:', errorMsg);
            }
            
        } catch (error) {
            console.error('💥 上传请求失败:', error);
            
            let errorMessage = '上传失败，请检查网络连接';
            
            // 根据错误类型提供更具体的错误信息
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = '网络连接失败，请检查网络设置';
            } else if (error.message.includes('HTTP错误')) {
                errorMessage = `服务器错误: ${error.message}`;
            } else if (error.message.includes('JSON')) {
                errorMessage = '服务器响应格式错误，请联系管理员';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showNotification('error', '上传失败', errorMessage);
            this.hideUploadProgress();
            this.updateStatus('未开始', '上传失败');
            
        } finally {
            // 重置上传状态
            this.isUploading = false;
        }
    }
    
    /**
     * 显示上传进度动画
     */
    showUploadProgress() {
        if (this.uploadArea) this.uploadArea.style.display = 'none';
        if (this.uploadProgress) this.uploadProgress.style.display = 'block';
        
        // 模拟进度条动画
        let progress = 0;
        this.progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(this.progressInterval);
            }
            if (this.progressFill) {
                this.progressFill.style.width = progress + '%';
            }
        }, 200);
        
        // 更新进度文本
        if (this.progressText) {
            const messages = [
                '解析PDF文档结构...',
                '提取文本内容...',
                '处理文档数据...',
                '优化检索索引...',
                '即将完成...'
            ];
            
            let messageIndex = 0;
            this.textInterval = setInterval(() => {
                if (messageIndex < messages.length) {
                    this.progressText.textContent = messages[messageIndex];
                    messageIndex++;
                } else {
                    clearInterval(this.textInterval);
                }
            }, 800);
        }
    }
    
    /**
     * 隐藏上传进度
     */
    hideUploadProgress() {
        if (this.uploadProgress) this.uploadProgress.style.display = 'none';
        if (this.uploadArea) this.uploadArea.style.display = 'block';
        if (this.progressFill) this.progressFill.style.width = '0%';
        
        // 清除定时器
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        if (this.textInterval) {
            clearInterval(this.textInterval);
            this.textInterval = null;
        }
    }
    
    /**
     * 显示聊天区域（上传成功后）
     * @param {File} file 上传的文件
     */
    showChatSection(file) {
        // 隐藏上传进度，显示文档信息
        this.hideUploadProgress();
        
        // 更新文档信息
        if (this.docName) this.docName.textContent = file.name;
        if (this.docSize) this.docSize.textContent = this.formatFileSize(file.size);
        
        // 显示文档信息区域
        if (this.uploadArea) this.uploadArea.style.display = 'none';
        if (this.documentInfo) this.documentInfo.style.display = 'flex';
        
        // 显示全局知识库状态
        this.showGlobalKnowledgeBase();
        
        // 隐藏欢迎消息，启用输入
        if (this.welcomeMessage) this.welcomeMessage.style.display = 'none';
        this.enableChatInput();
        
        // 添加欢迎消息到聊天历史
        this.addWelcomeMessage();
        
        // 聚焦输入框
        setTimeout(() => {
            if (this.messageInput) {
                this.messageInput.focus();
                this.updateCharCount();
            }
        }, 300);
        
        console.log('💬 切换到聊天模式');
    }
    
    /**
     * 显示全局知识库状态
     */
    async showGlobalKnowledgeBase() {
        if (!this.globalKnowledgeBase) return;
        
        // 显示全局知识库区域
        this.globalKnowledgeBase.style.display = 'block';
        
        // 加载知识库统计信息
        await this.loadKnowledgeBaseStats();
        
        // 加载文档列表
        await this.loadDocumentsList();
    }
    
    /**
     * 加载全局知识库统计信息
     */
    async loadKnowledgeBaseStats() {
        try {
            const response = await fetch('/ai/pdf/stats');
            const result = await response.json();
            
            if (result.ok === 1 && result.data && result.data.stats) {
                const stats = result.data.stats;
                const statsText = `共 ${stats.documentCount} 个文档，${stats.totalPages} 页内容`;
                if (this.kbStats) {
                    this.kbStats.textContent = statsText;
                }
                console.log('📊 知识库统计信息:', stats);
            } else {
                if (this.kbStats) {
                    this.kbStats.textContent = '暂无统计信息';
                }
            }
        } catch (error) {
            console.error('❌ 获取知识库统计信息失败:', error);
            if (this.kbStats) {
                this.kbStats.textContent = '获取统计信息失败';
            }
        }
    }
    
    /**
     * 加载文档列表
     */
    async loadDocumentsList() {
        if (!this.documentsList) return;
        
        try {
            // 显示加载状态
            this.documentsList.innerHTML = '<div class="loading-docs">正在加载文档列表...</div>';
            
            const response = await fetch('/ai/pdf/documents');
            const result = await response.json();
            
            if (result.ok === 1 && result.data && result.data.documents) {
                const documents = result.data.documents;
                this.renderDocumentsList(documents);
                console.log('📚 文档列表加载成功，共', documents.length, '个文档');
            } else {
                this.documentsList.innerHTML = '<div class="empty-docs">暂无文档</div>';
            }
        } catch (error) {
            console.error('❌ 获取文档列表失败:', error);
            this.documentsList.innerHTML = '<div class="empty-docs">获取文档列表失败</div>';
        }
    }
    
    /**
     * 渲染文档列表
     * @param {Array} documents 文档列表
     */
    renderDocumentsList(documents) {
        if (!this.documentsList) return;
        
        if (documents.length === 0) {
            this.documentsList.innerHTML = '<div class="empty-docs">暂无文档</div>';
            return;
        }
        
        const documentsHtml = documents.map(doc => {
            const processedTime = doc.processedTime ? 
                new Date(doc.processedTime).toLocaleString('zh-CN') : '未知';
            
            return `
                <div class="document-item" data-filename="${this.escapeHtml(doc.fileName)}">
                    <div class="doc-item-icon">📄</div>
                    <div class="doc-item-info">
                        <p class="doc-item-name" title="${this.escapeHtml(doc.fileName)}">${this.escapeHtml(doc.fileName)}</p>
                        <p class="doc-item-meta">${doc.pageCount} 页 • ${processedTime}</p>
                    </div>
                    <div class="doc-item-actions">
                        <button class="doc-action-button" onclick="downloadDocument('${this.escapeHtml(doc.fileName)}')" title="下载文档">
                            📥
                        </button>
                        <button class="doc-action-button delete" onclick="deleteDocument('${this.escapeHtml(doc.fileName)}')" title="删除文档">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.documentsList.innerHTML = documentsHtml;
    }
    
    /**
     * 切换文档列表显示/隐藏
     */
    toggleDocumentsList() {
        if (!this.documentsList || !this.toggleDocsButton) return;
        
        const isVisible = this.documentsList.style.display !== 'none';
        
        if (isVisible) {
            this.documentsList.style.display = 'none';
            this.toggleDocsButton.textContent = '显示列表 ▼';
        } else {
            this.documentsList.style.display = 'block';
            this.toggleDocsButton.textContent = '隐藏列表 ▲';
        }
    }
    
    /**
     * 刷新全局知识库
     */
    async refreshKnowledgeBase() {
        try {
            this.showNotification('info', '正在刷新', '重新加载知识库信息...');
            
            // 刷新统计信息
            await this.loadKnowledgeBaseStats();
            
            // 刷新文档列表
            await this.loadDocumentsList();
            
            this.showNotification('success', '刷新成功', '知识库信息已更新');
            console.log('🔄 知识库信息刷新完成');
            
        } catch (error) {
            console.error('❌ 刷新知识库失败:', error);
            this.showNotification('error', '刷新失败', '无法刷新知识库信息');
        }
    }
    
    /**
     * 删除文档
     * @param {string} fileName 文件名
     */
    async deleteDocument(fileName) {
        if (!confirm(`确定要删除文档 "${fileName}" 吗？\n删除后将从全局知识库中移除该文档。`)) {
            return;
        }
        
        try {
            const response = await fetch(`/ai/pdf/documents/${encodeURIComponent(fileName)}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.ok === 1) {
                this.showNotification('success', '删除成功', `文档 "${fileName}" 已从知识库中移除`);
                // 刷新文档列表
                await this.loadDocumentsList();
                await this.loadKnowledgeBaseStats();
                console.log('🗑️ 文档删除成功:', fileName);
            } else {
                this.showNotification('error', '删除失败', result.msg || '删除文档失败');
            }
            
        } catch (error) {
            console.error('❌ 删除文档失败:', error);
            this.showNotification('error', '删除失败', '网络错误，删除文档失败');
        }
    }
    
    /**
     * 启用聊天输入
     */
    enableChatInput() {
        if (this.messageInput) {
            this.messageInput.disabled = false;
            this.messageInput.placeholder = '请输入您的问题，我会基于PDF文档内容为您解答...';
        }
        if (this.sendButton) this.sendButton.disabled = false;
        
        // 启用清空按钮
        const clearButton = document.querySelector('.clear-button');
        if (clearButton) clearButton.disabled = false;
    }
    
    /**
     * 禁用聊天输入
     */
    disableChatInput() {
        if (this.messageInput) {
            this.messageInput.disabled = true;
            this.messageInput.placeholder = '请先上传PDF文档后再进行提问...';
            this.messageInput.value = '';
        }
        if (this.sendButton) this.sendButton.disabled = true;
        
        // 禁用清空按钮
        const clearButton = document.querySelector('.clear-button');
        if (clearButton) clearButton.disabled = true;
        
        this.updateCharCount();
    }
    
    /**
     * 添加欢迎消息到聊天历史
     */
    addWelcomeMessage() {
        if (!this.chatMessages) return;
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message system-message';
        welcomeDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">
                    <h3>🎯 PDF文档已上传成功！</h3>
                    <div class="feature-list">
                        <div class="feature-item">
                            <span class="feature-icon">📄</span>
                            <span>您的PDF文档已成功解析并加入全局知识库</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🌐</span>
                            <span>现在可以基于所有已上传的PDF文档进行问答</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🔍</span>
                            <span>AI会从全局知识库中检索最相关的内容回答您的问题</span>
                        </div>
                    </div>
                    <div class="example-questions">
                        <p><strong>💭 示例问题：</strong></p>
                        <div class="question-tags">
                            <span class="question-tag" onclick="fillQuestion(this)">总结所有文档的主要内容</span>
                            <span class="question-tag" onclick="fillQuestion(this)">这些文档有什么共同点？</span>
                            <span class="question-tag" onclick="fillQuestion(this)">帮我找到关于XXX的信息</span>
                            <span class="question-tag" onclick="fillQuestion(this)">对比不同文档的观点</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(welcomeDiv);
        this.scrollToBottom();
    }
    
    /**
     * 格式化文件大小显示
     * @param {number} bytes 字节数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 处理键盘事件
     * @param {KeyboardEvent} e 键盘事件对象
     */
    handleKeyDown(e) {
        // Enter键发送消息（不包含Shift+Enter）
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
        
        // Ctrl/Cmd + Enter也可以发送消息
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    /**
     * 更新字符计数显示
     */
    updateCharCount() {
        if (!this.messageInput || !this.charCount) return;
        
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/1000`;
        
        // 字符数颜色提示
        if (length > 900) {
            this.charCount.style.color = '#e17055';
        } else if (length > 800) {
            this.charCount.style.color = '#f39c12';
        } else {
            this.charCount.style.color = '#999';
        }
        
        // 自动调整输入框高度
        this.autoResizeTextarea();
    }
    
    /**
     * 自动调整文本域高度
     */
    autoResizeTextarea() {
        if (!this.messageInput) return;
        
        this.messageInput.style.height = 'auto';
        const scrollHeight = this.messageInput.scrollHeight;
        const maxHeight = 120; // 最大高度
        
        this.messageInput.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
    
    /**
     * 发送消息到AI
     */
    async sendMessage() {
        if (!this.messageInput) return;
        
        const message = this.messageInput.value.trim();
        
        // 检查消息是否为空
        if (!message || this.isSending) {
            return;
        }
        
        // 检查文件是否已上传
        if (!this.fileUploaded) {
            this.showNotification('warning', '请先上传PDF', '请先上传PDF文件后再进行提问！');
            return;
        }
        
        console.log('💬 用户发送消息:', message);
        
        // 添加用户消息到界面
        this.addUserMessage(message);
        
        // 清空输入框
        this.messageInput.value = '';
        this.updateCharCount();
        
        // 设置发送状态
        this.isSending = true;
        if (this.sendButton) this.sendButton.disabled = true;
        this.showLoading();
        
        try {
            // 发送消息到后端并处理流式响应
            await this.sendToAI(message);
            console.log('✅ 消息发送完成');
            
        } catch (error) {
            console.error('💥 发送消息失败:', error);
            this.addSystemMessage('❌ 发送失败，请检查网络连接或稍后重试。');
            
        } finally {
            // 恢复发送状态
            this.isSending = false;
            if (this.sendButton) this.sendButton.disabled = false;
            this.hideLoading();
        }
    }
    
    /**
     * 发送消息到AI并处理流式响应
     * @param {string} message 用户消息
     */
    async sendToAI(message) {
        const url = `/ai/pdf/chat?prompt=${encodeURIComponent(message)}&chatId=${this.chatId}`;
        
        console.log('🚀 发送AI请求:', url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html;charset=utf-8'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            if (!response.body) {
                throw new Error('Response body is null');
            }
            
            // 创建AI消息容器
            const aiMessageDiv = this.createAIMessage();
            if (!aiMessageDiv) {
                throw new Error('Failed to create AI message container');
            }
            
            const messageTextElement = aiMessageDiv.querySelector('.message-text');
            if (!messageTextElement) {
                throw new Error('Failed to find message text element');
            }
            
            // 读取流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullResponse = '';
            
            console.log('📡 开始接收AI流式响应...');
            
            // 处理流式数据
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('📡 AI响应接收完成');
                    break;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                
                // 实时更新消息内容 - 使用纯文本避免HTML解析问题
                messageTextElement.textContent = fullResponse;
                
                // 滚动到底部
                this.scrollToBottom();
            }
            
            // 最终处理响应内容 - 应用格式化
            if (fullResponse.trim()) {
                messageTextElement.innerHTML = this.formatAIResponse(fullResponse);
            } else {
                messageTextElement.textContent = '抱歉，我暂时无法回答这个问题。请尝试重新描述您的问题。';
            }
            
            this.scrollToBottom();
            
        } catch (error) {
            console.error('💥 AI请求失败:', error);
            // 如果出错，显示错误消息
            this.addSystemMessage('❌ 对话处理失败，请稍后重试：' + error.message);
            throw error;
        }
    }
    
    /**
     * 格式化AI响应内容
     * @param {string} response AI响应文本
     * @returns {string} 格式化后的HTML
     */
    formatAIResponse(response) {
        if (!response) return '';
        
        // 转义HTML特殊字符
        let formatted = this.escapeHtml(response);
        
        // 处理换行
        formatted = formatted.replace(/\n/g, '<br>');
        
        // 处理粗体文本（**文本**）
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理页码引用（第X页）
        formatted = formatted.replace(/(第\s*\d+\s*页)/g, '<span style="background: rgba(102, 126, 234, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600;">$1</span>');
        
        return formatted;
    }
    
    /**
     * 添加用户消息到聊天界面
     * @param {string} message 用户消息内容
     */
    addUserMessage(message) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    /**
     * 创建AI消息元素
     * @returns {HTMLElement} 消息DOM元素
     */
    createAIMessage() {
        if (!this.chatMessages) {
            console.error('❌ chatMessages元素不存在');
            return null;
        }
        
        try {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">正在思考中...</div>
                </div>
            `;
            
            this.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
            
            console.log('✅ AI消息容器创建成功');
            return messageDiv;
            
        } catch (error) {
            console.error('❌ 创建AI消息失败:', error);
            return null;
        }
    }
    
    /**
     * 添加系统消息
     * @param {string} message 系统消息内容
     */
    addSystemMessage(message) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    /**
     * 清空聊天记录
     */
    clearChat() {
        if (!this.chatMessages) return;
        
        if (confirm('确定要清空聊天记录吗？')) {
            // 保留欢迎消息，清空其他消息
            const welcomeMessage = this.chatMessages.querySelector('.system-message');
            this.chatMessages.innerHTML = '';
            
            if (welcomeMessage) {
                this.chatMessages.appendChild(welcomeMessage);
            }
            
            console.log('🗑️ 聊天记录已清空');
            this.showNotification('success', '操作成功', '聊天记录已清空');
        }
    }
    
    /**
     * 更换文档
     */
    changeDocument() {
        // 重置状态
        this.fileUploaded = false;
        this.isUploading = false;
        this.currentFileName = '';
        this.currentFileSize = 0;
        
        // 清空文件输入
        if (this.fileInput) {
            this.fileInput.value = '';
        }
        
        // 重置文档区域状态
        if (this.uploadProgress) this.uploadProgress.style.display = 'none';
        if (this.documentInfo) this.documentInfo.style.display = 'none';
        if (this.globalKnowledgeBase) this.globalKnowledgeBase.style.display = 'none';
        if (this.uploadArea) this.uploadArea.style.display = 'block';
        
        // 显示欢迎消息，禁用输入
        if (this.welcomeMessage) this.welcomeMessage.style.display = 'block';
        this.disableChatInput();
        
        // 清空聊天记录（保留欢迎消息）
        this.clearChatHistory();
        
        // 重置状态指示器
        this.updateStatus('未开始', '未上传');
        
        // 生成新的会话ID
        this.chatId = this.generateChatId();
        
        console.log('🔄 更换文档，新会话ID:', this.chatId);
        this.showNotification('success', '操作成功', '已重置，请上传新的PDF文档');
    }
    
    /**
     * 清空聊天历史（保留欢迎消息）
     */
    clearChatHistory() {
        if (!this.chatMessages) return;
        
        // 移除除欢迎消息外的所有消息
        const messages = this.chatMessages.querySelectorAll('.message:not(.welcome-message)');
        messages.forEach(message => message.remove());
        
        console.log('🗑️ 聊天历史已清空');
    }
    
    /**
     * 显示加载指示器
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'flex';
        }
    }
    
    /**
     * 隐藏加载指示器
     */
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }
    
    /**
     * 滚动聊天区域到底部
     */
    scrollToBottom() {
        if (this.chatMessages) {
            // 确保DOM更新后再滚动
            requestAnimationFrame(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            });
        }
    }
    
    /**
     * 转义HTML特殊字符
     * @param {string} unsafe 不安全的字符串
     * @returns {string} 转义后的安全字符串
     */
    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    /**
     * 显示通知消息
     * @param {string} type 通知类型: success, error, warning, info
     * @param {string} title 通知标题
     * @param {string} message 通知消息
     * @param {number} duration 显示时长（毫秒），默认4000ms
     */
    showNotification(type = 'info', title = '', message = '', duration = 4000) {
        if (!this.notificationContainer) return;
        
        // 图标映射
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                <div class="notification-title">${this.escapeHtml(title)}</div>
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // 添加到容器
        this.notificationContainer.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        console.log(`📢 显示通知 [${type}] ${title}: ${message}`);
    }
}

// 全局工具函数

/**
 * 填充示例问题到输入框
 * @param {HTMLElement} element 被点击的问题标签
 */
function fillQuestion(element) {
    if (!element || !window.pdfChatManager) return;
    
    const question = element.textContent;
    const messageInput = document.getElementById('messageInput');
    
    if (messageInput) {
        messageInput.value = question;
        messageInput.focus();
        window.pdfChatManager.updateCharCount();
        
        console.log('💡 填充示例问题:', question);
    }
}

/**
 * 返回首页
 */
function backToHomePage() {
    if (confirm('确定要返回首页吗？当前对话记录将会保留。')) {
        window.location.href = '/';
    }
}

/**
 * 更换文档
 */
function changeDocument() {
    if (window.pdfChatManager) {
        window.pdfChatManager.changeDocument();
    }
}

/**
 * 清空对话
 */
function clearChat() {
    if (window.pdfChatManager) {
        window.pdfChatManager.clearChat();
    }
}

/**
 * 发送消息
 */
function sendMessage() {
    if (window.pdfChatManager) {
        window.pdfChatManager.sendMessage();
    }
}

/**
 * 切换文档列表显示
 */
function toggleDocumentsList() {
    if (window.pdfChatManager) {
        window.pdfChatManager.toggleDocumentsList();
    }
}

/**
 * 刷新全局知识库
 */
function refreshKnowledgeBase() {
    if (window.pdfChatManager) {
        window.pdfChatManager.refreshKnowledgeBase();
    }
}

/**
 * 删除文档
 * @param {string} fileName 文件名
 */
function deleteDocument(fileName) {
    if (window.pdfChatManager) {
        window.pdfChatManager.deleteDocument(fileName);
    }
}

/**
 * 下载文档
 * @param {string} fileName 文件名
 */
function downloadDocument(fileName) {
    try {
        // 使用当前chatId或创建临时ID来下载文档
        const pdfChatManager = window.pdfChatManager;
        if (pdfChatManager && pdfChatManager.chatId) {
            // 创建一个临时的下载链接
            const link = document.createElement('a');
            link.href = `/ai/pdf/file/${pdfChatManager.chatId}`;
            link.download = fileName;
            link.target = '_blank';
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('📥 开始下载文档:', fileName);
        } else {
            console.warn('无法下载文档：未找到有效的chatId');
        }
    } catch (error) {
        console.error('下载文档失败:', error);
    }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 ChatPDF页面DOM加载完成');
    
    // 检查必要的DOM元素
    const requiredElements = ['documentSection', 'chatSection', 'messageInput', 'chatMessages', 'uploadButton'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ 缺少必要的DOM元素:', missingElements);
        return;
    }
    
    // 验证聊天消息容器
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        console.log('✅ 聊天消息容器找到，当前样式:');
        console.log('  - 高度:', chatMessages.clientHeight);
        console.log('  - 滚动高度:', chatMessages.scrollHeight);
        console.log('  - overflow-y:', window.getComputedStyle(chatMessages).overflowY);
        
        // 测试滚动功能
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            console.log('✅ 滚动测试完成');
        }, 100);
    }
    
    // 初始化PDF聊天管理器
    try {
        window.pdfChatManager = new PdfChatManager();
        console.log('✅ ChatPDF应用初始化成功');
        
        // 验证初始化后的状态
        if (window.pdfChatManager.chatMessages) {
            console.log('✅ PdfChatManager中的chatMessages引用正常');
        } else {
            console.error('❌ PdfChatManager中的chatMessages引用失败');
        }
        
        // 初始化时检查全局知识库状态
        setTimeout(async () => {
            try {
                const response = await fetch('/ai/pdf/stats');
                const result = await response.json();
                
                if (result.ok === 1 && result.data && result.data.stats && result.data.stats.documentCount > 0) {
                    console.log('🌐 检测到全局知识库中有文档，显示知识库状态');
                    window.pdfChatManager.showGlobalKnowledgeBase();
                }
            } catch (error) {
                console.log('📊 检查知识库状态时出错（这是正常的）:', error.message);
            }
        }, 1000);
        
    } catch (error) {
        console.error('💥 ChatPDF应用初始化失败:', error);
    }
});

// 页面卸载前的清理
window.addEventListener('beforeunload', function() {
    if (window.pdfChatManager) {
        // 清理定时器和资源
        if (window.pdfChatManager.progressInterval) {
            clearInterval(window.pdfChatManager.progressInterval);
        }
        if (window.pdfChatManager.textInterval) {
            clearInterval(window.pdfChatManager.textInterval);
        }
    }
});

// 错误处理
window.addEventListener('error', function(event) {
    console.error('💥 全局错误:', event.error);
    
    if (window.pdfChatManager) {
        window.pdfChatManager.showNotification(
            'error', 
            '系统错误', 
            '发生了意外错误，请刷新页面重试'
        );
    }
});

// 导出类供外部使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PdfChatManager };
} 