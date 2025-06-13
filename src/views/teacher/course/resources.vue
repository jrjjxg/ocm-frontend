<template>
    <div class="app-container">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>教学资源管理 (课程: {{ courseName }})</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">上传新资源</el-button>
            </div>
            <!-- 资源分类展示 -->
            <el-tabs v-model="activeTabName" type="card">
                <el-tab-pane label="全部资源" name="all">
                    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row
                        style="width: 100%;">
                        <el-table-column label="ID" prop="id" align="center" width="80" />
                        <el-table-column label="资源标题" prop="title" min-width="150px" />
                        <el-table-column label="描述" prop="description" min-width="150px" />
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
                        <el-table-column label="上传者" prop="uploaderId" align="center" width="100px" />
                        <el-table-column label="上传时间" prop="createTime" align="center" width="160px">
                            <template slot-scope="{row}">
                                <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
                            <template slot-scope="{row}">
                                <el-button type="info" size="mini" @click="handlePreview(row)"
                                    :disabled="!canPreview(row.type)">
                                    预览
                                </el-button>
                                <el-button type="primary" size="mini" @click="handleDownload(row)">
                                    下载
                                </el-button>
                                <el-button type="warning" size="mini" @click="handleUpdate(row)">
                                    编辑
                                </el-button>
                                <el-button type="danger" size="mini" @click="handleDelete(row)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <el-tab-pane label="文档资源" name="document">
                    <div v-if="documentResources.length === 0" class="empty-resources">
                        <el-empty description="暂无文档资源"></el-empty>
                    </div>
                    <el-table v-else :data="documentResources" border fit highlight-current-row style="width: 100%;">
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
                        <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
                            <template slot-scope="{row}">
                                <el-button type="info" size="mini" @click="handlePreview(row)"
                                    :disabled="!canPreview(row.type)">
                                    预览
                                </el-button>
                                <el-button type="primary" size="mini" @click="handleDownload(row)">
                                    下载
                                </el-button>
                                <el-button type="warning" size="mini" @click="handleUpdate(row)">
                                    编辑
                                </el-button>
                                <el-button type="danger" size="mini" @click="handleDelete(row)">
                                    删除
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
                            <div class="resource-preview" @click="canPreview(item.type) && handlePreview(item)">
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
                                <el-button type="info" size="mini" @click="handlePreview(item)"
                                    :disabled="!canPreview(item.type)">预览</el-button>
                                <el-button type="primary" size="mini" @click="handleDownload(item)">下载</el-button>
                                <el-button type="warning" size="mini" @click="handleUpdate(item)">编辑</el-button>
                                <el-button type="danger" size="mini" @click="handleDelete(item)">删除</el-button>
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
                        <el-table-column label="在线播放" align="center" width="360px"
                            class-name="small-padding fixed-width">
                            <template slot-scope="{row}">
                                <audio :src="getResourceFullUrl(row.url)" controls
                                    style="width: 100%; max-width: 300px;"></audio>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
                            <template slot-scope="{row}">
                                <el-button type="info" size="mini" @click="handlePreview(row)"
                                    :disabled="!canPreview(row.type)">
                                    预览
                                </el-button>
                                <el-button type="primary" size="mini" @click="handleDownload(row)">
                                    下载
                                </el-button>
                                <el-button type="warning" size="mini" @click="handleUpdate(row)">
                                    编辑
                                </el-button>
                                <el-button type="danger" size="mini" @click="handleDelete(row)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="60%">
            <el-form ref="dataForm" :rules="rules" :model="tempResource" label-position="left" label-width="100px"
                style="width: 80%; margin-left:50px;">
                <el-form-item label="资源标题" prop="title">
                    <el-input v-model="tempResource.title" />
                </el-form-item>
                <el-form-item label="资源描述" prop="description">
                    <el-input v-model="tempResource.description" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item label="资源类型" prop="type">
                    <el-select v-model="tempResource.type" placeholder="请选择类型" style="width: 100%;">
                        <el-option v-for="(typeInfo, typeKey) in resourceTypeMap" :key="typeKey" :label="typeInfo.name"
                            :value="parseInt(typeKey)" />
                    </el-select>
                    <div class="el-form-item-tip">
                        <small>上传文件时会自动识别类型，如识别不准确可手动选择</small>
                    </div>
                </el-form-item>
                <el-form-item v-if="dialogStatus === 'create'" label="选择文件" prop="file">
                    <el-upload ref="upload" :action="uploadUrl" :data="uploadDataForSubmit"
                        :on-success="handleUploadSuccess" :on-error="handleUploadError" :before-upload="beforeUpload"
                        :auto-upload="false" :limit="1" name="file" :on-change="handleFileChange">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传单个文件。</div>
                    </el-upload>
                </el-form-item>
                <el-form-item v-if="dialogStatus === 'update' && tempResource.url" label="当前文件">
                    <a :href="getResourceFullUrl(tempResource.url)" target="_blank">{{ tempResource.url.split('/').pop()
                        }}</a>
                    (编辑状态暂不支持直接替换文件)
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">
                    取消
                </el-button>
                <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
                    确认
                </el-button>
            </div>
        </el-dialog>

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
                <div v-else-if="previewType === 'office'">
                    <div class="office-preview-container">
                        <p class="preview-message">使用Office Online预览服务</p>
                        <iframe
                            :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(previewUrl)"
                            width="100%" height="600px" frameborder="0">
                        </iframe>
                        <p class="preview-note">如果无法预览，请尝试直接下载文件。</p>
                    </div>
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
import { getTeacherCourses } from '@/api/course'
import { mapGetters } from 'vuex'
import previewService from '@/utils/preview'
import teacherResourceApi from '@/api/teacherResource'

