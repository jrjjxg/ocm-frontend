import { form } from '@/utils/request'

export default {
  /**
   * 上传图片
   * @param {FormData} formData 包含图片文件的FormData对象
   * @returns {Promise} 上传结果
   */
  uploadImage: (formData) => {
    return form('/api/common/upload/image', formData)
  },

  /**
   * 上传文件
   * @param {FormData} formData 包含文件的FormData对象
   * @returns {Promise} 上传结果
   */
  uploadFile: (formData) => {
    return form('/api/common/upload/file', formData)
  },

  /**
   * 上传头像
   * @param {FormData} formData 包含头像文件的FormData对象
   * @returns {Promise} 上传结果
   */
  uploadAvatar: (formData) => {
    return form('/api/common/upload/avatar', formData)
  },

  /**
   * 删除文件
   * @param {string} fileUrl 文件URL
   * @returns {Promise} 删除结果
   */
  deleteFile: (fileUrl) => {
    return form('/api/common/upload/delete', { fileUrl })
  }
}

// 命名导出 - 为了兼容不同的导入方式
export const uploadImage = (formData) => {
  return form('/api/common/upload/image', formData)
}

export const uploadFile = (formData) => {
  return form('/api/common/upload/file', formData)
}

export const uploadAvatar = (formData) => {
  return form('/api/common/upload/avatar', formData)
}

export const deleteFile = (fileUrl) => {
  return form('/api/common/upload/delete', { fileUrl })
}
