# Cool-Admin 二次开发指南

## 🎯 项目特点

✅ **MIT开源协议** - 可自由商用和二次开发
✅ **模块化架构** - 易于扩展新功能
✅ **插件化设计** - 支持功能插件扩展
✅ **TypeScript** - 类型安全，IDE友好
✅ **装饰器模式** - 代码简洁优雅

---

## 📦 二次开发方式

### 方式一：添加新业务模块（推荐）

#### 1. 创建模块目录结构

```bash
src/modules/order/              # 订单模块示例
├── config.ts                   # 模块配置
├── controller/
│   ├── admin/
│   │   └── order.ts           # 后台订单管理接口
│   └── app/
│       └── order.ts           # 前端订单接口
├── service/
│   └── order.ts               # 订单业务逻辑
├── entity/
│   └── order.ts               # 订单实体
├── dto/
│   └── order.ts               # 数据传输对象
└── middleware/                 # 可选：自定义中间件
```

#### 2. 创建实体类（Entity）

```typescript
// src/modules/order/entity/order.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity } from 'typeorm';

@Entity('order_info')
export class OrderEntity extends BaseEntity {
  @Column({ comment: '订单号', unique: true })
  orderNo: string;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '订单金额', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ comment: '订单状态 0-待支付 1-已支付 2-已取消', default: 0 })
  status: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
```

#### 3. 创建服务类（Service）

```typescript
// src/modules/order/service/order.ts
import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entity/order';

@Provide()
export class OrderService extends BaseService {
  @InjectEntityModel(OrderEntity)
  orderEntity: Repository<OrderEntity>;

  /**
   * 创建订单
   */
  async createOrder(data: Partial<OrderEntity>) {
    const orderNo = 'ORD' + Date.now();
    return await this.orderEntity.save({
      ...data,
      orderNo,
    });
  }

  /**
   * 订单列表（带分页）
   */
  async orderPage(query) {
    const find = this.orderEntity.createQueryBuilder();
    return this.entityRenderPage(find, query);
  }
}
```

#### 4. 创建控制器（Controller）

```typescript
// src/modules/order/controller/admin/order.ts
import { Body, Inject, Post, Provide } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolUrlTag
} from '@cool-midway/core';
import { OrderService } from '../../service/order';
import { OrderEntity } from '../../entity/order';

@CoolUrlTag()
@Provide()
@CoolController('/admin/order')
export class AdminOrderController extends BaseController {
  @Inject()
  orderService: OrderService;

  /**
   * 订单列表
   */
  @Post('/page', { summary: '订单列表' })
  async page(@Body() query) {
    return this.ok(await this.orderService.orderPage(query));
  }

  /**
   * 创建订单
   */
  @Post('/add', { summary: '创建订单' })
  async add(@Body() entity: OrderEntity) {
    return this.ok(await this.orderService.createOrder(entity));
  }
}
```

#### 5. 创建模块配置

```typescript
// src/modules/order/config.ts
import { ModuleConfig } from '@cool-midway/core';

export default () => {
  return {
    name: '订单管理',
    description: '订单管理模块',
    order: 5,
  } as ModuleConfig;
};
```

---

### 方式二：修改现有模块

可以直接修改 `src/modules/` 下的模块代码：

```typescript
// 示例：扩展用户实体
// src/modules/user/entity/info.ts
@Entity('user_info')
export class UserInfoEntity extends BaseEntity {
  // ...existing code...

  // 添加新字段
  @Column({ comment: '会员等级', default: 0 })
  vipLevel: number;

  @Column({ comment: '积分', default: 0 })
  points: number;
}
```

---

### 方式三：开发插件

```typescript
// src/modules/plugin/service/myplugin.ts
import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MyPluginService {
  async init() {
    // 插件初始化逻辑
  }

  async execute() {
    // 插件执行逻辑
  }
}
```

---

## 🔧 配置修改

### 1. 数据库配置

```typescript
// src/config/config.local.ts
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: '你的密码',
        database: '你的数据库名',
        synchronize: true,  // 开发环境自动建表
        logging: true,      // 打印SQL日志
      },
    },
  },
};
```

### 2. 修改端口

```typescript
// src/config/config.default.ts
export default {
  koa: {
    port: 8001, // 修改为你的端口
  },
};
```

### 3. JWT密钥（重要！）

```typescript
// src/config/config.default.ts
export default {
  keys: 'your-unique-project-keys',  // 修改为你的项目唯一密钥
};

// src/modules/base/config.ts
export default () => {
  return {
    jwt: {
      secret: 'your-unique-jwt-secret',  // 修改JWT密钥
      expire: 60 * 60 * 24 * 7,         // token有效期（秒）
    },
  };
};
```

---

## 🚀 开发流程

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

修改 `src/config/config.local.ts` 中的数据库配置

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问API文档

打开浏览器访问：http://localhost:8001/swagger

### 5. 构建生产版本

```bash
npm run build
```

### 6. 生产环境启动

```bash
npm start
# 或使用PM2
npm run pm2:start
```

---

## 🗃️ 数据库表关系设计

### 场景：创建两个表 + 关联中间表

假设我们要实现：**学生** 和 **课程** 的多对多关系

#### 1. 创建第一个表实体（学生表）

```typescript
// src/modules/school/entity/student.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { CourseEntity } from './course';

/**
 * 学生表
 */
@Entity('school_student')
export class StudentEntity extends BaseEntity {
  @Column({ comment: '学生姓名' })
  name: string;

  @Column({ comment: '学号', unique: true })
  studentNo: string;

  @Column({ comment: '年级' })
  grade: number;

  @Column({ comment: '班级', nullable: true })
  class: string;

  @Column({ comment: '手机号', nullable: true })
  phone: string;

  // 多对多关系：一个学生可以选多门课程
  // @JoinTable() 装饰器表示这是关系的拥有方，会自动创建中间表
  @ManyToMany(() => CourseEntity, course => course.students)
  @JoinTable({
    name: 'school_student_course', // 中间表名称
    joinColumn: {
      name: 'student_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'course_id',
      referencedColumnName: 'id'
    }
  })
  courses: CourseEntity[];
}
```

#### 2. 创建第二个表实体（课程表）

