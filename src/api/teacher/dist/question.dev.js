"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.deleteCourseQuestion = exports.deleteQuestion = exports.updateCourseQuestion = exports.updateQuestion = exports.createCourseQuestion = exports.createQuestion = exports.getCourseQuestionById = exports.getQuestionById = exports.courseQuestionPage = exports.questionPage = void 0;

var _request = require("@/utils/request");

var questionPage = function questionPage(params) {
  return (0, _request.post)('/api/teacher/question/page', params);
};
/**
 * 根据课程ID分页查询题目列表 (RESTful风格)
 */


exports.questionPage = questionPage;

var courseQuestionPage = function courseQuestionPage(courseId, params) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions"), params);
};

exports.courseQuestionPage = courseQuestionPage;

var getQuestionById = function getQuestionById(questionId) {
  if (!questionId || questionId === 'undefined') {
    console.error('Invalid questionId:', questionId);
    return Promise.reject(new Error('无效的题目ID'));
  }

  return (0, _request.get)("/api/teacher/question/".concat(questionId));
};
/**
 * 根据课程获取题目详情 (RESTful风格)
 */


exports.getQuestionById = getQuestionById;

var getCourseQuestionById = function getCourseQuestionById(courseId, questionId) {
  if (!courseId || !questionId || courseId === 'undefined' || questionId === 'undefined') {
    console.error('Invalid courseId or questionId:', courseId, questionId);
    return Promise.reject(new Error('无效的课程ID或题目ID'));
  }

  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/").concat(questionId));
};

exports.getCourseQuestionById = getCourseQuestionById;

var createQuestion = function createQuestion(data) {
  return (0, _request.post)('/api/teacher/question/create', data);
};
/**
 * 创建课程题目 (RESTful风格)
 */


exports.createQuestion = createQuestion;

var createCourseQuestion = function createCourseQuestion(courseId, data) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/edit"), data);
};

exports.createCourseQuestion = createCourseQuestion;

var updateQuestion = function updateQuestion(data) {
  return (0, _request.put)('/api/teacher/question/update', data);
};
/**
 * 更新课程题目 (RESTful风格)
 */


exports.updateQuestion = updateQuestion;

var updateCourseQuestion = function updateCourseQuestion(courseId, data) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/edit"), data);
};

exports.updateCourseQuestion = updateCourseQuestion;

var deleteQuestion = function deleteQuestion(questionId) {
  if (!questionId || questionId === 'undefined') {
    console.error('Invalid questionId:', questionId);
    return Promise.reject(new Error('无效的题目ID'));
  }

  return (0, _request.del)("/api/teacher/question/".concat(questionId));
};
/**
 * 删除课程题目 (RESTful风格)
 */


exports.deleteQuestion = deleteQuestion;

var deleteCourseQuestion = function deleteCourseQuestion(courseId, questionId) {
  return (0, _request.post)("/api/teacher/courses/".concat(courseId, "/questions/").concat(questionId, "/delete"));
};

exports.deleteCourseQuestion = deleteCourseQuestion;
var _default = {
  questionPage: questionPage,
  courseQuestionPage: courseQuestionPage,
  getQuestionById: getQuestionById,
  getCourseQuestionById: getCourseQuestionById,
  createQuestion: createQuestion,
  createCourseQuestion: createCourseQuestion,
  updateQuestion: updateQuestion,
  updateCourseQuestion: updateCourseQuestion,
  deleteQuestion: deleteQuestion,
  deleteCourseQuestion: deleteCourseQuestion
};
exports["default"] = _default;