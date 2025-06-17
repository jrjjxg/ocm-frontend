"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _request = require("@/utils/request");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = {
  // 获取课程测验列表
  getExamList: function getExamList(courseId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/exams"));
  },
  // 获取单个测验详情
  getExam: function getExam(courseId, examId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId));
  },
  // 获取测验的试卷题目详情
  getExamPaper: function getExamPaper(courseId, examId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId, "/paper"));
  },
  // 创建新测验
  createExam: function createExam(courseId, data) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/exams"), data);
  },
  // 更新测验
  updateExam: function updateExam(courseId, examId, data) {
    return (0, _request.put)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId), data);
  },
  // 删除测验
  deleteExam: function deleteExam(courseId, examId) {
    return (0, _request.del)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId));
  },
  // 获取测验成绩
  getExamResults: function getExamResults(courseId, examId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId, "/results"));
  },
  // 获取可用试卷列表
  getPaperList: function getPaperList(courseId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/papers"));
  },
  // 题库管理相关API
  // 获取题目分页列表
  getQuestionList: function getQuestionList(courseId, query) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions"), query);
  },
  // 获取题目详情
  getQuestion: function getQuestion(courseId, questionId) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/").concat(questionId));
  },
  // 创建题目
  createQuestion: function createQuestion(courseId, data) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/edit"), data);
  },
  // 更新题目
  updateQuestion: function updateQuestion(courseId, questionId, data) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/edit"), _objectSpread({}, data, {
      id: questionId
    }));
  },
  // 删除题目
  deleteQuestion: function deleteQuestion(courseId, questionId) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/").concat(questionId, "/delete"));
  },
  // 试卷管理相关API
  // 获取试卷分页列表
  getPaperPage: function getPaperPage(courseId, query) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/papers/page"), query);
  },
  // 创建试卷
  createPaper: function createPaper(courseId, data) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/papers"), data);
  },
  // 更新试卷
  updatePaper: function updatePaper(courseId, paperId, data) {
    return (0, _request.put)("/api/teacher/courses/".concat(courseId, "/papers/").concat(paperId), data);
  },
  // 获取试卷详情
  selectPaper: function selectPaper(courseId, paperId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/papers/").concat(paperId));
  },
  // 删除试卷
  deletePaper: function deletePaper(courseId, paperId) {
    return (0, _request.del)("/api/teacher/courses/".concat(courseId, "/papers/").concat(paperId));
  },
  // 获取测验答卷列表
  getExamAnswers: function getExamAnswers(courseId, examId, query) {
    return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId, "/answers"), query);
  },
  // 获取单个答卷信息
  getAnswerInfo: function getAnswerInfo(courseId, examId, answerId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId, "/answers/").concat(answerId));
  },
  // 评阅测验答卷
  evaluateAnswer: function evaluateAnswer(courseId, examId, answerId, data) {
    return (0, _request.put)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId, "/answers/").concat(answerId), data);
  },
  // 获取成绩统计数据
  getStatistics: function getStatistics(courseId, examId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId, "/statistics"));
  },
  // 获取答卷详细题目答案
  getAnswerQuestions: function getAnswerQuestions(courseId, examId, answerId) {
    return (0, _request.get)("/api/teacher/courses/".concat(courseId, "/exams/").concat(examId, "/answers/").concat(answerId, "/questions"));
  }
};
exports["default"] = _default;