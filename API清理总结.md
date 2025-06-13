# API清理总结

## 清理概述

根据用户要求，我们对前后端的重复和多余API进行了全面清理，统一了接口风格，提高了代码的可维护性。

## 删除的重复API文件

### 前端API文件清理

#### 1. 删除的文件
- `src/api/teacherStudent.js` - 与teacherCourse.js功能重复
- `src/api/homework.js` - 混合了学生端和教师端API，功能分散
- `src/api/student/courseHomework.js` - 与homework.js功能重复
- `src/api/student/dist/` 目录下的所有编译文件

#### 2. 简化的文件
- `src/api/teacher/course.js` - 移除了重复的学生管理API，专注于课程基本操作

## 保留的API文件结构

### 学生端API
```
src/api/student/
├── homework.js          # 学生作业相关API (RESTful)
├── exam.js             # 学生测验相关API (RESTful)
├── courseResource.js   # 课程资源API
└── grade.js           # 成绩查询API

src/api/
├── studentCourse.js    # 学生课程管理API (选课/退课)
└── studentExam.js      # 学生测验API (备用)
```

### 教师端API
```
src/api/teacher/
├── homework.js         # 教师作业管理API (RESTful)
├── course.js          # 教师课程基本API
└── question.js        # 教师题目管理API

src/api/
├── teacherCourse.js   # 教师课程和学生管理API (主要使用)
└── teacherExam.js     # 教师测验管理API
```

### 管理员API
```
src/api/
├── course.js          # 管理员课程管理API (RESTful)
├── examPaper.js       # 试卷管理API
├── task.js           # 任务管理API
└── subject.js        # 学科管理API
```

## API使用规范

### 1. RESTful风格统一
所有新的API都采用RESTful风格：
- **GET**: 查询操作
- **POST**: 创建操作
- **PUT**: 更新操作
- **DELETE**: 删除操作

### 2. 路径规范
#### 学生端API路径
```
GET    /api/student/courses                           # 获取已选课程
GET    /api/student/courses/available                 # 获取可选课程
GET    /api/student/courses/{courseId}/homework       # 获取课程作业
GET    /api/student/courses/{courseId}/exams          # 获取课程测验
POST   /api/student/courses/{courseId}/homework/{id}/submit  # 提交作业
```

#### 教师端API路径
```
GET    /api/teacher/courses                           # 获取教师课程
GET    /api/teacher/courses/{courseId}/students       # 获取课程学生
GET    /api/teacher/courses/{courseId}/homework       # 获取课程作业
POST   /api/teacher/courses/{courseId}/homework       # 创建作业
PUT    /api/teacher/courses/{courseId}/homework/{id}  # 更新作业
```

#### 管理员API路径
```
GET    /api/admin/course/{courseId}/students          # 获取课程学生
GET    /api/admin/course/{courseId}/teachers          # 获取课程教师
PUT    /api/admin/course/changeStatus/{id}            # 更改课程状态
DELETE /api/admin/course/delete/{id}                  # 删除课程
```

## 主要改进

### 1. 消除重复
- 删除了功能重复的API文件
- 统一了相同功能的API接口
- 减少了代码维护成本

### 2. 规范化
- 统一使用RESTful风格
- 规范了HTTP方法使用
- 统一了路径命名规范

### 3. 模块化
- 按角色分离API文件
- 按功能模块组织代码
- 提高了代码可读性

## 向后兼容性

为了确保现有代码的兼容性，我们在一些API文件中保留了向后兼容的函数：

```javascript
// 在student/homework.js中
export function studentHomeworkListLegacy(params) {
  if (!params.courseId) {
    return Promise.reject(new Error('courseId is required'))
  }
  return studentHomeworkList(params.courseId, params)
}

// 在teacher/homework.js中
export function homeworkPageLegacy(params) {
  if (!params.courseId) {
    return Promise.reject(new Error('courseId is required'))
  }
  return homeworkPage(params.courseId, params)
}
```

## 使用建议

### 1. 新开发
- 优先使用RESTful风格的API
- 按照新的路径规范组织接口
- 使用正确的HTTP方法

### 2. 现有代码迁移
- 逐步将现有页面迁移到新API
- 利用向后兼容函数平滑过渡
- 测试确保功能正常

### 3. API文档
- 更新API文档反映新的接口规范
- 标记废弃的API接口
- 提供迁移指南

## 清理效果

### 前端文件减少
- 删除了5个重复的API文件
- 简化了1个API文件
- 清理了编译生成的临时文件

### 代码质量提升
- 消除了功能重复
- 统一了接口风格
- 提高了可维护性

### 开发效率
- 减少了API选择的困惑
- 统一了开发规范
- 降低了学习成本

## 后续工作

1. **测试验证**: 确保所有修改的API正常工作
2. **文档更新**: 更新API文档和开发指南
3. **代码审查**: 检查是否还有其他重复代码
4. **性能优化**: 基于新的API结构进行性能优化

这次API清理为系统的进一步开发和维护奠定了良好的基础，提高了代码质量和开发效率。
