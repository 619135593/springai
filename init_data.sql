-- SpringAI智能客服课程数据初始化脚本
-- 数据库：itheima

-- 清空现有数据（可选）
-- DELETE FROM course_reservation;
-- DELETE FROM course;
-- DELETE FROM school;

-- 插入校区数据
INSERT INTO school (name, city) VALUES 
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

-- 编程类课程
INSERT INTO course (name, edu, type, price, duration) VALUES 
-- 前端开发课程
('HTML5+CSS3基础入门', 2, '编程', 2980, 30),
('JavaScript核心编程', 2, '编程', 3980, 45),
('Vue3+TypeScript全栈开发', 3, '编程', 8980, 90),
('React18企业级开发', 3, '编程', 9980, 95),
('微信小程序开发实战', 3, '编程', 5980, 60),
('Node.js后端开发', 4, '编程', 7980, 75),

-- 后端开发课程
('Java基础编程', 2, '编程', 4980, 60),
('Java Spring Boot企业开发', 4, '编程', 12980, 120),
('Python编程入门', 2, '编程', 3980, 45),
('Python数据分析与爬虫', 3, '编程', 8980, 90),
('Python人工智能开发', 4, '编程', 15980, 150),

-- 移动开发课程
('Android原生开发', 3, '编程', 9980, 100),
('iOS Swift开发', 3, '编程', 10980, 105),
('Flutter跨平台开发', 4, '编程', 11980, 110),

-- 数据库课程
('MySQL数据库管理', 2, '编程', 2980, 30),
('Redis缓存技术', 3, '编程', 4980, 50),

-- 设计类课程
INSERT INTO course (name, edu, type, price, duration) VALUES 
('Photoshop平面设计基础', 1, '设计', 2980, 40),
('UI/UX界面设计进阶', 2, '设计', 6980, 80),
('Figma原型设计实战', 2, '设计', 3980, 45),
('Adobe Illustrator矢量设计', 2, '设计', 4980, 50),
('3D建模与渲染', 3, '设计', 8980, 90),
('视频剪辑与特效制作', 2, '设计', 5980, 65),

-- 自媒体类课程
INSERT INTO course (name, edu, type, price, duration) VALUES 
('短视频运营与制作', 1, '自媒体', 2980, 35),
('直播带货技巧与实战', 1, '自媒体', 3980, 40),
('内容创作与文案策划', 2, '自媒体', 4980, 50),
('社交媒体营销', 2, '自媒体', 5980, 60),
('电商运营与推广', 2, '自媒体', 6980, 70),

-- 其它类课程
INSERT INTO course (name, edu, type, price, duration) VALUES 
('职场办公软件精通', 1, '其它', 1980, 25),
('项目管理PMP认证', 4, '其它', 7980, 80),
('数字化转型与创新思维', 4, '其它', 5980, 55),
('互联网产品经理', 3, '其它', 8980, 85),
('网络安全与信息保护', 3, '其它', 9980, 95);

-- 验证数据插入
SELECT '课程数据统计：' as info;
SELECT type as 课程类型, COUNT(*) as 课程数量 FROM course GROUP BY type;

SELECT '校区数据统计：' as info;
SELECT city as 城市, COUNT(*) as 校区数量 FROM school GROUP BY city; 