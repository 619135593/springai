/**
 * SpringAI 聊天助手 JavaScript
 * 实现聊天交互功能，支持普通和流式输出
 * 
 * @author SpringAI Team
 * @version 1.0.0
 */

/**
 * 聊天应用主类
 * 管理整个聊天界面的交互逻辑
 */
class ChatApp {
    /**
     * 构造函数 - 初始化聊天应用
     */
    constructor() {
        // DOM元素引用
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.streamMode = document.getElementById('streamMode');
        this.charCount = document.querySelector('.char-count');
        this.status = document.getElementById('status');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // 生成唯一的聊天会话ID
        this.chatId = this.generateChatId();
        
        // 初始化事件监听器
        this.initEventListeners();
        
        console.log('🤖 SpringAI 聊天助手已初始化，会话ID:', this.chatId);
    }

    /**
     * 初始化所有事件监听器
     */
    initEventListeners() {
        // 发送按钮点击事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // 输入框回车发送事件
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 输入框字符计数事件
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.autoResizeTextarea();
        });
    }

    /**
     * 生成唯一的聊天会话ID
     * @returns {string} 唯一的聊天ID
     */
    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 发送消息主方法
     * 处理用户输入并调用相应的发送方法
     */
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        try {
            // 禁用发送按钮
            this.setSendButtonState(false);
            
            // 添加用户消息到界面
            this.addMessage(message, 'user');
            
            // 清空输入框并重置状态
            this.clearInput();

            // 根据模式选择发送方式
            if (this.streamMode.checked) {
                await this.sendStreamMessage(message);
            } else {
                await this.sendNormalMessage(message);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            this.showError('发送消息失败，请检查网络连接或稍后重试');
        } finally {
            // 恢复发送按钮状态
            this.setSendButtonState(true);
        }
    }

    /**
     * 发送普通消息（非流式）
     * @param {string} message - 要发送的消息内容
     */
    async sendNormalMessage(message) {
        this.showLoading(true);
        
        try {
            const response = await fetch('/ai/chat/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `prompt=${encodeURIComponent(message)}`
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            this.addMessage(result, 'assistant');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 发送流式消息
     * @param {string} message - 要发送的消息内容
     */
    async sendStreamMessage(message) {
        // 创建助手消息容器
        const assistantMessage = this.addMessage('', 'assistant', true);
        const messageContent = assistantMessage.querySelector('.message-content p');
        
        try {
            const response = await fetch('/ai/chat/stream?' + new URLSearchParams({
                prompt: message,
                chatId: this.chatId
            }), {
                method: 'GET',
                headers: {
                    'Accept': 'text/html;charset=utf-8',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 处理流式响应
            await this.handleStreamResponse(response, messageContent);
            
            // 更新消息时间戳
            this.updateMessageTime(assistantMessage);
            
        } catch (error) {
            messageContent.textContent = '抱歉，获取回复时出现错误。请稍后重试。';
            messageContent.style.color = '#ef4444';
            throw error;
        }
    }

    /**
     * 处理流式响应数据
     * @param {Response} response - Fetch响应对象
     * @param {HTMLElement} messageContent - 消息内容DOM元素
     */
    async handleStreamResponse(response, messageContent) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            // 解码数据块
            buffer += decoder.decode(value, { stream: true });
            
            // 处理可能的多个数据块
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行
            
            // 逐行处理数据
            for (const line of lines) {
                if (line.trim()) {
                    messageContent.textContent += line;
                    this.scrollToBottom();
                }
            }
        }
        
        // 处理剩余的数据
        if (buffer.trim()) {
            messageContent.textContent += buffer;
            this.scrollToBottom();
        }
    }

    /**
     * 添加消息到聊天界面
     * @param {string} content - 消息内容
     * @param {string} type - 消息类型 ('user' | 'assistant')
     * @param {boolean} isStreaming - 是否为流式消息
     * @returns {HTMLElement} 创建的消息DOM元素
     */
    addMessage(content, type, isStreaming = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = type === 'user' ? '👤' : '🤖';
        const time = this.formatTime(new Date());
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${this.escapeHtml(content)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        
        if (!isStreaming) {
            this.scrollToBottom();
        }
        
        return messageDiv;
    }

    /**
     * 转义HTML特殊字符
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示错误消息
     * @param {string} message - 错误消息内容
     */
    showError(message) {
        this.addMessage(`❌ ${message}`, 'assistant');
    }

    /**
     * 设置发送按钮状态
     * @param {boolean} enabled - 是否启用按钮
     */
    setSendButtonState(enabled) {
        this.sendButton.disabled = !enabled;
        this.sendButton.innerHTML = enabled ? 
            '<span>发送</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/></svg>' :
            '<span>发送中...</span>';
    }

    /**
     * 显示或隐藏加载动画
     * @param {boolean} show - 是否显示加载动画
     */
    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.add('show');
            this.chatMessages.appendChild(this.loadingIndicator);
        } else {
            this.loadingIndicator.classList.remove('show');
        }
        this.scrollToBottom();
    }

    /**
     * 清空输入框并重置相关状态
     */
    clearInput() {
        this.messageInput.value = '';
        this.updateCharCount();
        this.autoResizeTextarea();
    }

    /**
     * 更新字符计数显示
     */
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = `${count}/2000`;
        
        // 根据字符数量调整颜色
        if (count > 1800) {
            this.charCount.style.color = '#ef4444';
        } else if (count > 1500) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '#94a3b8';
        }
    }

    /**
     * 自动调整输入框高度
     */
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    /**
     * 滚动聊天区域到底部
     */
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    /**
     * 格式化时间显示
     * @param {Date} date - 要格式化的日期
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) {
            return '刚刚';
        } else if (diffMins < 60) {
            return `${diffMins}分钟前`;
        } else if (diffMins < 1440) {
            const diffHours = Math.floor(diffMins / 60);
            return `${diffHours}小时前`;
        } else {
            return date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    /**
     * 更新消息的时间戳
     * @param {HTMLElement} messageElement - 消息DOM元素
     */
    updateMessageTime(messageElement) {
        const timeElement = messageElement.querySelector('.message-time');
        if (timeElement) {
            timeElement.textContent = this.formatTime(new Date());
        }
    }

    /**
     * 检查后端服务状态
     */
    async checkServiceStatus() {
        try {
            const response = await fetch('/ai/chat/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'prompt=ping'
            });
            
            if (response.ok) {
                this.updateStatus('在线', 'online');
            } else {
                this.updateStatus('离线', 'offline');
            }
        } catch (error) {
            this.updateStatus('离线', 'offline');
            console.warn('服务状态检查失败:', error.message);
        }
    }

    /**
     * 更新服务状态显示
     * @param {string} text - 状态文本
     * @param {string} status - 状态类型 ('online' | 'offline')
     */
    updateStatus(text, status) {
        this.status.textContent = text;
        this.status.className = `status-${status}`;
    }
}

/**
 * 应用初始化函数
 * 在DOM加载完成后执行
 */
function initApp() {
    const chatApp = new ChatApp();
    
    // 初始化服务状态检查
    chatApp.checkServiceStatus();
    
    // 定期检查服务状态（每30秒）
    setInterval(() => chatApp.checkServiceStatus(), 30000);
    
    // 注册全局快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+/ 快速聚焦到输入框
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            chatApp.messageInput.focus();
        }
    });
    
    console.log('🎉 SpringAI 聊天助手已就绪！');
}

// DOM内容加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp); 