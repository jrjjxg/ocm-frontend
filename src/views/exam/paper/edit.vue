<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">
      <el-form-item label="年级：" prop="level" required>
        <el-select v-model="form.level" placeholder="年级" @change="levelChange">
          <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科：" prop="subjectId" required>
        <el-select v-model="form.subjectId" placeholder="学科">
          <el-option v-for="item in subjectFilter" :key="item.id" :value="item.id"
            :label="item.name + ' ( ' + item.levelName + ' )'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="试卷类型：" prop="paperType" required>
        <el-select v-model="form.paperType" placeholder="试卷类型" @change="paperTypeChange">
          <el-option v-for="item in paperTypeEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>

      <!-- 考试时间设置 -->
      <div v-if="form.paperType === 4" class="exam-time-setting">
        <el-form-item label="考试时间模式：" prop="timeMode" required>
          <el-radio-group v-model="form.timeMode" @change="timeModeChange">
            <el-radio :label="1">
              <span class="time-mode-option">
                <i class="el-icon-timer"></i>
                <strong>限时考试</strong>
                <span class="mode-desc">固定时间段内进行考试</span>
              </span>
            </el-radio>
            <el-radio :label="2">
              <span class="time-mode-option">
                <i class="el-icon-date"></i>
                <strong>灵活考试</strong>
                <span class="mode-desc">学生在指定期间内自主安排考试时间</span>
              </span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 限时考试模式 -->
        <div v-if="form.timeMode === 1" class="time-setting-card">
          <div class="setting-header">
            <i class="el-icon-timer"></i>
            <span>限时考试设置</span>
            <el-tag type="warning" size="mini">所有学生必须在指定时间段内完成考试</el-tag>
          </div>
          <el-form-item label="考试开始时间：" prop="fixedStartTime" required>
            <el-date-picker v-model="form.fixedStartTime" type="datetime" placeholder="选择考试开始时间"
              value-format="yyyy-MM-dd HH:mm:ss" :picker-options="startTimePickerOptions" style="width: 100%">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="考试结束时间：" prop="fixedEndTime" required>
            <el-date-picker v-model="form.fixedEndTime" type="datetime" placeholder="选择考试结束时间"
              value-format="yyyy-MM-dd HH:mm:ss" :picker-options="endTimePickerOptions" style="width: 100%">
            </el-date-picker>
          </el-form-item>
          <div v-if="form.fixedStartTime && form.fixedEndTime" class="time-summary">
            <el-alert :title="`考试时长：${calculateFixedExamDuration()}分钟`" type="info" :closable="false" show-icon>
            </el-alert>
          </div>
        </div>

        <!-- 灵活考试模式 -->
        <div v-if="form.timeMode === 2" class="time-setting-card">
          <div class="setting-header">
            <i class="el-icon-date"></i>
            <span>灵活考试设置</span>
            <el-tag type="success" size="mini">学生可在指定期间内任选时间开始考试</el-tag>
          </div>
          <el-form-item label="考试开放时间：" prop="flexibleStartDate" required>
            <el-date-picker v-model="form.flexibleStartDate" type="date" placeholder="选择考试开放日期"
              value-format="yyyy-MM-dd" style="width: 100%">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="考试截止时间：" prop="flexibleEndDate" required>
            <el-date-picker v-model="form.flexibleEndDate" type="date" placeholder="选择考试截止日期" value-format="yyyy-MM-dd"
              :picker-options="flexibleEndDateOptions" style="width: 100%">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="每日可考时间：" prop="dailyTimeRange">
            <el-time-picker is-range v-model="form.dailyTimeRange" range-separator="至" start-placeholder="开始时间"
              end-placeholder="结束时间" placeholder="选择每日可考试的时间段" value-format="HH:mm:ss" style="width: 100%">
            </el-time-picker>
            <div class="field-tip">留空则表示全天24小时都可以考试</div>
          </el-form-item>
          <div v-if="form.flexibleStartDate && form.flexibleEndDate" class="time-summary">
            <el-alert :title="`考试期间：${form.flexibleStartDate} 至 ${form.flexibleEndDate}（共${calculateFlexibleDays()}天）`"
              type="info" :closable="false" show-icon>
            </el-alert>
          </div>
        </div>
      </div>

      <el-form-item label="试卷名称：" prop="name" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item :key="index" :label="'标题' + (index + 1) + '：'" required
        v-for="(titleItem, index) in form.titleItems">
        <el-input v-model="titleItem.name" style="width: 80%" />
        <el-button type="text" class="link-left" style="margin-left: 20px" size="mini" @click="addQuestion(titleItem)">
          添加题目
        </el-button>
        <el-button type="text" class="link-left" size="mini" @click="form.titleItems.splice(index, 1)">删除</el-button>
        <el-card class="exampaper-item-box" v-if="titleItem.questionItems.length !== 0">
          <el-form-item :key="questionIndex" :label="'题目' + (questionIndex + 1) + '：'"
            v-for="(questionItem, questionIndex) in titleItem.questionItems" style="margin-bottom: 15px">
            <el-row>
              <el-col :span="23">
                <QuestionShow :qType="questionItem.questionType" :question="questionItem" />
              </el-col>
              <el-col :span="1">
                <el-button type="text" size="mini" @click="titleItem.questionItems.splice(questionIndex, 1)">删除
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-card>
      </el-form-item>
      <el-form-item label="建议时长：" prop="suggestTime" required>
        <el-input v-model="form.suggestTime" placeholder="分钟" />
      </el-form-item>
      <el-form-item label="最大提交次数：" prop="maxAttempts" required>
        <el-input v-model.number="form.maxAttempts" placeholder="最大提交次数（0为不限制）" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="success" @click="addTitle">添加标题</el-button>
      </el-form-item>
    </el-form>
    <el-dialog :visible.sync="questionPage.showDialog" width="70%">
      <el-form :model="questionPage.queryParam" ref="queryForm" :inline="true">
        <el-form-item label="ID：">
          <el-input v-model="questionPage.queryParam.id" clearable></el-input>
        </el-form-item>
        <el-form-item label="题型：">
          <el-select v-model="questionPage.queryParam.questionType" clearable>
            <el-option v-for="item in questionTypeEnum" :key="item.key" :value="item.key"
              :label="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryForm">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="questionPage.listLoading" :data="questionPage.tableData"
        @selection-change="handleSelectionChange" border fit highlight-current-row style="width: 100%">
        <el-table-column type="selection" width="35"></el-table-column>
        <el-table-column prop="id" label="Id" width="60px" />
        <el-table-column prop="questionType" label="题型" :formatter="questionTypeFormatter" width="70px" />
        <el-table-column prop="shortTitle" label="题干" show-overflow-tooltip />
      </el-table>
      <pagination v-show="questionPage.total > 0" :total="questionPage.total"
        :page.sync="questionPage.queryParam.pageIndex" :limit.sync="questionPage.queryParam.pageSize"
        @pagination="search" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="questionPage.showDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmQuestionSelect">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

