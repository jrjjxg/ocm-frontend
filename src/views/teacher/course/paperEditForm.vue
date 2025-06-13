<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">

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
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="success" @click="addTitle">添加标题</el-button>
        <el-button @click="goBack">返回</el-button>
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
import { mapGetters, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import QuestionShow from '@/views/exam/question/components/Show'
import teacherExamApi from '@/api/teacherExam'
import { courseQuestionPage, getCourseQuestionById } from '@/api/teacher/question'

export default {
  components: { Pagination, QuestionShow },
  props: {
    courseId: {
      type: String,
      required: true
    },
    paperId: {
      type: String,
      default: null
    },
    returnPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        id: null,
        level: 1, // 默认年级，课程管理系统中可以设为固定值
        subjectId: 1, // 默认学科，课程管理系统中可以设为固定值
        paperType: 1,
        limitDateTime: [],
        name: '',
        suggestTime: null,
        titleItems: []
      },
      formLoading: false,
      rules: {
        name: [
          { required: true, message: '请输入试卷名称', trigger: 'blur' }
        ],
        suggestTime: [
          { required: true, message: '请输入建议时长', trigger: 'blur' }
        ]
      },
      questionPage: {
        multipleSelection: [],
        showDialog: false,
        queryParam: {
          id: null,
          questionType: null,
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
  created() {
    if (this.paperId && parseInt(this.paperId) !== 0) {
      this.loadPaper()
    }
  },
  methods: {
    loadPaper() {
      this.formLoading = true
      teacherExamApi.selectPaper(this.courseId, this.paperId).then(res => {
        if (res.code === 1) {
          this.form = res.response
        } else {
          this.$message.error(res.message || '获取试卷详情失败')
        }
        this.formLoading = false
      }).catch(error => {
        console.error('获取试卷详情出错:', error)
        this.$message.error('网络错误，请稍后重试')
        this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true
          const apiCall = this.form.id
            ? teacherExamApi.updatePaper(this.courseId, this.form.id, this.form)
            : teacherExamApi.createPaper(this.courseId, this.form)

          apiCall.then(res => {
            if (res.code === 1) {
              this.$message.success(this.form.id ? '更新成功' : '创建成功')
              this.goBack()
            } else {
              this.$message.error(res.message || '操作失败')
            }
            this.formLoading = false
          }).catch(error => {
            console.error('提交试卷出错:', error)
            this.$message.error('网络错误，请稍后重试')
            this.formLoading = false
          })
        }
      })
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
    queryForm() {
      this.questionPage.queryParam.pageIndex = 1
      this.search()
    },
    confirmQuestionSelect() {
      const promises = this.questionPage.multipleSelection.map(q => {
        return getCourseQuestionById(this.courseId, q.id)
      })

      Promise.all(promises).then(responses => {
        responses.forEach(res => {
          if (res.code === 1) {
            this.currentTitleItem.questionItems.push(res.response)
          }
        })
        this.questionPage.showDialog = false
      }).catch(error => {
        console.error('获取题目详情出错:', error)
        this.$message.error('获取题目详情失败')
      })
    },
    search() {
      this.questionPage.listLoading = true
      courseQuestionPage(this.courseId, this.questionPage.queryParam).then(res => {
        if (res.code === 1) {
          const data = res.response
          this.questionPage.tableData = data.list
          this.questionPage.total = data.total
          this.questionPage.queryParam.pageIndex = data.pageNum
        } else {
          this.$message.error(res.message || '获取题目列表失败')
        }
        this.questionPage.listLoading = false
      }).catch(error => {
        console.error('获取题目列表出错:', error)
        this.$message.error('网络错误，请稍后重试')
        this.questionPage.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.questionPage.multipleSelection = val
    },
    questionTypeFormatter(row, column, cellValue, index) {
      return this.enumFormat(this.questionTypeEnum, cellValue)
    },
    resetForm() {
      const lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        level: 1, // 默认年级
        subjectId: 1, // 默认学科
        paperType: 1,
        limitDateTime: [],
        name: '',
        suggestTime: null,
        titleItems: []
      }
      this.form.id = lastId
    },
    goBack() {
      if (this.returnPath) {
        this.$router.push(this.returnPath)
      } else {
        this.$router.push(`/teacher/course/${this.courseId}/papers`)
      }
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      questionTypeEnum: state => state.exam.question.typeEnum,
      paperTypeEnum: state => state.exam.examPaper.paperTypeEnum
    })
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
</style>
