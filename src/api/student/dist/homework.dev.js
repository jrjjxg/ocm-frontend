"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.studentHomeworkList = studentHomeworkList;
exports.homeworkDetail = homeworkDetail;
exports.startHomework = startHomework;
exports.submitHomeworkAnswer = submitHomeworkAnswer;
exports.saveHomeworkDraft = saveHomeworkDraft;
exports.getHomeworkResult = getHomeworkResult;
exports.getStudentAnswers = getStudentAnswers;
exports.studentHomeworkListLegacy = studentHomeworkListLegacy;
exports["default"] = void 0;

var _request = require("@/utils/request");

function studentHomeworkList(courseId, params) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/homework"), params);
}
/**
 * 获取作业详情（学生端）(RESTful风格)
 */


function homeworkDetail(courseId, homeworkId) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/homework/").concat(homeworkId));
}
/**
 * 开始作业 (RESTful风格)
 */


function startHomework(courseId, homeworkId) {
  return (0, _request.post)("/api/student/courses/".concat(courseId, "/homework/").concat(homeworkId, "/start"));
}
/**
 * 提交作业答案 (RESTful风格)
 */


function submitHomeworkAnswer(courseId, homeworkId, data) {
  return (0, _request.post)("/api/student/courses/".concat(courseId, "/homework/").concat(homeworkId, "/submit"), data);
}
/**
 * 保存作业草稿 (RESTful风格)
 */


function saveHomeworkDraft(courseId, homeworkId, data) {
  return (0, _request.post)("/api/student/courses/".concat(courseId, "/homework/").concat(homeworkId, "/save"), data);
}
/**
 * 获取作业结果 (RESTful风格)
 */


function getHomeworkResult(courseId, homeworkId) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/homework/").concat(homeworkId, "/result"));
}
/**
 * 获取学生的答题记录 (RESTful风格)
 */


function getStudentAnswers(courseId, homeworkId) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/homework/").concat(homeworkId, "/answers"));
} // 为了向后兼容，保留旧版本函数名但使用新的RESTful接口
// 注意：这些函数需要courseId参数，调用时需要传入


function studentHomeworkListLegacy(params) {
  // 这个函数需要courseId，如果没有提供则返回错误
  if (!params.courseId) {
    return Promise.reject(new Error('courseId is required'));
  }

  return studentHomeworkList(params.courseId, params);
}

var _default = {
  studentHomeworkList: studentHomeworkList,
  homeworkDetail: homeworkDetail,
  startHomework: startHomework,
  submitHomeworkAnswer: submitHomeworkAnswer,
  saveHomeworkDraft: saveHomeworkDraft,
  getHomeworkResult: getHomeworkResult,
  getStudentAnswers: getStudentAnswers,
  // 向后兼容
  studentHomeworkListLegacy: studentHomeworkListLegacy
};
exports["default"] = _default;