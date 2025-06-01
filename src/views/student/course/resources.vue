<template>
    <div class="app-container">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>课程资源</span>
            </div>

            <!-- 加载状态 -->
            <div v-if="listLoading" v-loading="true" element-loading-text="资源加载中..." style="min-height: 300px;"></div>
            <div v-else>
                <!-- 资源分类展示 -->
                <el-tabs v-model="activeTabName" type="card">
                    <el-tab-pane label="全部资源" name="all">
                        <div v-if="list.length === 0" class="empty-resources">
                            <el-empty description="暂无课程资源"></el-empty>
                        </div>
                        <el-table v-else :data="list" border fit highlight-current-row style="width: 100%;">
                            <el-table-column label="资源标题" prop="title" min-width="150px" />
                            <el-table-column label="描述" prop="description" min-width="200px" />
                            <el-table-column label="类型" prop="type" align="center" width="100px">
                                <template slot-scope="{row}">
                                    <span>{{ formatResourceType(row.type) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="文件大小" prop="fileSize" align="center" width="120px">
                                <template slot-scope="{row}">
                                    <span>{{ formatFileSize(row.fileSize) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="上传时间" prop="createTime" align="center" width="160px">
                                <template slot-scope="{row}">
                                    <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" align="center" width="180px"
                                class-name="small-padding fixed-width">
                                <template slot-scope="{row}">
                                    <el-button v-if="canPreview(row.type)" type="info" size="mini"
                                        @click="handlePreview(row)">
                                        预览
                                    </el-button>
                                    <el-button type="primary" size="mini" @click="handleDownload(row)">
                                        下载
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>

                    <el-tab-pane label="文档资源" name="document">
                        <div v-if="documentResources.length === 0" class="empty-resources">
                            <el-empty description="暂无文档资源"></el-empty>
                        </div>
                        <el-table v-else :data="documentResources" border fit highlight-current-row
                            style="width: 100%;">
                            <el-table-column label="资源标题" prop="title" min-width="200px" />
                            <el-table-column label="描述" prop="description" min-width="250px" />
                            <el-table-column label="文件大小" prop="fileSize" align="center" width="120px">
                                <template slot-scope="{row}">
                                    <span>{{ formatFileSize(row.fileSize) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="上传时间" prop="createTime" align="center" width="160px">
                                <template slot-scope="{row}">
                                    <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" align="center" width="180px"
                                class-name="small-padding fixed-width">
                                <template slot-scope="{row}">
                                    <el-button v-if="canPreview(row.type)" type="info" size="mini"
                                        @click="handlePreview(row)">
                                        预览
                                    </el-button>
                                    <el-button type="primary" size="mini" @click="handleDownload(row)">
                                        下载
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>

                    <el-tab-pane label="视频资源" name="video">
                        <div v-if="videoResources.length === 0" class="empty-resources">
                            <el-empty description="暂无视频资源"></el-empty>
                        </div>
                        <div v-else class="resource-grid">
                            <div v-for="item in videoResources" :key="item.id" class="resource-card">
                                <div class="resource-preview" @click="handlePreview(item)">
                                    <div class="preview-placeholder">
                                        <i class="el-icon-video-camera-solid"></i>
                                    </div>
                                    <div class="resource-title">{{ item.title }}</div>
                                </div>
                                <div class="resource-info">
                                    <div class="resource-description">{{ item.description }}</div>
                                    <div class="resource-size">{{ formatFileSize(item.fileSize) }}</div>
                                </div>
                                <div class="resource-actions">
                                    <el-button type="info" size="mini" @click="handlePreview(item)">预览</el-button>
                                    <el-button type="primary" size="mini" @click="handleDownload(item)">下载</el-button>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="音频资源" name="audio">
                        <div v-if="audioResources.length === 0" class="empty-resources">
                            <el-empty description="暂无音频资源"></el-empty>
                        </div>
                        <el-table v-else :data="audioResources" border fit highlight-current-row style="width: 100%;">
                            <el-table-column label="资源标题" prop="title" min-width="200px" />
                            <el-table-column label="描述" prop="description" min-width="250px" />
                            <el-table-column label="操作" align="center" width="360px"
                                class-name="small-padding fixed-width">
                                <template slot-scope="{row}">
                                    <audio :src="getResourceFullUrl(row.url)" controls
                                        style="width: 100%; max-width: 300px;"></audio>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" align="center" width="180px"
                                class-name="small-padding fixed-width">
                                <template slot-scope="{row}">
                                    <el-button type="primary" size="mini" @click="handleDownload(row)">
                                        下载
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-card>

        <!-- 预览对话框 -->
        <el-dialog :title="previewDialogTitle" :visible.sync="previewDialogVisible" width="70%"
            @closed="clearPreviewContent">
            <div v-if="previewLoading" v-loading="true" element-loading-text="内容加载中..." style="min-height: 300px;">
            </div>
            <div v-else :key="previewContentKey"> <!-- 使用key来强制重新渲染 -->
                <div v-if="previewType === 'pdf'">
                    <iframe :src="previewUrl" width="100%" height="600px" frameborder="0"></iframe>
                </div>
                <div v-else-if="previewType === 'image'">
                    <img :src="previewUrl" style="max-width: 100%; max-height: 70vh; display: block; margin: auto;" />
                </div>
                <div v-else-if="previewType === 'video'">
                    <video :src="previewUrl" controls width="100%" style="max-height: 70vh;"></video>
                </div>
                <div v-else-if="previewType === 'audio'">
                    <audio :src="previewUrl" controls style="width: 100%;"></audio>
                </div>
                <div v-else-if="previewType === 'text'">
                    <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 70vh; overflow-y: auto;">{{
                        previewTextContent }}</pre>
                </div>
                <div v-else>
                    <p>此文件类型不支持预览。</p>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="previewDialogVisible = false">关闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import studentResourceApi from '@/api/studentResource'
import previewService from '@/utils/preview'

export default {
    name: 'StudentCourseResources',
    filters: {
        parseTime: function (time, cFormat) {
            if (arguments.length === 0 || !time) {
                return null
            }
            const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
            let date
            if (typeof time === 'object') {
                date = time
            } else {
                if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
                    time = parseInt(time)
                }
                if ((typeof time === 'number' && (time.toString().length === 10))) {
                    time = time * 1000
                }
                date = new Date(time)
            }
            const formatObj = {
                y: date.getFullYear(),
                m: date.getMonth() + 1,
                d: date.getDate(),
                h: date.getHours(),
                i: date.getMinutes(),
                s: date.getSeconds(),
                a: date.getDay()
            }
            const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
                let value = formatObj[key]
                if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
                if (result.length > 0 && value < 10) {
                    value = '0' + value
                }
                return value || 0
            })
            return time_str
        }
    },
    data() {
        return {
            courseId: null,
            list: [],
            listLoading: false,
            activeTabName: 'all',

            // 预览相关
            previewDialogVisible: false,
            previewDialogTitle: '',
            previewUrl: '',
            previewType: '', // 'pdf', 'image', 'video', 'audio', 'text'
            previewTextContent: '',
            previewLoading: false,
            previewContentKey: 0, // 用于强制刷新iframe/audio/video等

            // 使用全局资源类型映射
            resourceTypeMap: previewService.resourceTypeMap
        }
    },
    computed: {
        // 按分类过滤资源
        documentResources() {
            return this.list.filter(item => {
                const typeInfo = this.resourceTypeMap[item.type];
                return typeInfo && typeInfo.category === 'document';
            });
        },
        videoResources() {
            return this.list.filter(item => {
                const typeInfo = this.resourceTypeMap[item.type];
                return typeInfo && typeInfo.category === 'video';
            });
        },
        audioResources() {
            return this.list.filter(item => {
                const typeInfo = this.resourceTypeMap[item.type];
                return typeInfo && typeInfo.category === 'audio';
            });
        }
    },
    created() {
        this.courseId = this.$route.params.id
        this.getResourceList()
    },
    methods: {
        async getResourceList() {
            this.listLoading = true
            try {
                const result = await studentResourceApi.getResourcesByCourse(this.courseId)
                if (result.code === 1) {
                    this.list = result.response || []
                } else {
                    this.$message.error(result.message || '获取资源列表失败')
                }
            } catch (error) {
                console.error('Error fetching resource list:', error)
                this.$message.error('获取资源列表失败，请检查网络或联系管理员')
            }
            this.listLoading = false
        },
        formatResourceType(typeId) {
            return previewService.getResourceTypeName(typeId);
        },
        formatFileSize(bytes) {
            return previewService.formatFileSize(bytes);
        },
        getResourceFullUrl(url) {
            return previewService.getResourceFullUrl(url);
        },
        canPreview(typeId) {
            return previewService.canPreview(typeId);
        },
        clearPreviewContent() {
            this.previewUrl = '';
            this.previewTextContent = '';
            this.previewType = '';
            this.previewLoading = false;
        },
        async handlePreview(row) {
            if (!this.canPreview(row.type)) {
                this.$message.info('此文件类型不支持预览');
                return;
            }
            this.previewDialogVisible = true;
            this.previewDialogTitle = `预览: ${row.title}`;
            this.previewLoading = true;
            this.previewContentKey++; // 强制刷新组件

            const fullUrl = this.getResourceFullUrl(row.url);
            this.previewUrl = fullUrl;
            this.previewType = this.resourceTypeMap[row.type].preview;

            if (this.previewType === 'text') {
                try {
                    const response = await fetch(fullUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    this.previewTextContent = await response.text();
                } catch (error) {
                    console.error('获取文本内容失败:', error);
                    this.$message.error('加载预览内容失败');
                    this.previewTextContent = '加载内容失败。';
                }
            }
            this.previewLoading = false;
        },
        handleDownload(row) {
            const fullUrl = this.getResourceFullUrl(row.url);
            if (fullUrl && fullUrl !== '#') {
                // 直接使用window.open下载文件，不通过fetch预检查
                window.open(fullUrl, '_blank');
            } else {
                this.$message.error('文件URL无效或不存在');
            }
        }
    }
}
</script>

<style scoped>
.filter-container {
    padding-bottom: 10px;
}

.empty-resources {
    padding: 40px 0;
    text-align: center;
}

/* 资源卡片布局 */
.resource-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 10px 0;
}

.resource-card {
    width: 280px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.resource-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.resource-preview {
    height: 160px;
    position: relative;
    cursor: pointer;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.preview-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
}

.preview-placeholder i {
    font-size: 48px;
    color: #909399;
}

.resource-title {
    padding: 8px;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.resource-info {
    padding: 10px;
}

.resource-description {
    color: #606266;
    font-size: 13px;
    line-height: 1.5;
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.resource-size {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
}

.resource-actions {
    padding: 5px 10px 15px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}

.resource-actions .el-button {
    margin: 5px 2px;
}

.office-preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.preview-message {
    margin-bottom: 10px;
    color: #606266;
    font-size: 14px;
}

.preview-note {
    margin-top: 10px;
    color: #909399;
    font-size: 12px;
}
</style>