import { mapGetters, mapState, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import QuestionShow from '../question/components/Show'
import examPaperApi from '@/api/examPaper'
import questionApi from '@/api/question'

export default {
  components: { Pagination, QuestionShow },
  data() {
    return {
      form: {
        id: null,
        level: null,
        subjectId: null,
        paperType: 1,
        timeMode: 1,
        fixedStartTime: null,
        fixedEndTime: null,
        flexibleStartDate: null,
        flexibleEndDate: null,
        dailyTimeRange: [],
        name: '',
        suggestTime: null,
        titleItems: [],
        maxAttempts: 0
      },
      subjectFilter: null,
      formLoading: false,
      rules: {
        level: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        subjectId: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        paperType: [
          { required: true, message: '请选择试卷类型', trigger: 'change' }
        ],
        timeMode: [
          { required: true, message: '请选择考试时间模式', trigger: 'change' }
        ],
        fixedStartTime: [
          { required: true, message: '请选择考试开始时间', trigger: 'change' }
        ],
        fixedEndTime: [
          { required: true, message: '请选择考试结束时间', trigger: 'change' }
        ],
        flexibleStartDate: [
          { required: true, message: '请选择考试开放日期', trigger: 'change' }
        ],
        flexibleEndDate: [
          { required: true, message: '请选择考试截止日期', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入试卷名称', trigger: 'blur' }
        ],
        suggestTime: [
          { required: true, message: '请输入建议时长', trigger: 'blur' }
        ],
        maxAttempts: [
          { required: true, message: '请输入最大提交次数', trigger: 'blur' }
        ]
      },
      questionPage: {
        multipleSelection: [],
        showDialog: false,
        queryParam: {
          id: null,
          questionType: null,
          subjectId: 1,
          pageIndex: 1,
          pageSize: 5
        },
        listLoading: true,
        tableData: [],
        total: 0
      },
      currentTitleItem: null
    }
  },
  computed: {
    // 开始时间选择器选项
    startTimePickerOptions() {
      return {
        disabledDate: (time) => {
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      }
    },
    // 结束时间选择器选项
    endTimePickerOptions() {
      return {
        disabledDate: (time) => {
          if (this.form.fixedStartTime) {
            const startTime = new Date(this.form.fixedStartTime).getTime()
            return time.getTime() < startTime
          }
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      }
    },
    // 灵活考试截止日期选项
    flexibleEndDateOptions() {
      return {
        disabledDate: (time) => {
          if (this.form.flexibleStartDate) {
            const startTime = new Date(this.form.flexibleStartDate).getTime()
            return time.getTime() < startTime
          }
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      }
    }
  },
  created() {
    let id = this.$route.query.id
    let _this = this
    this.initSubject(function () {
      _this.subjectFilter = _this.subjects
    })
    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      examPaperApi.select(id).then(re => {
        _this.form = re.response

        // 处理旧版本的时间数据格式
        if (_this.form.limitDateTime && _this.form.limitDateTime.length === 2) {
          _this.form.timeMode = 1 // 默认为限时考试模式
          _this.form.fixedStartTime = _this.form.limitDateTime[0]
          _this.form.fixedEndTime = _this.form.limitDateTime[1]
        } else {
          // 如果没有时间数据，设置默认值
          _this.form.timeMode = 1
          _this.form.fixedStartTime = null
          _this.form.fixedEndTime = null
          _this.form.flexibleStartDate = null
          _this.form.flexibleEndDate = null
          _this.form.dailyTimeRange = []
        }

        _this.formLoading = false
      })
    }
  },
  methods: {
    submitForm() {
      let _this = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 时间设置验证
          if (this.form.paperType === 4) {
            if (!this.validateTimeSettings()) {
              return false
            }
            // 转换时间格式用于后端
            this.convertTimeFormat()
          }

          this.formLoading = true
          examPaperApi.edit(this.form).then(re => {
            if (re.code === 1) {
              _this.$message.success(re.message)
              _this.delCurrentView(_this).then(() => {
                _this.$router.push('/exam/paper/list')
              })
            } else {
              _this.$message.error(re.message)
              this.formLoading = false
            }
          }).catch(e => {
            this.formLoading = false
          })
        } else {
          return false
        }
      })
    },

    // 试卷类型改变
    paperTypeChange(value) {
      if (value !== 4) {
        // 清空时间相关字段
        this.form.timeMode = 1
        this.form.fixedStartTime = null
        this.form.fixedEndTime = null
        this.form.flexibleStartDate = null
        this.form.flexibleEndDate = null
        this.form.dailyTimeRange = []
      }
    },

    // 时间模式改变
    timeModeChange(value) {
      // 清空另一种模式的数据
      if (value === 1) {
        this.form.flexibleStartDate = null
        this.form.flexibleEndDate = null
        this.form.dailyTimeRange = []
      } else {
        this.form.fixedStartTime = null
        this.form.fixedEndTime = null
      }
    },

    // 验证时间设置
    validateTimeSettings() {
      if (this.form.timeMode === 1) {
        if (!this.form.fixedStartTime || !this.form.fixedEndTime) {
          this.$message.error('请完整设置限时考试的开始和结束时间')
          return false
        }

        const startTime = new Date(this.form.fixedStartTime).getTime()
        const endTime = new Date(this.form.fixedEndTime).getTime()

        if (endTime <= startTime) {
          this.$message.error('考试结束时间必须晚于开始时间')
          return false
        }

        const duration = (endTime - startTime) / (1000 * 60) // 分钟
        if (duration < 10) {
          this.$message.error('考试时间不能少于10分钟')
          return false
        }

      } else if (this.form.timeMode === 2) {
        if (!this.form.flexibleStartDate || !this.form.flexibleEndDate) {
          this.$message.error('请完整设置灵活考试的开放和截止日期')
          return false
        }

        const startDate = new Date(this.form.flexibleStartDate).getTime()
        const endDate = new Date(this.form.flexibleEndDate).getTime()

        if (endDate <= startDate) {
          this.$message.error('考试截止日期必须晚于开放日期')
          return false
        }
      }

      return true
    },

    // 转换时间格式用于后端
    convertTimeFormat() {
      if (this.form.timeMode === 1) {
        // 限时考试模式：使用原有的 limitDateTime 格式
        this.form.limitDateTime = [this.form.fixedStartTime, this.form.fixedEndTime]
      } else {
        // 灵活考试模式：清空 limitDateTime，使用新的字段
        this.form.limitDateTime = []
      }
    },

    // 计算限时考试时长
    calculateFixedExamDuration() {
      if (!this.form.fixedStartTime || !this.form.fixedEndTime) {
        return 0
      }

      const startTime = new Date(this.form.fixedStartTime).getTime()
      const endTime = new Date(this.form.fixedEndTime).getTime()
      const duration = Math.round((endTime - startTime) / (1000 * 60))

      return duration > 0 ? duration : 0
    },

    // 计算灵活考试天数
    calculateFlexibleDays() {
      if (!this.form.flexibleStartDate || !this.form.flexibleEndDate) {
        return 0
      }

      const startDate = new Date(this.form.flexibleStartDate).getTime()
      const endDate = new Date(this.form.flexibleEndDate).getTime()
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

      return days > 0 ? days : 0
    },

    addTitle() {
      this.form.titleItems.push({
        name: '',
        questionItems: []
      })
    },
    addQuestion(titleItem) {
      this.currentTitleItem = titleItem
      this.questionPage.showDialog = true
      this.search()
    },
    removeTitleItem(titleItem) {
      this.form.titleItems.remove(titleItem)
    },
    removeQuestion(titleItem, questionItem) {
      titleItem.questionItems.remove(questionItem)
    },
    queryForm() {
      this.questionPage.queryParam.pageIndex = 1
      this.search()
    },
    confirmQuestionSelect() {
      let _this = this
      this.questionPage.multipleSelection.forEach(q => {
        questionApi.select(q.id).then(re => {
          _this.currentTitleItem.questionItems.push(re.response)
        })
      })
      this.questionPage.showDialog = false
    },
    levelChange() {
      this.form.subjectId = null
      this.subjectFilter = this.subjects.filter(data => data.level === this.form.level)
    },
    search() {
      this.questionPage.queryParam.subjectId = this.form.subjectId
      this.questionPage.listLoading = true
      questionApi.pageList(this.questionPage.queryParam).then(data => {
        const re = data.response
        this.questionPage.tableData = re.list
        this.questionPage.total = re.total
        this.questionPage.queryParam.pageIndex = re.pageNum
        this.questionPage.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.questionPage.multipleSelection = val
    },
    questionTypeFormatter(row, column, cellValue, index) {
      return this.enumFormat(this.questionTypeEnum, cellValue)
    },
    subjectFormatter(row, column, cellValue, index) {
      return this.subjectEnumFormat(cellValue)
    },
    resetForm() {
      let lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        level: null,
        subjectId: null,
        paperType: 1,
        timeMode: 1,
        fixedStartTime: null,
        fixedEndTime: null,
        flexibleStartDate: null,
        flexibleEndDate: null,
        dailyTimeRange: [],
        name: '',
        suggestTime: null,
        titleItems: [],
        maxAttempts: 0
      }
      this.form.id = lastId
    },
    ...mapActions('exam', { initSubject: 'initSubject' }),
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      questionTypeEnum: state => state.exam.question.typeEnum,
      paperTypeEnum: state => state.exam.examPaper.paperTypeEnum,
      levelEnum: state => state.user.levelEnum
    }),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>

<style lang="scss">
.exampaper-item-box {
  .q-title {
    margin: 0px 5px 0px 5px;
  }

  .q-item-content {}
}

.exam-time-setting {
  margin-bottom: 20px;

  .el-radio-group {
    width: 100%;

    .el-radio {
      width: 100%;
      margin-bottom: 15px;
      padding: 15px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        background-color: #f5f9ff;
      }

      &.is-checked {
        border-color: #409eff;
        background-color: #ecf5ff;
      }
    }
  }

  .time-mode-option {
    display: flex;
    align-items: center;
    width: 100%;

    i {
      font-size: 18px;
      margin-right: 10px;
      color: #409eff;
    }

    strong {
      margin-right: 10px;
      color: #303133;
    }

    .mode-desc {
      color: #909399;
      font-size: 13px;
    }
  }

  .time-setting-card {
    margin-top: 20px;
    padding: 20px;
    background-color: #fafbfc;
    border: 1px solid #e4e7ed;
    border-radius: 8px;

    .setting-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e4e7ed;

      i {
        font-size: 16px;
        margin-right: 8px;
        color: #409eff;
      }

      span {
        font-weight: bold;
        color: #303133;
        margin-right: 10px;
      }

      .el-tag {
        margin-left: auto;
      }
    }

    .el-form-item {
      margin-bottom: 18px;
    }

    .el-date-picker,
    .el-time-picker {
      width: 100%;
    }
  }
}

.time-summary {
  margin-top: 15px;

  .el-alert {
    border-radius: 6px;
  }
}

.field-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
