"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.homeworkPage = homeworkPage;
exports.homeworkCreate = homeworkCreate;
exports.homeworkDetail = homeworkDetail;
exports.homeworkUpdate = homeworkUpdate;
exports.homeworkQuestions = homeworkQuestions;
exports.homeworkPublish = homeworkPublish;
exports.homeworkEnd = homeworkEnd;
exports.homeworkDelete = homeworkDelete;
exports.homeworkStatistics = homeworkStatistics;
exports.homeworkDashboardStatistics = homeworkDashboardStatistics;
exports.homeworkPendingPage = homeworkPendingPage;
exports.homeworkStudentAnswers = homeworkStudentAnswers;
exports.homeworkSubmissions = homeworkSubmissions;
exports.homeworkPageLegacy = homeworkPageLegacy;
exports.homeworkCreateLegacy = homeworkCreateLegacy;
exports.homeworkDetailLegacy = homeworkDetailLegacy;
exports.homeworkManualGrade = homeworkManualGrade;
exports.homeworkGradeStudent = homeworkGradeStudent;
exports["default"] = void 0;

var _request = require("@/utils/request");

function homeworkPage(courseId) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/homework"), params);
}
/**
 * 创建课程作业 (RESTful风格)
 */


function homeworkCreate(courseId, data) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/homework"), data);
}
/**
 * 获取课程作业详情 (RESTful风格)
 */


function homeworkDetail(courseId, homeworkId) {
  return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId));
}
/**
 * 更新课程作业 (RESTful风格)
 */


function homeworkUpdate(courseId, homeworkId, data) {
  return (0, _request.put)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId), data);
}
/**
 * 获取课程作业题目列表 (RESTful风格)
 */


function homeworkQuestions(courseId, homeworkId) {
  return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId, "/questions"));
}
/**
 * 发布课程作业 (RESTful风格)
 */


function homeworkPublish(courseId, homeworkId) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId, "/publish"));
}
/**
 * 结束课程作业 (RESTful风格)
 */


function homeworkEnd(courseId, homeworkId) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId, "/end"));
}
/**
 * 删除课程作业 (RESTful风格)
 */


function homeworkDelete(courseId, homeworkId) {
  return (0, _request.del)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId));
}
/**
 * 获取课程作业统计信息 (RESTful风格)
 */


function homeworkStatistics(courseId, homeworkId) {
  return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId, "/statistics"));
}
/**
 * 获取仪表板统计数据 (保持原有路径，因为这是全局统计)
 */


function homeworkDashboardStatistics() {
  return (0, _request.get)('/api/teacher/homework/dashboard/statistics');
}
/**
 * 分页查询待批改作业 (保持原有路径，因为这是跨课程查询)
 */


function homeworkPendingPage(params) {
  return (0, _request.post)('/api/teacher/homework/pending/page', params);
}
/**
 * 获取学生作业答题情况 (RESTful风格)
 */


function homeworkStudentAnswers(courseId, homeworkId, studentId) {
  return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId, "/students/").concat(studentId, "/answers"));
}
/**
 * 获取作业的学生提交列表 (RESTful风格)
 */


function homeworkSubmissions(courseId, homeworkId) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId, "/submissions"), params);
} // 为了向后兼容，保留旧版本函数但使用新的RESTful接口
// 注意：这些函数需要courseId参数，调用时需要传入


function homeworkPageLegacy(params) {
  if (!params.courseId) {
    return Promise.reject(new Error('courseId is required'));
  }

  return homeworkPage(params.courseId, params);
}

function homeworkCreateLegacy(data) {
  if (!data.courseId) {
    return Promise.reject(new Error('courseId is required'));
  }

  return homeworkCreate(data.courseId, data);
}

function homeworkDetailLegacy(id, courseId) {
  if (!courseId) {
    return Promise.reject(new Error('courseId is required'));
  }

  return homeworkDetail(courseId, id);
}
/**
 * 人工评分 (旧版本API，保持向后兼容)
 */


function homeworkManualGrade(answerId, data) {
  return (0, _request.post)("/api/teacher/homework/answer/".concat(answerId, "/grade"), data);
}
/**
 * 批改学生作业 (RESTful风格)
 */


function homeworkGradeStudent(courseId, homeworkId, studentId, data) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/homework/").concat(homeworkId, "/students/").concat(studentId, "/grade"), data);
}

var _default = {
  homeworkPage: homeworkPage,
  homeworkCreate: homeworkCreate,
  homeworkDetail: homeworkDetail,
  homeworkUpdate: homeworkUpdate,
  homeworkQuestions: homeworkQuestions,
  homeworkPublish: homeworkPublish,
  homeworkEnd: homeworkEnd,
  homeworkDelete: homeworkDelete,
  homeworkStatistics: homeworkStatistics,
  homeworkDashboardStatistics: homeworkDashboardStatistics,
  homeworkPendingPage: homeworkPendingPage,
  homeworkStudentAnswers: homeworkStudentAnswers,
  homeworkManualGrade: homeworkManualGrade,
  homeworkGradeStudent: homeworkGradeStudent,
  homeworkSubmissions: homeworkSubmissions
};
exports["default"] = _default;