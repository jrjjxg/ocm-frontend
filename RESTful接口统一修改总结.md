# RESTful接口统一修改总结

## 修改概述

根据`claude的理解.md`文档中的分析，我们对学生端和教师端的前后端接口进行了统一的RESTful风格改造，解决了API路径不一致和HTTP方法使用不规范的问题。

## 主要修改内容

### 1. 学生端作业接口统一

#### 前端API修改 (`src/api/student/homework.js`)
**修改前（非RESTful）：**
```javascript
// 获取作业列表
export function studentHomeworkList(params) {
  return post('/api/student/homework/list', params)
}

// 获取作业详情
export function homeworkDetail(id) {
  return get(`/api/student/homework/${id}`)
}

// 提交作业
export function submitHomeworkAnswer(data) {
  return post('/api/student/homework/submit', data)
}
```

**修改后（RESTful）：**
```javascript
// 获取课程作业列表 (RESTful风格)
export function studentHomeworkList(courseId, params) {
  return get(`/api/student/courses/${courseId}/homework`, { params })
}

// 获取作业详情（RESTful风格）
export function homeworkDetail(courseId, homeworkId) {
  return get(`/api/student/courses/${courseId}/homework/${homeworkId}`)
}

// 提交作业答案 (RESTful风格)
export function submitHomeworkAnswer(courseId, homeworkId, data) {
  return post(`/api/student/courses/${courseId}/homework/${homeworkId}/submit`, data)
}
```

#### 后端控制器修改 (`src/main/java/com/mindskip/xzs/controller/student/StudentCourseHomeworkController.java`)
**修改前：**
```java
@PostMapping("/{courseId}/homework")
public RestResponse<List<AssignmentListVM>> getCourseHomework(@PathVariable Long courseId) {
```

**修改后：**
```java
@GetMapping("/{courseId}/homework")  // 改为GET方法
public RestResponse<List<AssignmentListVM>> getCourseHomework(@PathVariable Long courseId) {
```

### 2. 教师端作业接口统一

#### 新建RESTful控制器 (`src/main/java/com/mindskip/xzs/controller/teacher/TeacherCourseHomeworkController.java`)
创建了全新的基于课程上下文的RESTful作业控制器：
```java
@RestController("TeacherCourseHomeworkController")
@RequestMapping("/api/teacher/courses")
public class TeacherCourseHomeworkController extends BaseApiController {
    
    // 获取课程作业列表 (RESTful风格 - 使用GET方法)
    @GetMapping("/{courseId}/homework")
    public RestResponse<PageInfo<Homework>> getCourseHomework(@PathVariable Long courseId, ...)
    
    // 创建课程作业 (RESTful风格)
    @PostMapping("/{courseId}/homework")
    public RestResponse<?> createHomework(@PathVariable Long courseId, ...)
    
    // 获取课程作业详情 (RESTful风格)
    @GetMapping("/{courseId}/homework/{homeworkId}")
    public RestResponse<Homework> getHomework(@PathVariable Long courseId, ...)
    
    // 更新课程作业 (RESTful风格)
    @PutMapping("/{courseId}/homework/{homeworkId}")
    public RestResponse<?> updateHomework(@PathVariable Long courseId, ...)
    
    // 删除课程作业 (RESTful风格)
    @DeleteMapping("/{courseId}/homework/{homeworkId}")
    public RestResponse<?> deleteHomework(@PathVariable Long courseId, ...)
}
```

#### 前端API修改 (`src/api/teacher/homework.js`)
**修改前（非RESTful）：**
```javascript
// 分页查询作业列表
export function homeworkPage(params) {
  return post('/api/teacher/homework/page', params)
}

// 创建作业
export function homeworkCreate(data) {
  return post('/api/teacher/homework/create', data)
}
```

**修改后（RESTful）：**
```javascript
// 获取课程作业列表 (RESTful风格 - 使用GET方法)
export function homeworkPage(courseId, params = {}) {
  return get(`/api/teacher/courses/${courseId}/homework`, { params })
}

// 创建课程作业 (RESTful风格)
export function homeworkCreate(courseId, data) {
  return post(`/api/teacher/courses/${courseId}/homework`, data)
}
```

### 3. 课程管理接口规范化

#### 教师端课程控制器 (`src/main/java/com/mindskip/xzs/controller/teacher/CourseController.java`)
**修改前：**
```java
@RequestMapping(value = "", method = RequestMethod.GET)
@RequestMapping(value = "/{id}", method = RequestMethod.POST)
```

**修改后：**
```java
@GetMapping("")
@GetMapping("/{id}")  // 改为GET方法
```

#### 管理员课程控制器 (`src/main/java/com/mindskip/xzs/controller/admin/CourseController.java`)
**修改前：**
```java
@RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
@RequestMapping(value = "/changeStatus/{id}", method = RequestMethod.POST)
@RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
```

**修改后：**
```java
@GetMapping("/select/{id}")      // 查询改为GET
@PutMapping("/changeStatus/{id}") // 更新改为PUT
@DeleteMapping("/delete/{id}")    // 删除改为DELETE
```