```typescript
// src/modules/school/entity/course.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, ManyToMany } from 'typeorm';
import { StudentEntity } from './student';

/**
 * 课程表
 */
@Entity('school_course')
export class CourseEntity extends BaseEntity {
  @Column({ comment: '课程名称' })
  name: string;

  @Column({ comment: '课程代码', unique: true })
  courseCode: string;

  @Column({ comment: '学分', type: 'decimal', precision: 3, scale: 1 })
  credit: number;

  @Column({ comment: '授课教师', nullable: true })
  teacher: string;

  @Column({ comment: '课程描述', type: 'text', nullable: true })
  description: string;

  // 多对多关系：一门课程可以被多个学生选择
  // 这边是关系的反向，不需要 @JoinTable()
  @ManyToMany(() => StudentEntity, student => student.courses)
  students: StudentEntity[];
}
```

#### 3. 手动创建中间表（可选，更灵活）

如果需要在中间表添加额外字段（如选课时间、成绩等），需要手动创建中间表：

```typescript
// src/modules/school/entity/student-course.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentEntity } from './student';
import { CourseEntity } from './course';

/**
 * 学生-课程关联表（选课记录）
 */
@Entity('school_student_course')
@Index(['studentId', 'courseId'], { unique: true }) // 联合唯一索引
export class StudentCourseEntity extends BaseEntity {
  @Column({ comment: '学生ID' })
  studentId: number;

  @Column({ comment: '课程ID' })
  courseId: number;

  // 额外字段：选课时间
  @Column({ comment: '选课时间', type: 'datetime', nullable: true })
  enrollTime: Date;

  // 额外字段：成绩
  @Column({ comment: '成绩', type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  // 额外字段：状态 0-已选课 1-已完成 2-已退课
  @Column({ comment: '状态', default: 0 })
  status: number;

  // 多对一关系：关联学生
  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  // 多对一关系：关联课程
  @ManyToOne(() => CourseEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;
}
```

**注意：** 如果手动创建中间表，需要移除 `StudentEntity` 和 `CourseEntity` 中的 `@ManyToMany` 关系。

#### 4. 创建服务类（包含关联查询）

```typescript
// src/modules/school/service/student.ts
import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../entity/student';
import { CourseEntity } from '../entity/course';
import { StudentCourseEntity } from '../entity/student-course';

@Provide()
export class StudentService extends BaseService {
  @InjectEntityModel(StudentEntity)
  studentEntity: Repository<StudentEntity>;

  @InjectEntityModel(CourseEntity)
  courseEntity: Repository<CourseEntity>;

  @InjectEntityModel(StudentCourseEntity)
  studentCourseEntity: Repository<StudentCourseEntity>;

  /**
   * 学生列表（带选课信息）
   */
  async getStudentWithCourses(studentId: number) {
    return await this.studentEntity
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.courses', 'course')
      .where('student.id = :studentId', { studentId })
      .getOne();
  }

  /**
   * 学生选课
   */
  async enrollCourse(studentId: number, courseId: number) {
    // 检查学生是否存在
    const student = await this.studentEntity.findOne({ where: { id: studentId } });
    if (!student) {
      throw new Error('学生不存在');
    }

    // 检查课程是否存在
    const course = await this.courseEntity.findOne({ where: { id: courseId } });
    if (!course) {
      throw new Error('课程不存在');
    }

    // 检查是否已选课
    const exists = await this.studentCourseEntity.findOne({
      where: { studentId, courseId }
    });
    if (exists) {
      throw new Error('已经选过此课程');
    }

    // 创建选课记录
    return await this.studentCourseEntity.save({
      studentId,
      courseId,
      enrollTime: new Date(),
      status: 0
    });
  }

  /**
   * 学生退课
   */
  async dropCourse(studentId: number, courseId: number) {
    const record = await this.studentCourseEntity.findOne({
      where: { studentId, courseId }
    });

    if (!record) {
      throw new Error('未找到选课记录');
    }

    // 更新状态为已退课
    record.status = 2;
    return await this.studentCourseEntity.save(record);
  }

  /**
   * 查询学生的所有课程（带成绩）
   */
  async getStudentCourses(studentId: number) {
    return await this.studentCourseEntity
      .createQueryBuilder('sc')
      .leftJoinAndSelect('sc.course', 'course')
      .where('sc.studentId = :studentId', { studentId })
      .andWhere('sc.status != 2') // 排除已退课
      .orderBy('sc.enrollTime', 'DESC')
      .getMany();
  }

  /**
   * 录入成绩
   */
  async updateScore(studentId: number, courseId: number, score: number) {
    const record = await this.studentCourseEntity.findOne({
      where: { studentId, courseId }
    });

    if (!record) {
      throw new Error('未找到选课记录');
    }

    record.score = score;
    record.status = 1; // 已完成
    return await this.studentCourseEntity.save(record);
  }

  /**
   * 获取课程的所有学生
   */
  async getCourseStudents(courseId: number) {
    return await this.studentCourseEntity
      .createQueryBuilder('sc')
      .leftJoinAndSelect('sc.student', 'student')
      .where('sc.courseId = :courseId', { courseId })
      .andWhere('sc.status != 2')
      .getMany();
  }
}
```

#### 5. 创建控制器

```typescript
// src/modules/school/controller/admin/student.ts
import { Body, Get, Inject, Post, Query, Provide } from '@midwayjs/core';
import { BaseController, CoolController, CoolUrlTag } from '@cool-midway/core';
import { StudentService } from '../../service/student';

@CoolUrlTag()
@Provide()
@CoolController('/admin/school/student')
export class AdminStudentController extends BaseController {
  @Inject()
  studentService: StudentService;

  /**
   * 查询学生及其课程
   */
  @Get('/withCourses', { summary: '学生详情（含课程）' })
  async getWithCourses(@Query('id') id: number) {
    return this.ok(await this.studentService.getStudentWithCourses(id));
  }

  /**
   * 学生选课
   */
  @Post('/enrollCourse', { summary: '学生选课' })
  async enrollCourse(
    @Body('studentId') studentId: number,
    @Body('courseId') courseId: number
  ) {
    await this.studentService.enrollCourse(studentId, courseId);
    return this.ok();
  }

  /**
   * 学生退课
   */
  @Post('/dropCourse', { summary: '学生退课' })
  async dropCourse(
    @Body('studentId') studentId: number,
    @Body('courseId') courseId: number
  ) {
    await this.studentService.dropCourse(studentId, courseId);
    return this.ok();
  }

  /**
   * 录入成绩
   */
  @Post('/updateScore', { summary: '录入成绩' })
  async updateScore(
    @Body('studentId') studentId: number,
    @Body('courseId') courseId: number,
    @Body('score') score: number
  ) {
    await this.studentService.updateScore(studentId, courseId, score);
    return this.ok();
  }

  /**
   * 查询学生的所有课程
   */
  @Get('/courses', { summary: '学生课程列表' })
  async getCourses(@Query('studentId') studentId: number) {
    return this.ok(await this.studentService.getStudentCourses(studentId));
  }
}
```

