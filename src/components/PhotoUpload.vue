<template>
    <div class="photo-upload">
        <div class="upload-area" @click="openFileDialog">
            <i class="el-icon-camera-solid"></i>
            <p>点击拍照或上传图片</p>
            <p class="upload-tip">支持 JPG、PNG 格式，最多上传 {{ maxCount }} 张</p>
        </div>

        <div class="image-list" v-if="imageList.length > 0">
            <div v-for="(image, index) in imageList" :key="index" class="image-item">
                <div class="image-wrapper">
                    <img :src="image.url" @click="previewImage(image.url)" />
                    <div class="image-overlay">
                        <i class="el-icon-zoom-in" @click="previewImage(image.url)"></i>
                        <i class="el-icon-refresh-left" @click="rotateImage(index, -90)"></i>
                        <i class="el-icon-refresh-right" @click="rotateImage(index, 90)"></i>
                        <i class="el-icon-delete" @click="removeImage(index)"></i>
                    </div>
                </div>
                <div class="image-info">
                    <span class="image-name">{{ image.name }}</span>
                    <span class="image-size">{{ formatFileSize(image.size) }}</span>
                </div>
            </div>
        </div>

        <input ref="fileInput" type="file" accept="image/*" multiple capture="camera" style="display: none"
            @change="handleFileSelect" />

        <!-- 图片预览对话框 -->
        <el-dialog :visible.sync="previewVisible" title="图片预览" width="60%" center>
            <div class="preview-container">
                <img :src="previewUrl" class="preview-image" />
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { uploadImage } from '@/api/common/upload'

export default {
    name: 'PhotoUpload',
    props: {
        questionId: {
            type: Number,
            required: true
        },
        maxCount: {
            type: Number,
            default: 5
        },
        value: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            imageList: [],
            previewVisible: false,
            previewUrl: '',
            uploading: false
        }
    },
    watch: {
        value: {
            handler(newVal) {
                if (newVal && newVal.length > 0) {
                    this.imageList = [...newVal]
                }
            },
            immediate: true
        }
    },
    methods: {
        openFileDialog() {
            if (this.imageList.length >= this.maxCount) {
                this.$message.warning(`最多只能上传 ${this.maxCount} 张图片`)
                return
            }
            this.$refs.fileInput.click()
        },

        async handleFileSelect(event) {
            const files = Array.from(event.target.files)

            if (this.imageList.length + files.length > this.maxCount) {
                this.$message.warning(`最多只能上传 ${this.maxCount} 张图片`)
                return
            }

            for (let file of files) {
                if (!this.isValidImage(file)) {
                    continue
                }

                try {
                    // 压缩图片
                    const compressedFile = await this.compressImage(file)

                    // 上传图片
                    const formData = new FormData()
                    formData.append('file', compressedFile)
                    formData.append('questionId', this.questionId)

                    this.uploading = true
                    const response = await uploadImage(formData)

                    this.imageList.push({
                        name: file.name,
                        size: file.size,
                        url: response.data.url,
                        rotation: 0
                    })

                    this.emitChange()
                } catch (error) {
                    this.$message.error(`图片 ${file.name} 上传失败`)
                } finally {
                    this.uploading = false
                }
            }

            // 清空文件输入框
            event.target.value = ''
        },

        isValidImage(file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
            const maxSize = 10 * 1024 * 1024 // 10MB

            if (!validTypes.includes(file.type)) {
                this.$message.error('只支持 JPG、PNG 格式的图片')
                return false
            }

            if (file.size > maxSize) {
                this.$message.error('图片大小不能超过 10MB')
                return false
            }

            return true
        },

        async compressImage(file) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                const img = new Image()

                img.onload = () => {
                    // 计算压缩后的尺寸
                    const maxWidth = 1200
                    const maxHeight = 1200
                    let { width, height } = img

                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width
                            width = maxWidth
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height
                            height = maxHeight
                        }
                    }

                    canvas.width = width
                    canvas.height = height

                    // 绘制压缩后的图片
                    ctx.drawImage(img, 0, 0, width, height)

                    canvas.toBlob(resolve, 'image/jpeg', 0.8)
                }

                img.src = URL.createObjectURL(file)
            })
        },

        rotateImage(index, angle) {
            this.imageList[index].rotation = (this.imageList[index].rotation + angle) % 360
            this.emitChange()
        },

        removeImage(index) {
            this.imageList.splice(index, 1)
            this.emitChange()
        },

        previewImage(url) {
            this.previewUrl = url
            this.previewVisible = true
        },

        formatFileSize(bytes) {
            if (bytes === 0) return '0 B'
            const k = 1024
            const sizes = ['B', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        },

        emitChange() {
            this.$emit('change', this.imageList.map(img => img.url))
            this.$emit('input', this.imageList.map(img => img.url))
        }
    }
}
</script>

<style scoped>
.photo-upload {
    width: 100%;
}

.upload-area {
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    text-align: center;
    padding: 40px 20px;
    transition: border-color 0.3s;
}

.upload-area:hover {
    border-color: #409eff;
}

.upload-area i {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 16px;
}

.upload-area p {
    margin: 8px 0;
    color: #606266;
}

.upload-tip {
    font-size: 12px;
    color: #999;
}

.image-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    margin-top: 16px;
}

.image-item {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    overflow: hidden;
    background: #fff;
}

.image-wrapper {
    position: relative;
    width: 100%;
    height: 120px;
    overflow: hidden;
}

.image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-wrapper:hover .image-overlay {
    opacity: 1;
}

.image-overlay i {
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 2px;
    transition: background-color 0.3s;
}

.image-overlay i:hover {
    background: rgba(255, 255, 255, 0.2);
}

.image-info {
    padding: 8px;
    font-size: 12px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.image-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;
}

.preview-container {
    text-align: center;
}

.preview-image {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
}
</style>