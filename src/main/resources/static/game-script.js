/**
 * 哄哄模拟器游戏逻辑
 * 负责游戏状态管理、用户交互和AI对话流式处理
 */

/**
 * 游戏管理器类
 * 处理游戏的整个生命周期和状态管理
 */
class GameManager {
    /**
     * 构造函数 - 初始化游戏管理器
     */
    constructor() {
        /** @type {string} 聊天会话ID - 从localStorage获取或生成新的 */
        this.chatId = this.getChatId();
        
        /** @type {number} 当前原谅值 - 从localStorage获取或初始化为0 */
        this.currentForgiveness = this.getCurrentForgiveness();
        
        /** @type {boolean} 游戏是否正在进行 */
        this.gameInProgress = false;
        
        /** @type {boolean} 是否正在发送消息 */
        this.isSending = false;
        
        /** @type {boolean} 游戏是否已开始 */
        this.gameStarted = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateGameStatus('等待开始');
        
        // 调试信息
        console.log('🎮 游戏初始化信息:');
        console.log('- ChatID:', this.chatId);
        console.log('- 当前原谅值:', this.currentForgiveness);
        console.log('- localStorage中的chatId:', localStorage.getItem('game_chatId'));
        console.log('- localStorage中的原谅值:', localStorage.getItem('game_forgiveness'));
        
        // 如果有保存的原谅值，更新UI显示
        if (this.currentForgiveness > 0) {
            this.forgiveValue.textContent = `${this.currentForgiveness}/100`;
            const percentage = (this.currentForgiveness / 100) * 100;
            this.progressFill.style.width = `${percentage}%`;
            this.updateMood(0, this.currentForgiveness);
            console.log('✅ 已恢复保存的原谅值:', this.currentForgiveness);
        }
    }

    /**
     * 获取或生成聊天会话ID
     * @returns {string} 聊天会话ID
     */
    getChatId() {
        let chatId = localStorage.getItem('game_chatId');
        if (!chatId) {
            chatId = this.generateChatId();
            localStorage.setItem('game_chatId', chatId);
        }
        return chatId;
    }

    /**
     * 获取当前原谅值
     * @returns {number} 当前原谅值
     */
    getCurrentForgiveness() {
        const saved = localStorage.getItem('game_forgiveness');
        return saved ? parseInt(saved) : 0;
    }

    /**
     * 保存当前原谅值到localStorage
     * @param {number} forgiveness 原谅值
     */
    saveForgiveness(forgiveness) {
        localStorage.setItem('game_forgiveness', forgiveness.toString());
    }

    /**
     * 生成唯一的聊天会话ID
     * @returns {string} 聊天会话ID
     */
    generateChatId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 消息相关元素
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.charCount = document.querySelector('.char-count');
        
        // 游戏状态元素
        this.gameStatus = document.getElementById('gameStatus');
        this.forgiveValue = document.getElementById('forgiveValue');
        this.progressFill = document.getElementById('progressFill');
        this.girlfriendMood = document.getElementById('girlfriendMood');
        
        // 控制按钮
        this.restartButton = document.getElementById('restartButton');
        this.fullResetButton = document.getElementById('fullResetButton');
        this.helpButton = document.getElementById('helpButton');
        
        // 弹窗元素
        this.gameResultModal = document.getElementById('gameResultModal');
        this.helpModal = document.getElementById('helpModal');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // 结果弹窗元素
        this.resultTitle = document.getElementById('resultTitle');
        this.resultEmoji = document.getElementById('resultEmoji');
        this.resultMessage = document.getElementById('resultMessage');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.backToMenuButton = document.getElementById('backToMenuButton');
        this.closeHelpButton = document.getElementById('closeHelpButton');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 发送消息事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.messageInput.addEventListener('input', () => this.updateCharCount());
        
        // 控制按钮事件
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.fullResetButton.addEventListener('click', () => this.fullResetGame());
        this.helpButton.addEventListener('click', () => this.showHelp());
        
        // 结果弹窗事件
        this.playAgainButton.addEventListener('click', () => this.restartGame());
        this.backToMenuButton.addEventListener('click', () => this.backToMenu());
        this.closeHelpButton.addEventListener('click', () => this.hideHelp());
        