---

### 其他表关系类型

#### 一对一关系（OneToOne）

```typescript
// 用户表
@Entity('user')
export class UserEntity extends BaseEntity {
  @Column()
  username: string;

  // 一对一关系：一个用户对应一个用户详情
  @OneToOne(() => UserProfileEntity, profile => profile.user)
  @JoinColumn({ name: 'profile_id' })
  profile: UserProfileEntity;
}

// 用户详情表
@Entity('user_profile')
export class UserProfileEntity extends BaseEntity {
  @Column()
  realName: string;

  @Column()
  idCard: string;

  @OneToOne(() => UserEntity, user => user.profile)
  user: UserEntity;
}
```

#### 一对多关系（OneToMany / ManyToOne）

```typescript
// 部门表（一）
@Entity('department')
export class DepartmentEntity extends BaseEntity {
  @Column()
  name: string;

  // 一对多：一个部门有多个员工
  @OneToMany(() => EmployeeEntity, employee => employee.department)
  employees: EmployeeEntity[];
}

// 员工表（多）
@Entity('employee')
export class EmployeeEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  departmentId: number;

  // 多对一：多个员工属于一个部门
  @ManyToOne(() => DepartmentEntity, department => department.employees)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;
}
```

---

## 🚀 快速开发技巧（类似 Strapi 的体验）

虽然 Cool-Admin 是代码优先的框架，但通过以下技巧可以获得类似 Strapi 的快速开发体验：

### 1. 使用 Cool-Admin 的 AI 编码功能 ⭐

这是 Cool-Admin 的核心优势，可以快速生成完整的 CRUD 功能：

```bash
# 1. 在前端管理界面使用 AI 编码
# 访问：http://localhost:8001
# 进入：系统管理 -> AI 编码

# 2. 输入需求，例如：
"创建一个博客文章管理模块，包含标题、内容、作者、分类、标签、发布时间"

# 3. AI 自动生成：
# ✅ Entity 实体类
# ✅ Service 服务类
# ✅ Controller 控制器
# ✅ 前端 CRUD 页面
# ✅ API 接口文档
```

### 2. 利用 BaseService 的内置方法

继承 `BaseService` 即可获得完整的 CRUD 方法，无需手写：

```typescript
@Provide()
export class ArticleService extends BaseService {
  @InjectEntityModel(ArticleEntity)
  articleEntity: Repository<ArticleEntity>;
}

// 自动获得以下方法：
// - add(entity)         // 新增
// - delete(ids)         // 删除
// - update(entity)      // 更新
// - info(id)            // 详情
// - list()              // 列表
// - page(query)         // 分页
```

### 3. 使用 CoolController 自动生成 RESTful API

```typescript
@CoolController('/admin/article', {
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ArticleEntity,
  service: ArticleService,
})
export class AdminArticleController extends BaseController {}

// 自动生成 6 个标准接口：
// POST   /admin/article/add      - 新增
// POST   /admin/article/delete   - 删除
// POST   /admin/article/update   - 更新
// GET    /admin/article/info     - 详情
// POST   /admin/article/list     - 列表
// POST   /admin/article/page     - 分页
```

### 4. 使用装饰器快速定义实体

```typescript
@Entity('cms_article')
export class ArticleEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '内容', type: 'text' })
  content: string;

  @Column({ comment: '封面图', nullable: true })
  coverImage: string;

  @Column({ comment: '分类ID' })
  categoryId: number;

  @Column({ comment: '作者' })
  author: string;

  @Column({ comment: '浏览量', default: 0 })
  viewCount: number;

  @Column({ comment: '状态 0-草稿 1-发布', default: 0 })
  status: number;

  @Column({ comment: '发布时间', type: 'datetime', nullable: true })
  publishTime: Date;
}

// 启动项目，表自动创建！
```

### 5. 使用流程编排功能

类似 Strapi 的 Webhooks，Cool-Admin 提供流程编排：

```typescript
// 可视化拖拽流程：
// 1. 文章发布时 -> 触发审核流程
// 2. 审核通过 -> 发送通知
// 3. 同步到搜索引擎
// 4. 清除缓存
```

### 6. 快速创建内容管理模块

**完整示例：5 分钟创建博客系统**

```bash
# 目录结构
src/modules/blog/
├── entity/
│   ├── article.ts      # 文章
│   ├── category.ts     # 分类
│   └── tag.ts          # 标签
├── service/
│   ├── article.ts
│   ├── category.ts
│   └── tag.ts
├── controller/
│   └── admin/
│       ├── article.ts
│       ├── category.ts
│       └── tag.ts
└── config.ts
```

**文章实体（article.ts）：**

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { CategoryEntity } from './category';
import { TagEntity } from './tag';

@Entity('blog_article')
export class ArticleEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '摘要', nullable: true })
  summary: string;

  @Column({ comment: '内容', type: 'longtext' })
  content: string;

  @Column({ comment: '封面图', nullable: true })
  coverImage: string;

  @Column({ comment: '作者' })
  author: string;

  @Column({ comment: '浏览量', default: 0 })
  viewCount: number;

  @Column({ comment: '点赞量', default: 0 })
  likeCount: number;

  @Column({ comment: '状态 0-草稿 1-发布 2-下线', default: 0 })
  status: number;

  @Column({ comment: '是否置顶', default: false })
  isTop: boolean;

  @Column({ comment: '发布时间', type: 'datetime', nullable: true })
  publishTime: Date;

  // 多对一：分类
  @Column({ comment: '分类ID' })
  categoryId: number;

  // 多对多：标签
  @ManyToMany(() => TagEntity)
  @JoinTable({ name: 'blog_article_tag' })
  tags: TagEntity[];
}
```

**分类实体（category.ts）：**

```typescript
@Entity('blog_category')
export class CategoryEntity extends BaseEntity {
  @Column({ comment: '分类名称' })
  name: string;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '状态', default: 1 })
  status: number;
}
```

**标签实体（tag.ts）：**

```typescript
@Entity('blog_tag')
export class TagEntity extends BaseEntity {
  @Column({ comment: '标签名称' })
  name: string;

  @Column({ comment: '颜色', nullable: true })
  color: string;