export default {
    name: 'ResourceManagement',
    props: {
        courseId: {
            type: [Number, String],
            required: true
        }
    },
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
            list: [],
            total: 0,
            listLoading: true,
            courseName: '', // 从路由或API获取
            localCourseId: null, // 新增：本地保存courseId，避免直接修改prop
            tempResource: {
                id: undefined,
                title: '',
                description: '',
                type: null,
                courseId: null,
                file: null,
                url: ''
            },
            dialogFormVisible: false,
            dialogStatus: '',
            dialogTitleMap: {
                create: '上传新资源',
                update: '编辑资源'
            },
            rules: {
                title: [{ required: true, message: '资源标题不能为空', trigger: 'blur' }],
                type: [{ required: true, message: '资源类型不能为空', trigger: 'change' }],
                file: [{ validator: this.validateFile, trigger: 'change' }]
            },
            uploadUrl: '', // 初始为空，在 created 钩子中设置

            // 分类和分页
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
            resourceTypeMap: previewService.resourceTypeMap,

            loading: false,
            resources: [],
            searchForm: {
                keyword: '',
                type: ''
            },
            uploadDialogVisible: false,
            formTitle: '添加资源',
            resourceForm: {
                id: null,
                title: '',
                description: '',
                type: '',
                url: '',
                courseId: null
            },
            typeOptions: [
                { value: 1, label: '文档' },
                { value: 2, label: 'PPT' },
                { value: 3, label: '视频' },
                { value: 4, label: '音频' }
            ],
            fileList: [],
            uploadHeaders: {}
        }
    },
    computed: {
        ...mapGetters([
            'user' // 'user_info' store中的真实命名
        ]),
        dialogTitle() {
            return this.dialogTitleMap[this.dialogStatus] || ''
        },
        uploadDataForSubmit() {
            return {
                title: this.tempResource.title,
                description: this.tempResource.description,
                type: this.tempResource.type,
                courseId: this.courseId, // 使用从prop获取的courseId
                // uploaderId 将由后端根据token获取
            };
        },
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
        },
        // 新增计算属性：确保courseId有效
        validCourseId() {
            return this.localCourseId || this.courseId;
        }
    },
    created() {
        // this.getCourseOptions() // 不再需要获取所有课程选项
        const id = this.$route.params.id;
        const name = this.$route.query.name; // 假设课程名称通过查询参数传递
        if (id) {
            this.localCourseId = parseInt(id); // 使用本地变量，不直接修改prop
            this.courseName = name || `ID: ${id}`; // 如果没有名称，显示ID
            this.getList(); // 只保留一个获取资源的方法，使用已经正常工作的getList
            // 设置上传 URL
            this.uploadUrl = `/api/teacher/courses/${this.validCourseId}/resources/upload`;
            // 设置上传文件请求头，包含认证信息
            this.uploadHeaders = {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        } else {
            // 如果路由参数中没有id，尝试从props中获取
            if (this.courseId) {
                this.localCourseId = parseInt(this.courseId);
                this.courseName = `课程 ${this.courseId}`;
                this.getList();
                this.uploadUrl = `/api/teacher/courses/${this.validCourseId}/resources/upload`;
                this.uploadHeaders = {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            } else {
                this.$message.error('未找到课程ID，无法加载资源列表。');
                this.listLoading = false;
            }
        }
    },
    methods: {
        validateFile(rule, value, callback) {
            if (this.dialogStatus === 'create' && !this.tempResource.file) {
                callback(new Error('必须选择一个文件上传'));
            } else if (this.dialogStatus === 'create' && this.tempResource.file) {
                // 根据文件扩展名自动设置类型 (如果用户未选择)
                const fileName = this.tempResource.file.name;
                const autoDetectedType = previewService.detectResourceTypeByFileName(fileName);

                if (autoDetectedType && (this.tempResource.type === null || this.tempResource.type === undefined)) {
                    this.tempResource.type = autoDetectedType;
                    console.log('自动检测到文件类型:', this.resourceTypeMap[autoDetectedType].name);
                    this.$message.info(`已自动检测到文件类型: ${this.resourceTypeMap[autoDetectedType].name}`);
                }
                // 确保类型已选择
                if (this.tempResource.type === null || this.tempResource.type === undefined) {
                    callback(new Error('未能识别文件类型，请手动选择资源类型'));
                    return;
                }

                // 检查文件类型和选择的资源类型是否匹配 (可选增强)
                const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
                const selectedTypeInfo = this.resourceTypeMap[this.tempResource.type];
                if (selectedTypeInfo && selectedTypeInfo.extensions.length > 0 && !selectedTypeInfo.extensions.includes(fileExt) && selectedTypeInfo.preview !== null) {
                    // 如果是"其他文档"类型，则不校验后缀名
                    if (this.tempResource.type !== 7) {
                        callback(new Error(`选择的文件类型 (${fileExt}) 与所选资源类型 (${selectedTypeInfo.name}) 不匹配。`));
                        return;
                    }
                }
                callback();
            }
            else {
                callback();
            }
        },
        handleFileChange(file, fileList) {
            if (fileList.length > 0) {
                this.tempResource.file = file.raw; // 存储原始文件对象以供校验

                // 自动检测文件类型并设置
                const fileName = file.name;
                const autoDetectedType = previewService.detectResourceTypeByFileName(fileName);
                if (autoDetectedType) {
                    this.tempResource.type = autoDetectedType;
                    this.$message.info(`已自动识别文件类型: ${this.resourceTypeMap[autoDetectedType].name}`);
                } else {
                    this.$message.warning('未能自动识别文件类型，请手动选择');
                    this.tempResource.type = null;
                }
            } else {
                this.tempResource.file = null;
                this.tempResource.type = null;
            }
            // 手动触发对 file 字段的校验
            this.$refs.dataForm.validateField('file');
        },
        async getList() {
            if (!this.courseId) {
                this.list = []
                this.total = 0
                this.listLoading = false
                this.$message.warning('课程ID无效，无法加载资源。');
                return
            }
            this.listLoading = true
            try {
                // 使用 RESTful API 获取资源列表
                const result = await teacherResourceApi.getResources(this.validCourseId)
                if (result.code === 1) {
                    this.list = result.response || [] // 后端直接返回列表
                    this.total = result.response ? result.response.length : 0 // 如果后端不分页，则如此计算

                    // 添加调试信息
                    console.log('资源列表:', this.list)
                    if (this.list.length > 0) {
                        console.log('第一个资源URL:', this.list[0].url)
                        console.log('完整URL:', this.getResourceFullUrl(this.list[0].url))
                    }
                } else {
                    this.list = []
                    this.total = 0
                    this.$message.error(result.message || '获取列表失败')
                }
            } catch (error) {
                console.error('Error fetching resource list:', error)
                this.list = []
                this.total = 0
                this.$message.error('获取列表失败，请检查网络或联系管理员')
            }
            this.listLoading = false
        },
        resetTemp() {
            this.tempResource = {
                id: undefined,
                title: '',
                description: '',
                type: null,
                courseId: this.validCourseId, // 使用计算属性
                file: null,
                url: ''
            }
            if (this.$refs.upload) {
                this.$refs.upload.clearFiles()
            }
        },
        handleCreate() {
            this.resetTemp()
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        createData() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    if (!this.tempResource.file) {
                        this.$message.error('请选择要上传的文件！');
                        return false;
                    }
                    this.$refs.upload.submit();
                } else {
                    console.log('error submit!!');
                    return false;
                }
            })
        },
        handleUploadSuccess(response, file, fileList) {
            if (response.code === 1) {
                // 确保先关闭对话框，再刷新数据
                this.dialogFormVisible = false
                // 重新获取资源列表
                this.getList()
                this.$notify({
                    title: '成功',
                    message: '资源上传成功',
                    type: 'success',
                    duration: 2000
                })
            } else {
                this.$message.error(`上传失败: ${response.message || '未知错误'}`);
            }
            if (this.$refs.upload) this.$refs.upload.clearFiles();
            this.tempResource.file = null; // 重置文件
        },
        handleUploadError(err, file, fileList) {
            console.error("Upload error response:", err)
            let errMsg = '上传失败，请稍后重试';
            try {
                const parsedError = JSON.parse(err.message); // err.message is responseText
                if (parsedError && parsedError.message) {
                    errMsg = parsedError.message;
                } else if (parsedError && parsedError.error) {
                    errMsg = parsedError.error;
                }
            } catch (e) {
                if (err.message && typeof err.message === 'string' && err.message.includes('Network Error')) {
                    errMsg = '网络错误，无法连接到服务器';
                } else if (err.message && typeof err.message === 'string') {
                    errMsg = err.message; // Fallback to raw message if not JSON or specific network error
                } else if (err.statusText) {
                    errMsg = err.statusText;
                }
            }
            this.$message.error(errMsg);
            if (this.$refs.upload) this.$refs.upload.clearFiles();
            this.tempResource.file = null; // 重置文件
        },
        beforeUpload(file) {
            //  可以在这里添加文件大小、类型等校验
            // const isLt200M = file.size / 1024 / 1024 < 200;
            // if (!isLt200M) {
            //   this.$message.error('上传文件大小不能超过 200MB!');
            // }
            // return isLt200M;
            return true
        },
        handleUpdate(row) {
            this.tempResource = Object.assign({}, row)
            this.tempResource.courseId = this.validCourseId; // 使用计算属性
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        async updateData() {
            this.$refs['dataForm'].validate(async (valid) => {
                if (valid) {
                    try {
                        const tempData = { ...this.tempResource }
                        delete tempData.file // 编辑时不上传文件
                        delete tempData.url // url是后端生成的
                        delete tempData.createTime // 一般不更新创建时间
                        delete tempData.uploaderId // 上传者不应随意更改

                        // 使用 RESTful API 更新资源
                        const result = await teacherResourceApi.updateResource(this.validCourseId, tempData.id, tempData)
                        if (result.code === 1) {
                            this.getList();
                            this.dialogFormVisible = false
                            this.$notify({
                                title: '成功',
                                message: '更新成功',
                                type: 'success',
                                duration: 2000
                            })
                        } else {
                            this.$message.error(result.message || '更新失败')
                        }
                    } catch (error) {
                        console.error('Error updating resource:', error)
                        this.$message.error('更新失败，请检查网络或联系管理员')
                    }
                }
            })
        },
        // 删除资源方法（RESTful 风格）
        async handleDelete(row) {
            this.$confirm(`确认删除资源 "${row.title}"?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 使用 RESTful API 删除资源
                teacherResourceApi.deleteResourceRestful(this.validCourseId, row.id).then(res => {
                    if (res.code === 1) {
                        this.$message.success('删除成功')
                        this.getList() // 重新加载资源列表
                    } else {
                        this.$message.error(res.message || '删除失败')
                    }
                }).catch(error => {
                    console.error(error)
                    this.$message.error('删除失败')
                })
            }).catch(() => {
                // 用户取消删除操作
            })
        },
        getResourceFullUrl(url) {
            return previewService.getResourceFullUrl(url);
        },
        handleDownload(row) {
            console.log('下载资源:', row);
            const fullUrl = this.getResourceFullUrl(row.url);
            console.log('下载URL:', fullUrl);

            if (fullUrl && fullUrl !== '#') {
                // 直接使用window.open下载文件，不通过fetch预检查
                console.log('正在打开:', fullUrl);
                window.open(fullUrl, '_blank');
            } else {
                this.$message.error('文件URL无效或不存在');
            }
        },
        formatResourceType(typeId) {
            return previewService.getResourceTypeName(typeId);
        },
        formatFileSize(bytes) {
            return previewService.formatFileSize(bytes);
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
        fetchResources() {
            this.loading = true
            // 使用 RESTful API 获取资源列表
            teacherResourceApi.getResources(this.validCourseId, this.searchForm).then(res => {
                if (res.code === 1) {
                    this.resources = res.response
                } else {
                    this.$message.error(res.message || '获取资源列表失败')
                }
                this.loading = false
            }).catch(error => {
                console.error(error)
                this.$message.error('获取资源列表失败')
                this.loading = false
            })
        },
        getResourceType(type) {
            const option = this.typeOptions.find(o => o.value === type)
            return option ? option.label : '未知'
        },
        handleSearch() {
            this.fetchResources()
        },
        resetSearch() {
            this.searchForm = {
                keyword: '',
                type: ''
            }
            this.fetchResources()
        },
        handleAdd() {
            this.formTitle = '添加资源'
            this.resourceForm = {
                id: null,
                title: '',
                description: '',
                type: '',
                url: '',
                courseId: this.validCourseId // 使用计算属性
            }
            this.dialogVisible = true
        },
        handleEdit(row) {
            this.formTitle = '编辑资源'
            this.resourceForm = Object.assign({}, row)
            this.dialogVisible = true
        },
        submitForm() {
            this.$refs.resourceForm.validate(valid => {
                if (valid) {
                    const method = this.resourceForm.id ? teacherResourceApi.updateResource : teacherResourceApi.addResource
                    method(this.resourceForm).then(res => {
                        if (res.code === 1) {
                            this.$message.success(this.resourceForm.id ? '更新成功' : '添加成功')
                            this.dialogVisible = false
                            this.fetchResources()
                        } else {
                            this.$message.error(res.message || (this.resourceForm.id ? '更新失败' : '添加失败'))
                        }
                    }).catch(error => {
                        console.error(error)
                        this.$message.error(this.resourceForm.id ? '更新失败' : '添加失败')
                    })
                }
            })
        },
        handleUpload() {
            this.fileList = []
            this.uploadDialogVisible = true
        },
        handleUploadSuccess(response, file, fileList) {
            if (response.code === 1) {
                this.$message.success('上传成功')
                // 关闭上传对话框
                this.uploadDialogVisible = false
                // 刷新资源列表
                this.fetchResources()
            } else {
                this.$message.error(response.message || '上传失败')
            }
        },
        handleUploadError(err) {
            this.$message.error('上传失败：' + err)
        },
        downloadResource(resource) {
            window.open(resource.url, '_blank')
        },
        previewResource(resource) {
            if (resource.type === 3) { // 视频
                this.$router.push({
                    path: '/teacher/resource/preview',
                    query: { id: resource.id, type: 'video' }
                })
            } else {
                window.open(resource.url, '_blank')
            }
        },
        canPreview(type) {
            // 只有部分类型的资源可以预览
            return [1, 2, 3].includes(type)
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
