/**
 * 智能客服脚本
 * 简洁的客服聊天功能实现
 * @author SpringAI Team
 * @version 1.0.0
 */

/**
 * 客服管理器类
 * 管理客服对话和交互
 */
class SimpleServiceManager {
    /**
     * 构造函数，初始化客服管理器
     */
    constructor() {
        this.chatId = this.generateChatId();
        this.isStreaming = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAutoResize();
        
        console.log('🛎️ 智能客服已初始化，会话ID:', this.chatId);
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.quickReplies = document.getElementById('quickReplies');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.charCount = document.querySelector('.char-count');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 发送按钮点击事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // 输入框回车事件
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 输入框内容变化事件
        this.messageInput.addEventListener('input', () => this.updateCharCount());
    }

    /**
     * 初始化自动调整文本框高度
     */
    initializeAutoResize() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 80) + 'px';
        });
    }

    /**
     * 生成聊天会话ID
     * @returns {string} 会话ID
     */
    generateChatId() {
        return 'service_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 更新字符计数
     */
    updateCharCount() {
        const length = this.messageInput.value.length;
        if (this.charCount) {
            this.charCount.textContent = `${length}/500`;
            this.charCount.style.color = length > 450 ? '#ef4444' : '#999';
        }
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isStreaming) return;

        // 添加用户消息到聊天
        this.addMessage(message, 'user');
        
        // 清空输入框
        this.messageInput.value = '';
        this.updateCharCount();
        this.messageInput.style.height = 'auto';
        
        // 隐藏快速回复
        this.hideQuickReplies();
        
        try {
            await this.processServiceRequest(message);
        } catch (error) {
            console.error('❌ 发送消息失败:', error);
            this.addMessage('抱歉，我暂时无法处理您的请求，请稍后再试。', 'bot');
        }
    }

    /**
     * 处理客服请求
     * @param {string} message 用户消息
     */
    async processServiceRequest(message) {
        this.isStreaming = true;
        this.setSendButtonState(false);
        
        try {
            // 调用现有的客服接口
            const response = await fetch('/ai/service?' + new URLSearchParams({
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

            // 创建机器人消息容器
            const botMessageElement = this.addMessage('', 'bot');
            const contentElement = botMessageElement.querySelector('.message-text');
            
            // 处理流式响应
            await this.handleStreamResponse(response, contentElement);
            
        } catch (error) {
            console.error('❌ 客服请求失败:', error);
            this.addMessage('抱歉，客服系统暂时不可用，请稍后重试。', 'bot');
            throw error;
        } finally {
            this.isStreaming = false;
            this.setSendButtonState(true);
        }
    }

    /**
     * 处理流式响应
     * @param {Response} response 响应对象
     * @param {HTMLElement} contentElement 内容元素
     */
    async handleStreamResponse(response, contentElement) {
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
                    contentElement.textContent += line;
                    this.scrollToBottom();
                }
            }
        }
        
        // 处理剩余的数据
        if (buffer.trim()) {
            contentElement.textContent += buffer;
            this.scrollToBottom();
        }
    }

    /**
     * 添加消息到聊天记录
     * @param {string} content 消息内容
     * @param {string} type 消息类型 ('user' | 'bot')
     * @returns {HTMLElement} 消息元素
     */
    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const currentTime = this.formatTime(new Date());
        
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(content)}</div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(content)}</div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    /**
     * 转义HTML特殊字符
     * @param {string} text 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 格式化时间显示
     * @param {Date} date 要格式化的日期
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
        } else {
            return date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    /**
     * 滚动到聊天底部
     */
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 50);
    }

    /**
     * 设置发送按钮状态
     * @param {boolean} enabled 是否启用
     */
    setSendButtonState(enabled) {
        this.sendButton.disabled = !enabled;
        if (enabled) {
            this.sendButton.innerHTML = '<span>发送</span><span class="send-icon">📤</span>';
        } else {
            this.sendButton.innerHTML = '<span>发送中...</span>';
        }
    }

    /**
     * 隐藏快速回复
     */
    hideQuickReplies() {
        if (this.quickReplies) {
            // 如果已经有对话，隐藏快速回复
            const messages = this.chatMessages.querySelectorAll('.user-message');
            if (messages.length >= 1) {
                this.quickReplies.style.display = 'none';
            }
        }
    }
}

// 全局变量
let serviceManager;

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 智能客服页面初始化中...');
    serviceManager = new SimpleServiceManager();
    console.log('✅ 智能客服初始化完成');
});

/**
 * 发送快速回复
 * @param {string} message 快速回复消息
 */
function sendQuickReply(message) {
    if (serviceManager) {
        serviceManager.messageInput.value = message;
        serviceManager.sendMessage();
    }
}

/**
 * 返回首页
 */
function backToHomePage() {
    window.location.href = '/';
}

/**
 * 窗口大小改变时重新调整布局
 */
window.addEventListener('resize', function() {
    if (serviceManager) {
        serviceManager.scrollToBottom();
    }
}); 