  @Column({ comment: '使用次数', default: 0 })
  useCount: number;
}
```

**服务类（article.ts）：**

```typescript
@Provide()
export class BlogArticleService extends BaseService {
  @InjectEntityModel(ArticleEntity)
  articleEntity: Repository<ArticleEntity>;

  /**
   * 发布文章
   */
  async publish(id: number) {
    const article = await this.articleEntity.findOne({ where: { id } });
    if (!article) throw new Error('文章不存在');

    article.status = 1;
    article.publishTime = new Date();
    return await this.articleEntity.save(article);
  }

  /**
   * 增加浏览量
   */
  async increaseViewCount(id: number) {
    await this.articleEntity.increment({ id }, 'viewCount', 1);
  }

  /**
   * 热门文章
   */
  async hotArticles(limit = 10) {
    return await this.articleEntity.find({
      where: { status: 1 },
      order: { viewCount: 'DESC' },
      take: limit
    });
  }
}
```

**控制器（article.ts）：**

```typescript
@CoolUrlTag()
@Provide()
@CoolController('/admin/blog/article', {
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ArticleEntity,
  service: BlogArticleService,
})
export class AdminBlogArticleController extends BaseController {
  @Inject()
  blogArticleService: BlogArticleService;

  /**
   * 发布文章
   */
  @Post('/publish', { summary: '发布文章' })
  async publish(@Body('id') id: number) {
    await this.blogArticleService.publish(id);
    return this.ok();
  }

  /**
   * 热门文章
   */
  @Get('/hot', { summary: '热门文章' })
  async hot() {
    return this.ok(await this.blogArticleService.hotArticles());
  }
}
```

### 7. 使用代码生成工具

可以创建自己的代码生成脚本：

```typescript
// scripts/generate-module.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * 快速生成模块
 * 用法：node scripts/generate-module.ts article
 */
const moduleName = process.argv[2];
const capitalName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

const templates = {
  entity: `
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity } from 'typeorm';

@Entity('${moduleName}')
export class ${capitalName}Entity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;
}
`,
  service: `
import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ${capitalName}Entity } from '../entity/${moduleName}';

@Provide()
export class ${capitalName}Service extends BaseService {
  @InjectEntityModel(${capitalName}Entity)
  ${moduleName}Entity: Repository<${capitalName}Entity>;
}
`,
  controller: `
import { Provide } from '@midwayjs/core';
import { BaseController, CoolController, CoolUrlTag } from '@cool-midway/core';
import { ${capitalName}Service } from '../../service/${moduleName}';
import { ${capitalName}Entity } from '../../entity/${moduleName}';

@CoolUrlTag()
@Provide()
@CoolController('/admin/${moduleName}', {
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ${capitalName}Entity,
  service: ${capitalName}Service,
})
export class Admin${capitalName}Controller extends BaseController {}
`
};

// 创建文件...
console.log(`✅ 模块 ${moduleName} 生成成功！`);
```

### 8. 使用 Swagger 自动生成文档

启动项目后访问：`http://localhost:8001/swagger`

- ✅ 自动生成所有 API 文档
- ✅ 在线测试接口
- ✅ 导出 OpenAPI 规范
- ✅ 生成客户端代码

---

## 📚 常用装饰器

---

## 🔄 Node.js 后台管理框架对比

### 主流框架一览

每个框架都有其独特的优势，选择取决于你的具体需求。以下是客观的对比分析：

---

## 1️⃣ Nest.js + TypeORM 🔥🔥🔥🔥🔥

**GitHub**: https://github.com/nestjs/nest (⭐ 67k+)

### 优势
- ✅ **最流行**的企业级 Node.js 框架
- ✅ **TypeScript 原生支持**，类型系统完善
- ✅ **架构设计优秀**，借鉴 Angular，模块化强
- ✅ **生态系统丰富**，插件、中间件极多
- ✅ **国际化支持好**，文档完善（中英文）
- ✅ **社区活跃**，学习资源丰富
- ✅ **适合大型项目**，可扩展性强
- ✅ **装饰器系统成熟**，代码优雅

### 劣势
- ❌ 学习曲线陡峭，概念较多
- ❌ 没有开箱即用的后台管理界面
- ❌ 需要自己实现权限管理系统
- ❌ 配置相对复杂

### 适用场景
- 大型企业级应用
- 微服务架构
- 需要高度定制的项目
- 团队有前端开发经验

### 代码示例
```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.usersService.findAll();
  }
}
```

---

## 2️⃣ Egg.js 🔥🔥🔥🔥

**GitHub**: https://github.com/eggjs/egg (⭐ 19k+)

### 优势
- ✅ **阿里出品**，企业级框架
- ✅ **约定优于配置**，开发效率高
- ✅ **渐进式开发**，易于上手
- ✅ **插件机制完善**
- ✅ **中文文档优秀**
- ✅ **适合传统后台项目**
- ✅ **性能优秀**

### 劣势
- ❌ TypeScript 支持不如 Nest.js
- ❌ 社区活跃度下降
- ❌ 更新频率降低
- ❌ 国际化支持一般

### 适用场景
- 中小型企业应用
- 传统 MVC 架构项目
- 需要快速开发的项目

---

## 3️⃣ Cool-Admin (Midway.js) 🔥🔥🔥🔥 ⭐

**GitHub**: https://github.com/cool-team-official/cool-admin-midway (⭐ 2k+)

### 优势
- ✅ **开箱即用**，前后端完整方案
- ✅ **AI 编码支持**，快速生成代码
- ✅ **权限管理完善**，RBAC 开箱即用
- ✅ **模块化 + 插件化**，易于扩展
- ✅ **多租户支持**
- ✅ **中文文档完善**，学习成本低
- ✅ **适合快速开发**
- ✅ **Vue3 前端配套**
- ✅ **原生打包**，可打包成 exe

### 劣势
- ❌ 社区规模较小
- ❌ 国际化程度不高
- ❌ 高度定制时可能受限
- ❌ 依赖 Midway.js 生态

### 适用场景
- **企业后台管理系统**（最佳选择）
- SaaS 多租户平台
- 需要快速交付的项目
- 中小团队

### 核心特色
```typescript
// AI 编码 + 自动生成 CRUD
@CoolController('/admin/user', {
  api: ['add', 'delete', 'update', 'info', 'page'],
  entity: UserEntity,
  service: UserService,
})
export class UserController extends BaseController {}
```

---

## 4️⃣ Strapi 🔥🔥🔥🔥