### 4. 前端API调用规范化

#### 学生端课程作业API (`src/api/student/courseHomework.js`)
```javascript
// 修改前
export function getCourseHomework(courseId, params) {
  return post(`/api/student/courses/${courseId}/homework`, params)
}

// 修改后
export function getCourseHomework(courseId, params) {
  return get(`/api/student/courses/${courseId}/homework`, { params })
}
```

#### 管理员课程API (`src/api/course.js`)
```javascript
// 修改前
getCourse: id => post('/api/admin/course/select/' + id),
changeStatus: id => post('/api/admin/course/changeStatus/' + id),
deleteCourse: id => post('/api/admin/course/delete/' + id),

// 修改后
getCourse: id => get('/api/admin/course/select/' + id),
changeStatus: id => put('/api/admin/course/changeStatus/' + id),
deleteCourse: id => del('/api/admin/course/delete/' + id),
```

## HTTP方法使用规范

### 修改前的问题
- 大量查询操作使用POST方法
- 更新操作使用POST而非PUT
- 删除操作使用POST而非DELETE

### 修改后的规范
- **GET**: 用于查询操作（获取资源）
- **POST**: 用于创建操作（创建新资源）
- **PUT**: 用于更新操作（更新现有资源）
- **DELETE**: 用于删除操作（删除资源）

## API路径统一规范

### 学生端API路径
```
GET    /api/student/courses                           # 获取学生课程列表
GET    /api/student/courses/available                 # 获取可选课程
GET    /api/student/courses/{courseId}                # 获取课程详情
POST   /api/student/courses/{courseId}/enroll         # 选课
DELETE /api/student/courses/{courseId}/enroll         # 退课

GET    /api/student/courses/{courseId}/homework       # 获取课程作业列表
GET    /api/student/courses/{courseId}/homework/{id}  # 获取作业详情
POST   /api/student/courses/{courseId}/homework/{id}/start   # 开始作业
POST   /api/student/courses/{courseId}/homework/{id}/submit  # 提交作业

GET    /api/student/courses/{courseId}/exams          # 获取课程测验列表
GET    /api/student/courses/{courseId}/exams/{id}     # 获取测验详情
POST   /api/student/courses/{courseId}/exams/{id}/start      # 开始测验
POST   /api/student/courses/{courseId}/exams/{id}/submit     # 提交测验
```

### 教师端API路径
```
GET    /api/teacher/courses                           # 获取教师课程列表
GET    /api/teacher/courses/{courseId}                # 获取课程详情

GET    /api/teacher/courses/{courseId}/homework       # 获取课程作业列表
POST   /api/teacher/courses/{courseId}/homework       # 创建课程作业
GET    /api/teacher/courses/{courseId}/homework/{id}  # 获取作业详情
PUT    /api/teacher/courses/{courseId}/homework/{id}  # 更新作业
DELETE /api/teacher/courses/{courseId}/homework/{id}  # 删除作业

GET    /api/teacher/courses/{courseId}/exams          # 获取课程测验列表
POST   /api/teacher/courses/{courseId}/exams          # 创建课程测验
GET    /api/teacher/courses/{courseId}/exams/{id}     # 获取测验详情
PUT    /api/teacher/courses/{courseId}/exams/{id}     # 更新测验
DELETE /api/teacher/courses/{courseId}/exams/{id}     # 删除测验
```

## 向后兼容性

为了确保现有代码的兼容性，我们在修改的API文件中保留了向后兼容的函数：

```javascript
// 向后兼容函数
export function studentHomeworkListLegacy(params) {
  if (!params.courseId) {
    return Promise.reject(new Error('courseId is required'))
  }
  return studentHomeworkList(params.courseId, params)
}
```

## 下一步建议

1. **测试验证**: 启动前后端应用，测试所有修改的接口是否正常工作
2. **前端页面更新**: 更新相关的Vue组件，确保使用新的API调用方式
3. **文档更新**: 更新API文档，反映新的RESTful接口规范
4. **逐步迁移**: 将现有页面逐步迁移到新的RESTful接口

## 修改文件清单

### 后端文件
- `src/main/java/com/mindskip/xzs/controller/student/StudentCourseHomeworkController.java` (修改)
- `src/main/java/com/mindskip/xzs/controller/teacher/TeacherCourseHomeworkController.java` (新建)
- `src/main/java/com/mindskip/xzs/controller/teacher/CourseController.java` (修改)
- `src/main/java/com/mindskip/xzs/controller/admin/CourseController.java` (修改)

### 前端文件
- `src/api/student/homework.js` (修改)
- `src/api/student/courseHomework.js` (修改)
- `src/api/teacher/homework.js` (修改)
- `src/api/course.js` (修改)
- `src/api/teacherCourse.js` (修改)

这些修改统一了前后端接口风格，解决了API路径不一致和HTTP方法使用不规范的问题，为系统的进一步开发和维护奠定了良好的基础。
