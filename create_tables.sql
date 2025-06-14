-- SpringAI智能客服数据库表结构创建脚本
-- 数据库：itheima

USE itheima;

-- 创建课程表
CREATE TABLE IF NOT EXISTS `course` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) NOT NULL COMMENT '学科名称',
  `edu` int NOT NULL DEFAULT '0' COMMENT '学历背景要求：0-无，1-初中，2-高中、3-大专、4-本科以上',
  `type` varchar(50) NOT NULL COMMENT '课程类型：编程、设计、自媒体、其它',
  `price` bigint NOT NULL COMMENT '课程价格',
  `duration` int NOT NULL COMMENT '学习时长，单位: 天',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学科表';

-- 创建校区表
CREATE TABLE IF NOT EXISTS `school` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) NOT NULL COMMENT '校区名称',
  `city` varchar(100) NOT NULL COMMENT '校区所在城市',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校区表';

-- 创建课程预约表
CREATE TABLE IF NOT EXISTS `course_reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course` varchar(255) NOT NULL COMMENT '预约课程',
  `student_name` varchar(100) NOT NULL COMMENT '学生姓名',
  `contact_info` varchar(100) NOT NULL COMMENT '联系方式',
  `school` varchar(255) NOT NULL COMMENT '预约校区',
  `remark` text COMMENT '备注',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程预约表';

-- 显示表结构
SHOW TABLES; 