**GitHub**: https://github.com/strapi/strapi (⭐ 63k+)

### 优势
- ✅ **Headless CMS**，内容管理专家
- ✅ **可视化管理界面**，无需写代码
- ✅ **自动生成 REST/GraphQL API**
- ✅ **插件市场丰富**
- ✅ **国际化支持好**
- ✅ **上手极快**
- ✅ **适合内容管理**

### 劣势
- ❌ 不适合复杂业务逻辑
- ❌ 深度定制困难
- ❌ 权限管理相对简单
- ❌ 不适合企业级后台管理

### 适用场景
- 博客、CMS 系统
- 内容发布平台
- 快速原型开发
- 简单的 API 服务

---

## 5️⃣ AdminJS (原 AdminBro) 🔥🔥🔥

**GitHub**: https://github.com/SoftwareBrothers/adminjs (⭐ 8k+)

### 优势
- ✅ **自动生成后台界面**
- ✅ **支持多种 ORM**（TypeORM、Sequelize、Prisma）
- ✅ **开箱即用**
- ✅ **React 前端**
- ✅ **快速搭建管理面板**

### 劣势
- ❌ 定制能力有限
- ❌ 复杂业务支持不足
- ❌ 中文文档缺失
- ❌ 社区规模小

### 适用场景
- 快速搭建管理后台
- 简单的 CRUD 管理
- 内部工具

---

## 6️⃣ Sails.js 🔥🔥🔥

**GitHub**: https://github.com/balderdashy/sails (⭐ 23k+)

### 优势
- ✅ **MVC 框架**，类似 Rails
- ✅ **内置 WebSocket 支持**
- ✅ **蓝图 API**，自动生成 RESTful API
- ✅ **ORM 内置**（Waterline）

### 劣势
- ❌ 更新缓慢
- ❌ TypeScript 支持不佳
- ❌ 社区活跃度下降
- ❌ 现代化程度不足

### 适用场景
- 实时应用
- 传统 Web 应用

---

## 7️⃣ LoopBack 4 🔥🔥🔥

**GitHub**: https://github.com/loopbackio/loopback-next (⭐ 5k+)

### 优势
- ✅ **IBM 开源**
- ✅ **自动生成 REST API**
- ✅ **OpenAPI 规范支持**
- ✅ **扩展性强**

### 劣势
- ❌ 学习曲线陡峭
- ❌ 社区较小
- ❌ 文档复杂
- ❌ 上手难度大

### 适用场景
- API 优先的项目
- 企业级应用

---

## 8️⃣ AdonisJS 🔥🔥🔥🔥

**GitHub**: https://github.com/adonisjs/core (⭐ 16k+)

### 优势
- ✅ **类似 Laravel**（PHP）
- ✅ **全栈框架**
- ✅ **TypeScript 原生支持**
- ✅ **ORM 优秀**（Lucid）
- ✅ **现代化设计**

### 劣势
- ❌ 社区规模较小
- ❌ 中文资源少
- ❌ 生态不如 Nest.js

### 适用场景
- Laravel 开发者迁移
- 全栈应用
- 中小型项目

---

## 📊 综合对比表

| 框架 | 学习成本 | 开发速度 | 适合规模 | TypeScript | 生态系统 | 后台UI | 推荐度 |
|------|---------|---------|---------|-----------|---------|--------|--------|
| **Nest.js** | 高 | 中 | 大型 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ |
| **Egg.js** | 低 | 高 | 中型 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ |
| **Cool-Admin** | 低 | 极高 | 中型 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| **Strapi** | 极低 | 极高 | 小型 | ⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |
| **AdminJS** | 极低 | 极高 | 小型 | ⭐⭐⭐ | ⭐⭐ | ✅ | ⭐⭐⭐ |
| **Sails.js** | 中 | 高 | 中型 | ⭐⭐ | ⭐⭐⭐ | ❌ | ⭐⭐⭐ |
| **AdonisJS** | 中 | 高 | 中型 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ |

---

## 🎯 选择建议

### 场景一：企业后台管理系统
**推荐顺序**：
1. **Cool-Admin** - 开箱即用，快速交付
2. **Nest.js** - 大型项目，长期维护

### 场景二：内容管理系统（CMS）
**推荐顺序**：
1. **Strapi** - CMS 专家
2. **Cool-Admin** - 自定义需求多时

### 场景三：大型企业级应用
**推荐顺序**：
1. **Nest.js** - 最佳选择
2. **Egg.js** - 阿里生态

### 场景四：快速原型开发
**推荐顺序**：
1. **AdminJS** - 极速搭建
2. **Strapi** - 内容管理
3. **Cool-Admin** - 完整系统

### 场景五：微服务架构
**推荐顺序**：
1. **Nest.js** - 微服务支持完善
2. **Cool-Admin (RPC)** - 内置 RPC 支持

### 场景六：API 服务
**推荐顺序**：
1. **Nest.js** - 标准 RESTful
2. **Strapi** - 自动生成

---

## 💡 Cool-Admin 的独特优势

虽然 Nest.js 更流行，但 Cool-Admin 在以下场景是**最佳选择**：

### ✅ 1. 企业后台管理系统
- 开箱即用的权限管理
- 完整的前后端方案
- AI 编码加速开发

### ✅ 2. 快速交付项目
- 无需从零搭建
- 模块化开发
- 自动生成 CRUD

### ✅ 3. 中小团队
- 学习成本低
- 中文文档完善
- 社区友好

### ✅ 4. SaaS 多租户平台
- 内置多租户支持
- 数据隔离完善

### ✅ 5. 需要桌面应用
- 支持打包成 exe
- Windows/Mac/Linux

---

## 🚀 如果你想要最佳实践

### 方案一：纯后端 API
```
推荐：Nest.js
理由：生态强大，社区活跃，适合长期维护
```

### 方案二：完整后台系统
```
推荐：Cool-Admin
理由：前后端完整，权限管理完善，快速交付
```

### 方案三：内容管理
```
推荐：Strapi
理由：可视化管理，快速搭建
```

### 方案四：混合方案
```
架构：Nest.js (核心业务) + Cool-Admin (管理后台)
理由：发挥各自优势，微服务架构
```

---

## 📖 学习路径建议

### 初学者
1. **Cool-Admin** - 快速上手，建立信心
2. **Nest.js** - 深入学习，提升能力

### 有经验开发者
1. **Nest.js** - 掌握最佳实践
2. **Cool-Admin** - 提升开发效率

