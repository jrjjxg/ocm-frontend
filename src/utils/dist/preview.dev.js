"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResourceFullUrl = getResourceFullUrl;
exports.canPreview = canPreview;
exports.getResourceTypeName = getResourceTypeName;
exports.detectResourceTypeByFileName = detectResourceTypeByFileName;
exports.formatFileSize = formatFileSize;
exports["default"] = exports.resourceTypeMap = void 0;

/**
 * 文件预览服务
 */
// 资源类型映射
var resourceTypeMap = {
  1: {
    name: 'PDF文档',
    extensions: ['.pdf'],
    preview: 'pdf',
    category: 'document'
  },
  2: {
    name: '图片',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    preview: 'image',
    category: 'document'
  },
  3: {
    name: '视频',
    extensions: ['.mp4', '.webm', '.ogg'],
    preview: 'video',
    category: 'video'
  },
  4: {
    name: '音频',
    extensions: ['.mp3', '.wav', '.aac', '.flac'],
    preview: 'audio',
    category: 'audio'
  },
  5: {
    name: '纯文本',
    extensions: ['.txt', '.log', '.js', '.css', '.html', '.xml', '.java', '.py', '.c', '.cpp', '.cs'],
    preview: 'text',
    category: 'document'
  },
  7: {
    name: '其他文档',
    extensions: ['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'],
    preview: null,
    category: 'document'
  }
};
/**
 * 获取资源完整URL
 * @param {string} url - 资源相对URL或完整URL
 * @returns {string} 资源完整URL
 */

exports.resourceTypeMap = resourceTypeMap;

function getResourceFullUrl(url) {
  if (!url) return '#'; // 如果已经是完整的URL（带有协议头），则直接返回

  if (url.startsWith('http')) {
    return url;
  } // 如果是以/api开头的，说明是API路径，直接返回（会被代理处理）


  if (url.startsWith('/api')) {
    return url;
  } // 对于资源文件，确保通过代理访问后端
  // 确保URL以斜杠开头，并且不重复添加/resources前缀


  var resourceUrl = url.startsWith('/') ? url : '/' + url; // 如果URL不是以/resources开头，则添加该前缀

  if (!resourceUrl.startsWith('/resources')) {
    resourceUrl = '/resources' + resourceUrl;
  }

  return resourceUrl;
}
/**
 * 检查资源类型是否支持预览
 * @param {number} typeId - 资源类型ID
 * @returns {boolean} 是否支持预览
 */


function canPreview(typeId) {
  return resourceTypeMap[typeId] && resourceTypeMap[typeId].preview !== null;
}
/**
 * 获取资源类型名称
 * @param {number} typeId - 资源类型ID
 * @returns {string} 资源类型名称
 */


function getResourceTypeName(typeId) {
  return resourceTypeMap[typeId] ? resourceTypeMap[typeId].name : '未知类型';
}
/**
 * 根据文件扩展名自动检测资源类型
 * @param {string} fileName - 文件名
 * @returns {number|null} 资源类型ID，未检测到则返回null
 */


function detectResourceTypeByFileName(fileName) {
  if (!fileName) return null;
  var fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  for (var typeKey in resourceTypeMap) {
    if (resourceTypeMap[typeKey].extensions.includes(fileExt)) {
      return parseInt(typeKey);
    }
  }

  return null;
}
/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */


function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  var k = 1024;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

var _default = {
  resourceTypeMap: resourceTypeMap,
  getResourceFullUrl: getResourceFullUrl,
  canPreview: canPreview,
  getResourceTypeName: getResourceTypeName,
  detectResourceTypeByFileName: detectResourceTypeByFileName,
  formatFileSize: formatFileSize
};
exports["default"] = _default;