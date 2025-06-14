package com.example.springaichat.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 首页控制器
 * 处理根路径访问，重定向到聊天界面
 * 
 * @author SpringAI Team
 * @version 1.0.0
 */
@Controller
public class IndexController {

    /**
     * 根路径重定向到聊天界面
     * 当用户访问应用根路径时，自动跳转到聊天界面
     * 
     * @return 重定向到index.html页面
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/index.html";
    }

    /**
     * 聊天页面路径
     * 提供一个友好的/chat路径访问聊天界面
     * 
     * @return 重定向到index.html页面
     */
    @GetMapping("/chat")
    public String chat() {
        return "redirect:/index.html";
    }

    /**
     * 哄哄模拟器游戏页面路径
     * 提供一个友好的/game路径访问哄哄模拟器
     * 
     * @return 重定向到game.html页面
     */
    @GetMapping("/game")
    public String game() {
        return "redirect:/game.html";
    }

    /**
     * 哄哄模拟器页面路径（备用）
     * 提供/simulator路径访问哄哄模拟器
     * 
     * @return 重定向到game.html页面
     */
    @GetMapping("/simulator")
    public String simulator() {
        return "redirect:/game.html";
    }

    /**
     * 智能客服页面路径
     * 提供一个友好的/service路径访问智能客服
     * 
     * @return 重定向到service.html页面
     */
    @GetMapping("/service")
    public String service() {
        return "redirect:/service.html";
    }

    /**
     * 智能客服页面路径（备用）
     * 提供/customer-service路径访问智能客服
     * 
     * @return 重定向到service.html页面
     */
    @GetMapping("/customer-service")
    public String customerService() {
        return "redirect:/service.html";
    }
} 