### 架构师
1. **Nest.js** - 大型项目架构
2. **微服务组合** - 灵活运用

---

## 🎓 总结

**没有"最优秀"的框架，只有"最合适"的选择。**

- **追求流行度和生态** → Nest.js
- **追求开发效率** → Cool-Admin
- **追求内容管理** → Strapi
- **追求中国特色** → Egg.js / Cool-Admin
- **追求快速原型** → AdminJS

**Cool-Admin 的定位**：
> 在企业后台管理系统领域，Cool-Admin 是**性价比最高**的选择。它不一定是最流行的，但在快速交付、开箱即用、中文支持方面**无可比拟**。

---

## 📖 参考资源

- 官方文档：https://cool-js.com
- 官方社区：https://cool-js.com/admin/node/introduce.html
- Midway.js文档：https://midwayjs.org
- GitHub仓库：https://github.com/cool-team-official/cool-admin-midway
- B站视频教程：https://www.bilibili.com/video/BV1j1421R7aB

---

## 💡 技术支持

遇到问题可以：
1. 查看官方文档
2. 加入官方微信群
3. GitHub提Issue
4. 参考demo模块代码

---

**祝您开发顺利！🚀**

---

## 🗃️ 数据库表关系设计防错指南（新手必看）

### 为什么表设计很重要？

❌ **设计不当的后果：**
- 后期频繁加字段（表结构混乱）
- 数据冗余严重（浪费存储空间）
- 查询性能差（慢查询）
- 扩展困难（推倒重构）

✅ **好的表设计：**
- 一次性设计到位，后期只需微调
- 数据规范化，易于维护
- 查询高效，性能优秀
- 易于扩展，适应业务变化

---

### 🎯 多商户商城表设计黄金法则

#### 法则 1：继承 BaseEntity（必须！）

```typescript
// ❌ 错误：自己定义基础字段
@Entity('goods')
export class GoodsEntity {
  @Column()
  id: number;

  @Column()
  createTime: Date;

  @Column()
  updateTime: Date;
}

// ✅ 正确：继承 BaseEntity
import { BaseEntity } from '../../base/entity/base';

@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  // BaseEntity 自动提供：
  // - id (主键)
  // - createTime (创建时间)
  // - updateTime (更新时间)
  // - createBy (创建人)
  // - updateBy (修改人)

  @Column({ comment: '商品名称' })
  name: string;
}
```

**为什么要继承 BaseEntity？**
- ✅ 自动提供通用字段
- ✅ 自动时间戳管理
- ✅ 软删除支持
- ✅ 与 Cool-Admin 框架无缝集成

---

#### 法则 2：必须有 merchantId（多租户核心）

```typescript
// ❌ 错误：没有商户隔离
@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  @Column({ comment: '商品名称' })
  name: string;

  @Column({ comment: '价格' })
  price: number;
}

// ✅ 正确：所有业务表都要有 merchantId
@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  @Column({ comment: '商户ID' })
  @Index() // 👈 重要：添加索引提升查询性能
  merchantId: number;

  @Column({ comment: '商品名称' })
  name: string;

  @Column({ comment: '价格', type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
```

**哪些表需要 merchantId？**
- ✅ 商品表
- ✅ 订单表
- ✅ 商品分类表（如果商户自定义分类）
- ✅ 优惠券表
- ✅ 商户账户表
- ❌ 用户表（用户是全局的，不属于某个商户）
- ❌ 平台分类表（平台统一管理）

---

#### 法则 3：字段类型要精确

```typescript
// ❌ 错误：字段类型不精确
@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  @Column()  // ❌ 没有指定类型，默认 varchar(255)
  name: string;

  @Column()  // ❌ 金额用 number，精度会丢失
  price: number;

  @Column()  // ❌ 状态没有默认值
  status: number;

  @Column()  // ❌ 大文本没有指定类型
  description: string;
}

// ✅ 正确：字段类型明确
@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  @Column({
    comment: '商品名称',
    length: 200  // 👈 明确长度
  })
  name: string;

  @Column({
    comment: '价格',
    type: 'decimal',  // 👈 金额必须用 decimal
    precision: 10,    // 总位数
    scale: 2          // 小数位数
  })
  price: number;

  @Column({
    comment: '状态 0-下架 1-上架 2-审核中',
    default: 0  // 👈 必须有默认值
  })
  status: number;

  @Column({
    comment: '商品详情',
    type: 'text',  // 👈 大文本用 text 或 longtext
    nullable: true  // 👈 可为空字段明确标注
  })
  description: string;
}
```

**字段类型选择表：**

| 数据类型 | TypeORM 类型 | 示例 |
|---------|-------------|------|
| **短文本** | `varchar` (默认) | 商品名称、用户名 |
| **长文本** | `text` | 商品详情 |
| **超长文本** | `longtext` | 富文本内容 |
| **整数** | `int` (默认) | 库存数量、浏览量 |
| **金额** | `decimal(10,2)` | 价格、余额 |
| **日期时间** | `datetime` | 创建时间、发布时间 |
| **布尔值** | `boolean` | 是否上架、是否推荐 |
| **枚举** | `enum` | 订单状态 (可选) |
| **JSON** | `json` | 扩展字段、配置信息 |

---

#### 法则 4：状态字段要清晰

```typescript
// ❌ 错误：状态混乱
@Entity('mall_order')
export class OrderEntity extends BaseEntity {
  @Column()
  status: number;  // 👈 什么状态？有哪些值？不清楚！

  @Column()
  isPaid: boolean;  // 👈 和 status 重复了

  @Column()
  isShipped: boolean;  // 👈 和 status 重复了
}

// ✅ 正确：状态清晰，注释完整
@Entity('mall_order')
export class OrderEntity extends BaseEntity {
  @Column({
    comment: '订单状态 0-待支付 1-待发货 2-待收货 3-已完成 4-已取消 5-售后中',
    default: 0
  })
  status: number;

  @Column({
    comment: '支付状态 0-未支付 1-已支付 2-已退款',
    default: 0
  })
  payStatus: number;

  @Column({
    comment: '发货状态 0-未发货 1-已发货 2-已收货',
    default: 0
  })
  shipStatus: number;
}
```

**状态字段设计原则：**
1. **用数字而非布尔值**（便于扩展）
2. **在注释中列出所有状态值**
3. **必须有默认值**
4. **状态之间要互斥**（不要重复）

---

#### 法则 5：预留扩展字段

