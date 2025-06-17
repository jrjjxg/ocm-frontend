"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStudentExams = getStudentExams;
exports.getExamDetail = getExamDetail;
exports.getExamHistoryRecords = getExamHistoryRecords;
exports.startExam = startExam;
exports.submitExamAnswer = submitExamAnswer;
exports.saveExamDraft = saveExamDraft;
exports.getExamResult = getExamResult;
exports.getStudentExamAnswers = getStudentExamAnswers;
exports.getExamPaper = getExamPaper;
exports.submitExamPaper = submitExamPaper;
exports.getExamStatus = getExamStatus;
exports["default"] = void 0;

var _request = require("@/utils/request");

function getStudentExams(courseId, params) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/exams"), params);
}
/**
 * 获取测验详情（学生端）
 */


function getExamDetail(examId, courseId) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/exams/").concat(examId));
}
/**
 * 获取考试历史记录
 */


function getExamHistoryRecords(examId, courseId) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/exams/").concat(examId, "/history"));
}
/**
 * 开始测验
 */


function startExam(courseId, examId) {
  return (0, _request.post)("/api/student/courses/".concat(courseId, "/exams/").concat(examId, "/start"));
}
/**
 * 提交测验答案
 */


function submitExamAnswer(courseId, examId, data) {
  return (0, _request.post)("/api/student/courses/".concat(courseId, "/exams/").concat(examId, "/submit"), data);
}
/**
 * 保存测验答案草稿
 */


function saveExamDraft(courseId, examId, data) {
  return (0, _request.post)("/api/student/courses/".concat(courseId, "/exams/").concat(examId, "/save"), data);
}
/**
 * 获取测验结果
 */


function getExamResult(courseId, examId) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/exams/").concat(examId, "/result"));
}
/**
 * 获取学生的答题记录
 */


function getStudentExamAnswers(courseId, examId) {
  return (0, _request.get)("/api/student/courses/".concat(courseId, "/exams/").concat(examId, "/answers"));
} // 独立考试相关接口

/**
 * 获取试卷详情
 */


function getExamPaper(examPaperId) {
  return (0, _request.get)("/api/student/exam-papers/".concat(examPaperId));
}
/**
 * 提交考试答案
 */


function submitExamPaper(examPaperId, data) {
  return (0, _request.post)("/api/student/exam-papers/".concat(examPaperId, "/submit"), data);
}
/**
 * 获取考试状态
 */


function getExamStatus(examPaperId) {
  return (0, _request.get)("/api/student/exam-papers/".concat(examPaperId, "/status"));
}

var _default = {
  getStudentExams: getStudentExams,
  getExamDetail: getExamDetail,
  getExamHistoryRecords: getExamHistoryRecords,
  startExam: startExam,
  submitExamAnswer: submitExamAnswer,
  saveExamDraft: saveExamDraft,
  getExamResult: getExamResult,
  getStudentExamAnswers: getStudentExamAnswers,
  getExamPaper: getExamPaper,
  submitExamPaper: submitExamPaper,
  getExamStatus: getExamStatus
};
exports["default"] = _default;