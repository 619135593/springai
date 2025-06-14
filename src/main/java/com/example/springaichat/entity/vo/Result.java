package com.example.springaichat.entity.vo;

import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
public class Result {
    private Integer ok;
    private String msg;
    private Map<String, Object> data;

    public Result(Integer ok, String msg) {
        this.ok = ok;
        this.msg = msg;
        this.data = new HashMap<>();
    }
    public static Result ok(String msg) {
        return new Result(1, msg);
    }
    public static Result fail(String msg) {
        return new Result(0, msg);
    }
    
    /**
     * 添加数据到结果中
     * @param key 键
     * @param value 值
     * @return Result对象，支持链式调用
     */
    public Result put(String key, Object value) {
        if (this.data == null) {
            this.data = new HashMap<>();
        }
        this.data.put(key, value);
        return this;
    }
    
    /**
     * 获取数据
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return this.data != null ? this.data.get(key) : null;
    }
}