```typescript
// ❌ 错误：没有扩展空间
@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  price: number;

  // 后期想加 SKU、规格、促销价？只能改表！
}

// ✅ 正确：预留扩展字段
@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  @Column({ comment: '商品名称' })
  name: string;

  @Column({ comment: '价格', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    comment: '扩展数据（JSON格式）',
    type: 'json',
    nullable: true
  })
  extraData: any;  // 👈 预留扩展字段
}

// 使用扩展字段
const goods = new GoodsEntity();
goods.extraData = {
  promotionPrice: 99.00,  // 促销价
  videoUrl: 'xxx.mp4',    // 视频链接
  virtualSales: 1000,     // 虚拟销量
  customField: 'xxx'      // 任意自定义字段
};
```

**扩展字段的好处：**
- ✅ 无需修改表结构
- ✅ 灵活添加新字段
- ✅ 不影响现有业务
- ⚠️ 注意：不要把核心字段放在扩展字段里

---

#### 法则 6：索引要合理

```typescript
// ❌ 错误：没有索引或索引过多
@Entity('mall_goods')
export class GoodsEntity extends BaseEntity {
  @Column()
  merchantId: number;  // ❌ 高频查询字段没索引

  @Column()
  @Index()
  name: string;  // ❌ 模糊搜索字段加索引无意义

  @Column()
  @Index()
  description: string;  // ❌ 大字段加索引浪费空间
}

// ✅ 正确：合理添加索引
@Entity('mall_goods')
@Index(['merchantId', 'status'])  // 👈 复合索引（常用组合查询）
export class GoodsEntity extends BaseEntity {
  @Column({ comment: '商户ID' })
  @Index()  // 👈 单独索引（高频查询）
  merchantId: number;

  @Column({ comment: '商品名称' })
  name: string;  // ❌ 不加索引（模糊搜索用全文索引）

  @Column({ comment: '状态' })
  @Index()  // 👈 单独索引（状态筛选）
  status: number;

  @Column({ comment: '商品编号', unique: true })
  @Index()  // 👈 唯一索引（精确查询）
  goodsNo: string;
}
```

**索引添加原则：**
| 场景 | 是否加索引 | 原因 |
|------|-----------|------|
| **高频查询字段** | ✅ 必须 | merchantId, userId, status |
| **唯一字段** | ✅ 必须 | 订单号、商品编号 |
| **复合查询** | ✅ 推荐 | (merchantId, status) |
| **大文本字段** | ❌ 不推荐 | 浪费空间，用全文索引 |
| **低频查询** | ❌ 不推荐 | 备注、描述 |

---

#### 法则 7：关联关系要明确

```typescript
// ❌ 错误：关联关系不明确
@Entity('mall_order')
export class OrderEntity extends BaseEntity {
  @Column()
  userId: number;  // 👈 只有 ID，无法直接查用户信息
}

// ✅ 正确：定义关联关系
import { ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entity/info';

@Entity('mall_order')
export class OrderEntity extends BaseEntity {
  @Column({ comment: '用户ID' })
  userId: number;

  // 多对一：多个订单属于一个用户
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;  // 👈 可以直接访问用户信息
}

// 查询时可以联表
const order = await orderRepository
  .createQueryBuilder('order')
  .leftJoinAndSelect('order.user', 'user')  // 👈 自动关联
  .where('order.id = :id', { id: 1 })
  .getOne();

console.log(order.user.username);  // 👈 直接访问用户名
```

**关联类型选择：**
- **一对一 (OneToOne)**: 用户 ↔ 用户详情
- **一对多 (OneToMany)**: 订单 ↔ 订单明细
- **多对一 (ManyToOne)**: 商品 ↔ 商户
- **多对多 (ManyToMany)**: 商品 ↔ 标签

---

### 🎓 多商户商城核心表设计（可直接使用）

#### 1. 商户表 (mall_merchant)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

@Entity('mall_merchant')
export class MallMerchantEntity extends BaseEntity {
  @Column({ comment: '商户名称', length: 100 })
  name: string;

  @Column({ comment: '商户编号', unique: true, length: 50 })
  @Index()
  merchantNo: string;

  @Column({ comment: '负责人姓名', length: 50 })
  contactName: string;

  @Column({ comment: '联系电话', length: 20 })
  contactPhone: string;

  @Column({ comment: '商户类型 1-企业 2-个体户', default: 1 })
  type: number;

  @Column({ comment: '店铺名称', length: 100 })
  shopName: string;

  @Column({ comment: '店铺logo', nullable: true })
  shopLogo: string;

  @Column({ comment: '状态 0-待审核 1-正常 2-冻结', default: 0 })
  @Index()
  status: number;

