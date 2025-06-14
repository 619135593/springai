-- SpringAI智能客服完整数据库初始化脚本
-- 适用于MySQL 8.0.16+
-- 使用方法：在MySQL图形化工具中直接执行此脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `itheima` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `itheima`;

-- ================================
-- 创建表结构
-- ================================

-- 创建课程表
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) NOT NULL COMMENT '学科名称',
  `edu` int NOT NULL DEFAULT '0' COMMENT '学历背景要求：0-无，1-初中，2-高中、3-大专、4-本科以上',
  `type` varchar(50) NOT NULL COMMENT '课程类型：编程、设计、自媒体、其它',
  `price` bigint NOT NULL COMMENT '课程价格',
  `duration` int NOT NULL COMMENT '学习时长，单位: 天',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学科表';

-- 创建校区表
DROP TABLE IF EXISTS `school`;
CREATE TABLE `school` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) NOT NULL COMMENT '校区名称',
  `city` varchar(100) NOT NULL COMMENT '校区所在城市',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校区表';

-- 创建课程预约表
DROP TABLE IF EXISTS `course_reservation`;
CREATE TABLE `course_reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course` varchar(255) NOT NULL COMMENT '预约课程',
  `student_name` varchar(100) NOT NULL COMMENT '学生姓名',
  `contact_info` varchar(100) NOT NULL COMMENT '联系方式',
  `school` varchar(255) NOT NULL COMMENT '预约校区',
  `remark` text COMMENT '备注',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程预约表';

-- ================================
-- 插入初始数据
-- ================================

-- 插入校区数据
INSERT INTO `school` (`name`, `city`) VALUES 
('北京中关村校区', '北京'),
('上海徐汇校区', '上海'),
('深圳南山校区', '深圳'),
('广州天河校区', '广州'),
('杭州西湖校区', '杭州'),
('成都高新校区', '成都'),
('武汉光谷校区', '武汉'),
('西安雁塔校区', '西安');

-- 插入课程数据
-- edu字段：0-无，1-初中，2-高中，3-大专，4-本科及本科以上

-- 前端开发课程
INSERT INTO `course` (`name`, `edu`, `type`, `price`, `duration`) VALUES 
('HTML5+CSS3基础入门', 2, '编程', 2980, 30),
('JavaScript核心编程', 2, '编程', 3980, 45),
('Vue3+TypeScript全栈开发', 3, '编程', 8980, 90),
('React18企业级开发', 3, '编程', 9980, 95),
('微信小程序开发实战', 3, '编程', 5980, 60),
('Node.js后端开发', 4, '编程', 7980, 75);

-- 后端开发课程
INSERT INTO `course` (`name`, `edu`, `type`, `price`, `duration`) VALUES 
('Java基础编程', 2, '编程', 4980, 60),
('Java Spring Boot企业开发', 4, '编程', 12980, 120),
('Python编程入门', 2, '编程', 3980, 45),
('Python数据分析与爬虫', 3, '编程', 8980, 90),
('Python人工智能开发', 4, '编程', 15980, 150);

-- 移动开发课程
INSERT INTO `course` (`name`, `edu`, `type`, `price`, `duration`) VALUES 
('Android原生开发', 3, '编程', 9980, 100),
('iOS Swift开发', 3, '编程', 10980, 105),
('Flutter跨平台开发', 4, '编程', 11980, 110);

-- 数据库课程
INSERT INTO `course` (`name`, `edu`, `type`, `price`, `duration`) VALUES 
('MySQL数据库管理', 2, '编程', 2980, 30),
('Redis缓存技术', 3, '编程', 4980, 50);

-- 设计类课程
INSERT INTO `course` (`name`, `edu`, `type`, `price`, `duration`) VALUES 
('Photoshop平面设计基础', 1, '设计', 2980, 40),
('UI/UX界面设计进阶', 2, '设计', 6980, 80),
('Figma原型设计实战', 2, '设计', 3980, 45),
('Adobe Illustrator矢量设计', 2, '设计', 4980, 50),
('3D建模与渲染', 3, '设计', 8980, 90),
('视频剪辑与特效制作', 2, '设计', 5980, 65);

-- 自媒体类课程
INSERT INTO `course` (`name`, `edu`, `type`, `price`, `duration`) VALUES 
('短视频运营与制作', 1, '自媒体', 2980, 35),
('直播带货技巧与实战', 1, '自媒体', 3980, 40),
('内容创作与文案策划', 2, '自媒体', 4980, 50),
('社交媒体营销', 2, '自媒体', 5980, 60),
('电商运营与推广', 2, '自媒体', 6980, 70);

-- 其它类课程
INSERT INTO `course` (`name`, `edu`, `type`, `price`, `duration`) VALUES 
('职场办公软件精通', 1, '其它', 1980, 25),
('项目管理PMP认证', 4, '其它', 7980, 80),
('数字化转型与创新思维', 4, '其它', 5980, 55),
('互联网产品经理', 3, '其它', 8980, 85),
('网络安全与信息保护', 3, '其它', 9980, 95);

-- ================================
-- 验证数据插入结果
-- ================================

-- 显示所有表
SHOW TABLES;

-- 统计课程数据
SELECT '=== 课程数据统计 ===' as '信息';
SELECT 
    `type` as '课程类型', 
    COUNT(*) as '课程数量',
    MIN(`price`) as '最低价格',
    MAX(`price`) as '最高价格',
    AVG(`price`) as '平均价格'
FROM `course` 
GROUP BY `type`
ORDER BY COUNT(*) DESC;

-- 统计校区数据
SELECT '=== 校区数据统计 ===' as '信息';
SELECT 
    `city` as '城市', 
    COUNT(*) as '校区数量',
    GROUP_CONCAT(`name` SEPARATOR ', ') as '校区列表'
FROM `school` 
GROUP BY `city`
ORDER BY `city`;

-- 显示总体统计
SELECT '=== 总体数据统计 ===' as '信息';
SELECT 
    (SELECT COUNT(*) FROM `course`) as '课程总数',
    (SELECT COUNT(*) FROM `school`) as '校区总数',
    (SELECT COUNT(*) FROM `course_reservation`) as '预约总数';

SELECT '数据库初始化完成！' as '状态'; 