        // 弹窗点击外部关闭
        this.gameResultModal.addEventListener('click', (e) => {
            if (e.target === this.gameResultModal) {
                this.hideResultModal();
            }
        });
        
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.hideHelp();
            }
        });
    }

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} e 键盘事件对象
     */
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * 更新字符计数显示
     */
    updateCharCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/500`;
        
        // 字符数颜色提示
        if (length > 450) {
            this.charCount.style.color = '#e17055';
        } else if (length > 400) {
            this.charCount.style.color = '#f39c12';
        } else {
            this.charCount.style.color = '#999';
        }
    }

    /**
     * 发送用户消息
     */
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isSending) {
            return;
        }

        // 添加用户消息到界面
        this.addUserMessage(message);
        this.messageInput.value = '';
        this.updateCharCount();
        
        // 设置发送状态
        this.isSending = true;
        this.sendButton.disabled = true;
        this.showLoading();

        try {
            // 发送消息到后端
            await this.sendToAI(message);
        } catch (error) {
            console.error('发送消息失败:', error);
            this.addSystemMessage('❌ 发送失败，请检查网络连接或稍后重试。');
        } finally {
            // 恢复发送状态
            this.isSending = false;
            this.sendButton.disabled = false;
            this.hideLoading();
        }
    }

    /**
     * 发送消息到AI并处理流式响应
     * @param {string} message 用户消息
     */
    async sendToAI(message) {
        // 如果游戏刚开始且有保存的原谅值，在消息中包含这个信息
        let finalMessage = message;
        if (!this.gameStarted && this.currentForgiveness > 0) {
            finalMessage = `${message}\n\n[系统提示：当前对话历史中的原谅值为${this.currentForgiveness}/100，请基于此原谅值继续游戏，不要重置为20]`;
        }
        
        const url = `/ai/game?prompt=${encodeURIComponent(finalMessage)}&chatId=${this.chatId}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // 创建AI消息容器
            const aiMessage = this.createGirlfriendMessage();
            let fullResponse = '';

            // 处理流式数据
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                
                // 实时更新消息内容
                aiMessage.querySelector('.message-text').textContent = fullResponse;
                this.scrollToBottom();
            }

            // 处理完整响应
            this.processAIResponse(fullResponse, aiMessage);
            
        } catch (error) {
            console.error('AI请求失败:', error);
            throw error;
        }
    }

    /**
     * 处理AI响应并解析游戏状态
     * @param {string} response AI完整响应
     * @param {HTMLElement} messageElement 消息DOM元素
     */
    processAIResponse(response, messageElement) {
        // 解析游戏信息
        const gameInfo = this.parseGameResponse(response);
        
        if (gameInfo) {
            // 更新游戏状态
            this.updateGameState(gameInfo);
            
            // 显示得分信息
            if (gameInfo.score !== null) {
                this.addScoreDisplay(messageElement, gameInfo.score, gameInfo.forgiveness);
            }
            
            // 检查游戏结束条件
            this.checkGameEnd(gameInfo);
        }

        // 标记游戏已开始
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.gameInProgress = true;
            this.updateGameStatus('游戏进行中');
        }
    }

    /**
     * 解析AI响应中的游戏状态信息
     * @param {string} response AI响应文本
     * @returns {Object|null} 解析出的游戏信息
     */
    parseGameResponse(response) {
        try {
            // 解析得分
            const scoreMatch = response.match(/得分：([+-]?\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
            
            // 解析原谅值
            const forgivenessMatch = response.match(/原谅值：(\d+)\/100/);
            const forgiveness = forgivenessMatch ? parseInt(forgivenessMatch[1]) : null;
            
            if (forgiveness !== null) {
                return { score, forgiveness };
            }
            
            return null;
        } catch (error) {
            console.error('解析游戏响应失败:', error);
            return null;
        }
    }

    /**
     * 更新游戏状态
     * @param {Object} gameInfo 游戏状态信息
     */
    updateGameState(gameInfo) {
        const { score, forgiveness } = gameInfo;
        
        console.log('🔄 更新游戏状态:', gameInfo);
        
        // 更新原谅值
        if (forgiveness !== null) {
            const oldForgiveness = this.currentForgiveness;
            this.currentForgiveness = forgiveness;
            this.saveForgiveness(forgiveness); // 保存到localStorage
            this.forgiveValue.textContent = `${forgiveness}/100`;
            
            console.log(`💖 原谅值更新: ${oldForgiveness} → ${forgiveness} (得分: ${score})`);
            
            // 更新进度条
            const percentage = (forgiveness / 100) * 100;
            this.progressFill.style.width = `${percentage}%`;
        }
        
        // 更新女朋友心情
        this.updateMood(score, forgiveness);
    }

    /**
     * 更新女朋友心情表情
     * @param {number} score 本轮得分
     * @param {number} forgiveness 当前原谅值
     */
    updateMood(score, forgiveness) {
        let mood = '😐';
        
        if (forgiveness >= 80) {
            mood = '😍';
        } else if (forgiveness >= 60) {
            mood = '😊';
        } else if (forgiveness >= 40) {
            mood = '🙂';
        } else if (forgiveness >= 20) {
            mood = '😐';
        } else if (forgiveness >= 10) {
            mood = '😠';
        } else {
            mood = '😡';
        }
        
        this.girlfriendMood.textContent = mood;
    }

    /**
     * 检查游戏结束条件
     * @param {Object} gameInfo 游戏状态信息
     */
    checkGameEnd(gameInfo) {
        const { forgiveness } = gameInfo;
        
        if (forgiveness >= 100) {
            // 游戏胜利
            this.endGame(true, '🎉 恭喜通关！你成功哄好了女朋友！', '你的情商真是太高了！女朋友已经完全原谅你了，你们的感情变得更加甜蜜~');
        } else if (forgiveness <= 0) {
            // 游戏失败
            this.endGame(false, '💔 游戏失败', '女朋友彻底生气了，你们分手了...要不要重新来过，好好学习怎么哄女朋友开心？');
        }
    }

    /**
     * 结束游戏
     * @param {boolean} isWin 是否获胜
     * @param {string} title 结果标题
     * @param {string} message 结果消息
     */
    endGame(isWin, title, message) {
        this.gameInProgress = false;
        this.updateGameStatus(isWin ? '游戏胜利' : '游戏失败');
        
        // 设置结果弹窗
        this.resultTitle.textContent = title;
        this.resultEmoji.textContent = isWin ? '🎉' : '💔';
        this.resultMessage.textContent = message;
        
        // 显示结果弹窗
        setTimeout(() => {
            this.showResultModal();
        }, 1500);
    }

    /**
     * 添加用户消息到聊天界面
     * @param {string} message 用户消息内容
     */
    addUserMessage(message) {
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
     * 创建女朋友消息元素
     * @returns {HTMLElement} 消息DOM元素
     */
    createGirlfriendMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message girlfriend-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text"></div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        return messageDiv;
    }

    /**
     * 添加得分显示
     * @param {HTMLElement} messageElement 消息元素
     * @param {number} score 得分
     * @param {number} forgiveness 原谅值
     */
    addScoreDisplay(messageElement, score, forgiveness) {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score-display';
        
        // 根据得分设置样式
        if (score > 0) {
            scoreDiv.classList.add('score-positive');
        } else if (score < 0) {
            scoreDiv.classList.add('score-negative');
        } else {
            scoreDiv.classList.add('score-neutral');
        }
        
        scoreDiv.innerHTML = `
            <div>得分：${score > 0 ? '+' : ''}${score}</div>
            <div>原谅值：${forgiveness}/100</div>
        `;
        
        messageElement.querySelector('.message-content').appendChild(scoreDiv);
    }

    /**
     * 添加系统消息
     * @param {string} message 系统消息内容
     */
    addSystemMessage(message) {
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
     * 更新游戏状态显示
     * @param {string} status 状态文本
     */
    updateGameStatus(status) {
        this.gameStatus.textContent = status;
    }

    /**
     * 重新开始游戏
     * @param {boolean} fullReset 是否完全重置（清除所有历史数据）
     */
    restartGame(fullReset = false) {
        // 隐藏弹窗
        this.hideResultModal();
        this.hideHelp();
        
        if (fullReset) {
            // 完全重置：清除localStorage并生成新的chatId
            localStorage.removeItem('game_chatId');
            localStorage.removeItem('game_forgiveness');
            this.chatId = this.generateChatId();
            localStorage.setItem('game_chatId', this.chatId);
            this.currentForgiveness = 0;
        }
        
        // 重置游戏状态
        this.gameInProgress = false;
        this.gameStarted = false;
        
        // 重置UI状态
        this.updateGameStatus('等待开始');
        if (fullReset) {
            this.forgiveValue.textContent = '--/100';
            this.progressFill.style.width = '0%';
            this.girlfriendMood.textContent = '😐';
        } else {
            // 保持当前原谅值显示
            if (this.currentForgiveness > 0) {
                this.forgiveValue.textContent = `${this.currentForgiveness}/100`;
                const percentage = (this.currentForgiveness / 100) * 100;
                this.progressFill.style.width = `${percentage}%`;
                this.updateMood(0, this.currentForgiveness);
            } else {
                this.forgiveValue.textContent = '--/100';
                this.progressFill.style.width = '0%';
                this.girlfriendMood.textContent = '😐';
            }
        }
        
        // 清空聊天记录，保留规则说明
        const systemMessage = this.chatMessages.querySelector('.system-message');
        this.chatMessages.innerHTML = '';
        if (systemMessage) {
            this.chatMessages.appendChild(systemMessage);
        }
        
        this.messageInput.focus();
    }

    /**
     * 完全重置游戏（清除所有历史数据）
     */
    fullResetGame() {
        if (confirm('确定要完全重置游戏吗？这将清除所有对话历史和进度。')) {
            this.restartGame(true);
        }
    }

    /**
     * 显示帮助弹窗
     */
    showHelp() {
        this.helpModal.classList.add('show');
    }

    /**
     * 隐藏帮助弹窗
     */
    hideHelp() {
        this.helpModal.classList.remove('show');
    }

    /**
     * 显示结果弹窗
     */
    showResultModal() {
        this.gameResultModal.classList.add('show');
    }

    /**
     * 隐藏结果弹窗
     */
    hideResultModal() {
        this.gameResultModal.classList.remove('show');
    }

    /**
     * 返回主页
     */
    backToMenu() {
        window.location.href = '/';
    }

    /**
     * 显示加载动画
     */
    showLoading() {
        this.loadingIndicator.classList.add('show');
    }

    /**
     * 隐藏加载动画
     */
    hideLoading() {
        this.loadingIndicator.classList.remove('show');
    }

    /**
     * 滚动到聊天底部
     */
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    /**
     * HTML转义，防止XSS攻击
     * @param {string} unsafe 待转义的字符串
     * @returns {string} 转义后的安全字符串
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

/**
 * 返回主页
 */
function backToHomePage() {
    window.location.href = '/';
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
    console.log(' 哄哄模拟器已准备就绪！');
}); 