  @Column({ comment: '保证金', type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositAmount: number;

  @Column({ comment: '佣金比例(%)', type: 'decimal', precision: 5, scale: 2, default: 5 })
  commissionRate: number;

  @Column({ comment: '扩展信息', type: 'json', nullable: true })
  extraData: any;
}
```

#### 2. 商品表 (mall_goods)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { MallMerchantEntity } from './merchant';

@Entity('mall_goods')
@Index(['merchantId', 'status'])  // 复合索引
export class MallGoodsEntity extends BaseEntity {
  @Column({ comment: '商户ID' })
  @Index()
  merchantId: number;

  @Column({ comment: '商品名称', length: 200 })
  name: string;

  @Column({ comment: '商品编号', unique: true, length: 50 })
  @Index()
  goodsNo: string;

  @Column({ comment: '商品主图' })
  mainImage: string;

  @Column({ comment: '商品图片', type: 'json', nullable: true })
  images: string[];

  @Column({ comment: '商品价格', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: '市场价', type: 'decimal', precision: 10, scale: 2, nullable: true })
  marketPrice: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '销量', default: 0 })
  sales: number;

  @Column({ comment: '状态 0-下架 1-上架 2-审核中', default: 0 })
  @Index()
  status: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '商品详情', type: 'text', nullable: true })
  detail: string;

  @Column({ comment: '扩展信息', type: 'json', nullable: true })
  extraData: any;

  // 关联商户
  @ManyToOne(() => MallMerchantEntity)
  @JoinColumn({ name: 'merchant_id' })
  merchant: MallMerchantEntity;
}
```

#### 3. SKU表 (mall_goods_sku)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { MallGoodsEntity } from './goods';

@Entity('mall_goods_sku')
@Index(['goodsId', 'isDeleted'])
export class MallGoodsSkuEntity extends BaseEntity {
  @Column({ comment: '商品ID' })
  @Index()
  goodsId: number;

  @Column({ comment: 'SKU编号', unique: true, length: 50 })
  @Index()
  skuNo: string;

  @Column({ comment: '规格名称', length: 200 })
  specName: string;

  @Column({ comment: '规格图片', nullable: true })
  specImage: string;

  @Column({ comment: 'SKU价格', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: 'SKU库存', default: 0 })
  stock: number;

  @Column({ comment: '规格属性', type: 'json', nullable: true })
  attrs: any;  // { color: '红色', size: 'XL' }

  // 关联商品
  @ManyToOne(() => MallGoodsEntity)
  @JoinColumn({ name: 'goods_id' })
  goods: MallGoodsEntity;
}
```

#### 4. 订单表 (mall_order)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { MallOrderItemEntity } from './order-item';

@Entity('mall_order')
@Index(['merchantId', 'status'])
@Index(['userId', 'createTime'])
export class MallOrderEntity extends BaseEntity {
  @Column({ comment: '订单号', unique: true, length: 50 })
  @Index()
  orderNo: string;

  @Column({ comment: '商户ID' })
  @Index()
  merchantId: number;

  @Column({ comment: '用户ID' })
  @Index()
  userId: number;

  @Column({ comment: '商品总金额', type: 'decimal', precision: 10, scale: 2 })
  goodsAmount: number;

  @Column({ comment: '运费', type: 'decimal', precision: 10, scale: 2, default: 0 })
  freight: number;

  @Column({ comment: '优惠金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ comment: '实付金额', type: 'decimal', precision: 10, scale: 2 })
  payAmount: number;

  @Column({ comment: '订单状态 0-待支付 1-待发货 2-待收货 3-已完成 4-已取消', default: 0 })
  @Index()
  status: number;

  @Column({ comment: '支付状态 0-未支付 1-已支付', default: 0 })
  payStatus: number;

  @Column({ comment: '支付时间', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ comment: '收货人', length: 50 })
  receiverName: string;

  @Column({ comment: '收货电话', length: 20 })
  receiverPhone: string;

  @Column({ comment: '收货地址', length: 500 })
  receiverAddress: string;

  @Column({ comment: '买家留言', type: 'text', nullable: true })
  buyerMessage: string;

  @Column({ comment: '扩展信息', type: 'json', nullable: true })
  extraData: any;

  // 一对多：订单明细
  @OneToMany(() => MallOrderItemEntity, item => item.order)
  items: MallOrderItemEntity[];
}
```

#### 5. 订单明细表 (mall_order_item)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { MallOrderEntity } from './order';

@Entity('mall_order_item')
@Index(['orderId'])
export class MallOrderItemEntity extends BaseEntity {
  @Column({ comment: '订单ID' })
  @Index()
  orderId: number;

  @Column({ comment: '商品ID' })
  goodsId: number;

  @Column({ comment: 'SKU ID', nullable: true })
  skuId: number;

  @Column({ comment: '商品名称', length: 200 })
  goodsName: string;

  @Column({ comment: '商品图片' })
  goodsImage: string;

  @Column({ comment: '规格名称', length: 200, nullable: true })
  specName: string;

  @Column({ comment: '商品单价', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: '购买数量' })
  quantity: number;

  @Column({ comment: '小计金额', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  // 关联订单
  @ManyToOne(() => MallOrderEntity, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: MallOrderEntity;
}
```

---

### ⚠️ 常见错误和解决方案

#### 错误 1：忘记添加 comment

```typescript
// ❌ 错误
@Column()
name: string;

// ✅ 正确
@Column({ comment: '商品名称' })
name: string;
```

**为什么要加 comment？**
- 数据库里能看到字段说明
- 团队协作更清晰
- Swagger 文档自动生成注释

#### 错误 2：金额字段用错类型

```typescript
// ❌ 错误：精度丢失
@Column()
price: number;

// ✅ 正确：decimal 类型
@Column({ type: 'decimal', precision: 10, scale: 2 })
price: number;
```

#### 错误 3：没有默认值导致插入失败

```typescript
// ❌ 错误
@Column()
status: number;  // 插入时必须传值，容易漏

// ✅ 正确
@Column({ default: 0 })
status: number;  // 有默认值，插入时可不传
```

#### 错误 4：索引加错位置

```typescript
// ❌ 错误：大文本加索引
@Column({ type: 'text' })
@Index()
description: string;

// ✅ 正确：只给常用查询字段加索引
@Column()
@Index()
merchantId: number;
```

---

### 🎯 表设计自检清单

设计完表后，按这个清单检查一遍：

- [ ] 所有实体都继承了 `BaseEntity`
- [ ] 业务表都添加了 `merchantId` 字段
- [ ] 金额字段都用了 `decimal(10,2)`
- [ ] 所有字段都有 `comment` 注释
- [ ] 状态字段都有默认值和完整注释
- [ ] 高频查询字段都加了索引
- [ ] 唯一字段加了 `unique: true`
- [ ] 可为空字段标注了 `nullable: true`
- [ ] 大文本字段用了 `text` 或 `longtext`
- [ ] 预留了 `extraData` 扩展字段
- [ ] 关联关系定义清晰（ManyToOne/OneToMany）

---

### 💡 最佳实践建议

1. **先设计ER图，再写代码**
   - 用 draw.io 画出表关系
   - 确认无遗漏后再编码

2. **参考成熟项目**
   - 看看淘宝、京东的开源项目
   - 参考 Cool-Admin 的 demo 模块

3. **小步迭代**
   - 第一版只实现核心表
   - 验证通过后再加扩展表

4. **版本管理**
   - 每次表结构变动都提交 Git
   - 写好变更说明

5. **使用迁移工具**（生产环境）
   ```bash
   # TypeORM 迁移
   npm run migration:generate
   npm run migration:run
   ```

---

### 🚀 总结

**新手最容易犯的5个错误：**
1. ❌ 不继承 BaseEntity
2. ❌ 忘记加 merchantId
3. ❌ 金额字段用 number
4. ❌ 没有默认值和注释
5. ❌ 索引乱加或不加

**记住这3点就不会错：**
1. ✅ **继承 BaseEntity + 加 merchantId**
2. ✅ **金额用 decimal + 状态有默认值**
3. ✅ **高频查询加索引 + 预留扩展字段**

**有了上面的表设计，你的项目 90% 不会推倒重构！**

---

需要我：
1. 帮你审核设计的表结构？
2. 生成完整的建表 SQL？
3. 创建示例代码？
