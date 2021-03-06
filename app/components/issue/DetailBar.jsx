import React, { PropTypes, Component } from 'react';
import { Modal, Button, ControlLabel, Label, Grid, Row, Col, Table, Tabs, Tab, Form, FormGroup, DropdownButton, MenuItem, ButtonToolbar, ButtonGroup, OverlayTrigger, Popover, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Link } from 'react-router';
import DropzoneComponent from 'react-dropzone-component';
import Lightbox from 'react-image-lightbox';
import Select from 'react-select';
import _ from 'lodash';
import { notify } from 'react-notify-toast';

const $ = require('$');
const moment = require('moment');
const CreateModal = require('./CreateModal');
const Comments = require('./comments/Comments');
const History = require('./history/History');
const GitCommits = require('./gitcommits/GitCommits');
const Worklog = require('./worklog/Worklog');
const img = require('../../assets/images/loading.gif');
const PreviewModal = require('../workflow/PreviewModal');
const DelFileModal = require('./DelFileModal');
const LinkIssueModal = require('./LinkIssueModal');
const DelLinkModal = require('./DelLinkModal');
const ConvertTypeModal = require('./ConvertTypeModal');
const ConvertType2Modal = require('./ConvertType2Modal');
const MoveModal = require('./MoveModal');
const AssignModal = require('./AssignModal');
const SetLabelsModal = require('./SetLabelsModal');
const ShareLinkModal = require('./ShareLinkModal');
const ResetStateModal = require('./ResetStateModal');
const WorkflowCommentsModal = require('./WorkflowCommentsModal');
const DelNotify = require('./DelNotify');
const CopyModal = require('./CopyModal');
const WatcherListModal = require('./WatcherListModal');

export default class DetailBar extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      tabKey: 1, 
      delFileShow: false, 
      selectedFile: {}, 
      inlinePreviewShow: {}, 
      previewShow: {}, 
      photoIndex: 0, 
      editAssignee: false, 
      settingAssignee: false, 
      editModalShow: false, 
      previewModalShow: false, 
      subtaskShow: false, 
      linkShow: false, 
      linkIssueModalShow: false, 
      delLinkModalShow: false, 
      delLinkData: {}, 
      createSubtaskModalShow: false, 
      moveModalShow: false, 
      convertTypeModalShow: false, 
      convertType2ModalShow: false, 
      assignModalShow: false, 
      setLabelsModalShow: false, 
      shareModalShow: false, 
      resetModalShow: false, 
      workflowScreenShow: false, 
      workflowCommentsShow: false, 
      delNotifyShow: false,
      copyModalShow: false,
      watchersModalShow: false,
      action_id: '' };
    this.delFileModalClose = this.delFileModalClose.bind(this);
    this.uploadSuccess = this.uploadSuccess.bind(this);
    this.goTo = this.goTo.bind(this);
    this.watch = this.watch.bind(this);
  }

  static propTypes = {
    i18n: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    record: PropTypes.func.isRequired,
    forward: PropTypes.func.isRequired,
    visitedIndex: PropTypes.number.isRequired, 
    visitedCollection: PropTypes.array.isRequired,
    issueCollection: PropTypes.array.isRequired,
    show: PropTypes.func.isRequired,
    detailFloatStyle: PropTypes.object,
    wfCollection: PropTypes.array.isRequired,
    wfLoading: PropTypes.bool.isRequired,
    viewWorkflow: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    itemLoading: PropTypes.bool.isRequired,
    fileLoading: PropTypes.bool.isRequired,
    delFile: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    setAssignee: PropTypes.func.isRequired,
    setLabels: PropTypes.func.isRequired,
    addLabels: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    indexComments: PropTypes.func.isRequired,
    sortComments: PropTypes.func.isRequired,
    addComments: PropTypes.func.isRequired,
    editComments: PropTypes.func.isRequired,
    delComments: PropTypes.func.isRequired,
    commentsCollection: PropTypes.array.isRequired,
    commentsIndexLoading: PropTypes.bool.isRequired,
    commentsLoading: PropTypes.bool.isRequired,
    commentsItemLoading: PropTypes.bool.isRequired,
    commentsLoaded: PropTypes.bool.isRequired,
    indexWorklog: PropTypes.func.isRequired,
    worklogSort: PropTypes.string.isRequired,
    sortWorklog: PropTypes.func.isRequired,
    addWorklog: PropTypes.func.isRequired,
    editWorklog: PropTypes.func.isRequired,
    delWorklog: PropTypes.func.isRequired,
    worklogCollection: PropTypes.array.isRequired,
    worklogIndexLoading: PropTypes.bool.isRequired,
    worklogLoading: PropTypes.bool.isRequired,
    worklogLoaded: PropTypes.bool.isRequired,
    indexHistory: PropTypes.func.isRequired,
    sortHistory: PropTypes.func.isRequired,
    historyCollection: PropTypes.array.isRequired,
    historyIndexLoading: PropTypes.bool.isRequired,
    historyLoaded: PropTypes.bool.isRequired,
    indexGitCommits: PropTypes.func.isRequired,
    sortGitCommits: PropTypes.func.isRequired,
    gitCommitsCollection: PropTypes.array.isRequired,
    gitCommitsIndexLoading: PropTypes.bool.isRequired,
    gitCommitsLoaded: PropTypes.bool.isRequired,
    createLink: PropTypes.func.isRequired,
    delLink: PropTypes.func.isRequired,
    linkLoading: PropTypes.bool.isRequired,
    doAction: PropTypes.func.isRequired,
    watch: PropTypes.func.isRequired,
    copy: PropTypes.func.isRequired,
    move: PropTypes.func.isRequired,
    convert: PropTypes.func.isRequired,
    resetState: PropTypes.func.isRequired,
    del: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
  }

  componentDidMount() {
    if ($('.animate-dialog').length > 0) {
      let width = 0;
      const docWidth = $('.doc-container').get(0).clientWidth;
      width = _.max([ docWidth / 2, 600 ]);
      width = _.min([ width, 1000 ]);
      $('.animate-dialog').css('width', width + 'px');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.itemLoading) {
      this.setState({ tabKey: 1, editAssignee: false });
    }
  }

  handleTabSelect(tabKey) {
    const { 
      indexComments, 
      indexHistory, 
      indexGitCommits, 
      indexWorklog, 
      commentsLoaded, 
      historyLoaded, 
      gitCommitsLoaded, 
      worklogLoaded, 
      data } = this.props;

    this.setState({ tabKey });
    if (tabKey === 2 && !commentsLoaded) {
      indexComments(data.id);
    } else if (tabKey === 3 && !historyLoaded) {
      indexHistory(data.id);
    } else if (tabKey === 4 && !worklogLoaded) {
      indexWorklog(data.id);
    } else if (tabKey === 5 && !gitCommitsLoaded) {
      indexGitCommits(data.id);
    }
  }

  delFileNotify(field_key, id, name) {
    this.setState({ delFileShow: true, selectedFile: { field_key, id, name } });
  }

  delFileModalClose() {
    this.setState({ delFileShow: false });
  }

  uploadSuccess(localfile, res) {
    const { field = '', file = {} } = res.data;
    const { addFile } = this.props;
    addFile(field, file); 
  }

  openPreview(index, fieldkey) {
    const { options } = this.props;
    if (options.permissions && options.permissions.indexOf('download_file') !== -1) {
      this.state.previewShow[fieldkey] = true;
      this.setState({ previewShow: this.state.previewShow, photoIndex: index });
    } else {
      notify.show('权限不足。', 'error', 2000);
    }
  }

  async viewWorkflow(e) {
    e.preventDefault();
    const { data, viewWorkflow } = this.props;
    if (!data.definition_id) { return; }
    const ecode = await viewWorkflow(data.definition_id);
    if (ecode === 0) {
      this.setState({ previewModalShow: true });
    }
  }

  async assignToMe(e) {
    e.preventDefault();
    const { setAssignee, data } = this.props;
    const ecode = await setAssignee(data.id, { assignee: 'me' });
    if (ecode === 0) {
      notify.show('已分配给我。', 'success', 2000);
    } else {
      notify.show('问题分配失败。', 'error', 2000);
    }
    // fix me
    //if (ecode === 0) {
    //} else {
    //}
  }

  editAssignee() {
    this.setState({ editAssignee: true });
  }

  async setAssignee() {
    this.setState({ settingAssignee: true });
    const { setAssignee, data } = this.props;
    const ecode = await setAssignee(data.id, { assignee: this.state.newAssignee });
    if (ecode === 0) {
      this.setState({ settingAssignee: false, editAssignee: false, newAssignee: undefined });
      notify.show('问题已分配。', 'success', 2000);
    } else {
      this.setState({ settingAssignee: false });
      notify.show('问题分配失败。', 'error', 2000);
    }
  }

  cancelSetAssignee() {
    this.setState({ editAssignee: false, newAssignee: undefined });
  }

  handleAssigneeSelectChange(value) {
    this.setState({ newAssignee: value });
  }

  editModalClose() {
    this.setState({ editModalShow: false });
  }

  workflowScreenModalClose() {
    this.setState({ workflowScreenShow: false });
  }

  workflowCommentsModalClose() {
    this.setState({ workflowCommentsShow: false });
  }

  createSubtaskModalClose() {
    this.setState({ createSubtaskModalShow: false });
  }

  getFileIconCss(fileName) {
    const newFileName = (fileName || '').toLowerCase();
    if (_.endsWith(newFileName, 'doc') || _.endsWith(newFileName, 'docx')) {
      return 'fa fa-file-word-o';
    } else if (_.endsWith(newFileName, 'xls') || _.endsWith(newFileName, 'xlsx')) {
      return 'fa fa-file-excel-o';
    } else if (_.endsWith(newFileName, 'ppt') || _.endsWith(newFileName, 'pptx')) {
      return 'fa fa-file-powerpoint-o';
    } else if (_.endsWith(newFileName, 'pdf')) {
      return 'fa fa-file-pdf-o';
    } else if (_.endsWith(newFileName, 'txt')) {
      return 'fa fa-file-text-o';
    } else if (_.endsWith(newFileName, 'zip') || _.endsWith(newFileName, 'rar') || _.endsWith(newFileName, '7z') || _.endsWith(newFileName, 'gz') || _.endsWith(newFileName, 'bz')) {
      return 'fa fa-file-zip-o';
    } else {
      return 'fa fa-file-o';
    }
  }

  async next(curInd) {
    const { show, record, issueCollection=[] } = this.props;
    if (curInd < issueCollection.length - 1) {
      const nextInd = _.add(curInd, 1);
      const nextId = issueCollection[nextInd].id;
      const ecode = await show(nextId);
      if (ecode === 0) {
        record();
      }
    }
  }

  async previous(curInd) {
    const { show, record, issueCollection=[] } = this.props;
    if (curInd > 0 ) {
      const nextId = issueCollection[curInd - 1].id;
      const ecode = await show(nextId);
      if (ecode === 0) {
        record();
      }
    }
  }

  async forward(offset) {
    const { show, forward, visitedIndex, visitedCollection=[] } = this.props;
    const forwardIndex = _.add(visitedIndex, offset);
    if (visitedCollection[ forwardIndex ]) {
      const ecode = await show(visitedCollection[ forwardIndex ]);
      if (ecode === 0) {
        forward(offset);
      }
    }
  }

  async operateSelect(eventKey) {
    const { data, show, watch } = this.props;

    let ecode = 0;
    if (eventKey == 'refresh') {
      ecode = await show(data.id);
    } else if (eventKey == 'assign') {
      this.setState({ assignModalShow: true });
    } else if (eventKey == 'setLabels') {
      this.setState({ setLabelsModalShow: true });
    } else if (eventKey == 'link') {
      this.setState({ linkIssueModalShow: true });
    } else if (eventKey == 'createSubtask') {
      this.setState({ createSubtaskModalShow: true });
    } else if (eventKey == 'convert2Subtask') {
      this.setState({ convertType2ModalShow: true });
    } else if (eventKey == 'convert2Standard') {
      this.setState({ convertTypeModalShow: true });
    } else if (eventKey == 'move') {
      this.setState({ moveModalShow: true });
    } else if (eventKey == 'share') {
      this.setState({ shareModalShow: true });
    } else if (eventKey == 'copy') {
      this.setState({ copyModalShow: true });
    } else if (eventKey == 'reset') {
      this.setState({ resetModalShow: true });
    } else if (eventKey == 'watch') {
      const watching = data.watching;
      this.watch(data.id, !watching);
    } else if (eventKey == 'watchers') {
      this.setState({ watchersModalShow : true });
    } else if (eventKey == 'del') {
      this.setState({ delNotifyShow : true });
    }
  }

  async watch(id, flag) {
    const { watch } = this.props;
    const ecode = await watch(id, flag);
    if (ecode === 0) {
      if (flag) {
        notify.show('关注成功。', 'success', 2000);
      } else {
        notify.show('已取消关注。', 'success', 2000);
      }
    } else {
      if (flag) {
        notify.show('关注失败。', 'error', 2000);
      } else {
        notify.show('取消失败。', 'error', 2000);
      }
    }
  }

  delLink(linkData) {
    this.setState({ delLinkModalShow: true, delLinkData: linkData });
  }

  async goTo(issue_id) {
    const { show, record } = this.props;
    const ecode = await show(issue_id);
    if (ecode === 0) {
      record();
    }
  }

  async doAction(action_id) {
    const { doAction, data } = this.props;
    const action = _.find(data.wfactions || {}, { id: action_id });
    if (action && action.screen) {
      //if (action.screen == 'comments') {
      //  this.setState({ workflowCommentsShow: true, action_id });
      //} else {
      //  this.setState({ workflowScreenShow: true, action_id });
      //}
      this.setState({ workflowScreenShow: true, action_id });
    } else {
      const ecode = await doAction(data.id, data.entry_id, action_id);
      if (ecode === 0) {
        notify.show('提交完成。', 'success', 2000);
      } else {
        notify.show('提交失败。', 'error', 2000);
      }
    }
  }

  async actionSelect(eventKey) {
    const { data, doAction } = this.props;
    const action = _.find(data.wfactions || {}, { id: eventKey });
    if (action && action.schema) {
      this.setState({ workflowScreenShow: true, action_id: eventKey });
    } else {
      const ecode = await doAction(data.id, data.entry_id, eventKey);
      if (ecode === 0) {
        notify.show('提交完成。', 'success', 2000);
      } else {
        notify.show('提交失败。', 'error', 2000);
      }
    }
  }

  previewInlineImg(e) {
    const { options } = this.props;

    if (options.permissions && options.permissions.indexOf('download_file') === -1) {
      notify.show('权限不足。', 'error', 2000);
      return;
    }

    const targetid = e.target.id;
    if (!targetid) {
      return;
    }

    let fieldkey = '';
    let imgInd = -1;
    if (targetid.indexOf('inlineimg-') === 0) {
      fieldkey = targetid.substring(10, targetid.lastIndexOf('-'));
      imgInd = targetid.substr(targetid.lastIndexOf('-') + 1) - 0;
    }

    this.state.inlinePreviewShow[fieldkey] = true;
    this.setState({ inlinePreviewShow: this.state.inlinePreviewShow, photoIndex: imgInd });
  }

  render() {
    const { 
      i18n,
      close, 
      detailFloatStyle={},
      data={}, 
      record, 
      visitedIndex, 
      visitedCollection, 
      issueCollection=[], 
      loading, 
      itemLoading, 
      options, 
      project, 
      fileLoading, 
      delFile, 
      create, 
      edit, 
      del,
      copy,
      move,
      convert,
      setAssignee,
      setLabels,
      addLabels,
      resetState,
      wfCollection, 
      wfLoading, 
      indexComments, 
      sortComments, 
      commentsCollection, 
      commentsIndexLoading, 
      commentsLoading, 
      commentsItemLoading, 
      addComments, 
      editComments, 
      delComments, 
      indexHistory, 
      sortHistory, 
      historyCollection, 
      historyIndexLoading, 
      indexGitCommits,
      sortGitCommits,
      gitCommitsCollection,
      gitCommitsIndexLoading,
      indexWorklog, 
      worklogSort,
      sortWorklog, 
      worklogCollection, 
      worklogIndexLoading, 
      worklogLoading, 
      addWorklog, 
      editWorklog, 
      delWorklog, 
      createLink, 
      delLink, 
      linkLoading, 
      doAction,
      user } = this.props;

    const { 
      inlinePreviewShow, 
      previewShow, 
      photoIndex, 
      newAssignee, 
      settingAssignee, 
      editAssignee, 
      delFileShow, 
      selectedFile, 
      action_id } = this.state;

    const panelStyle = { marginBottom: '0px', borderTop: '0px', borderRadius: '0px' };

    const assigneeOptions = _.map(options.assignees || [], (val) => { 
      return { label: val.name + '(' + val.email + ')', value: val.id } 
    });

    const subtaskTypeOptions = [];
    _.map(options.types, (val) => {
      if (val.type == 'subtask' && !val.disabled) {
        subtaskTypeOptions.push(val);
      }
    });

    const type = _.find(options.types, { id : data.type });
    const schema = type && type.schema ? type.schema : [];

    const curInd = _.findIndex(issueCollection, { id: data.id });

    const priorityInd = data.priority ? _.findIndex(options.priorities, { id: data.priority }) : -1;
    const priorityStyle = { marginLeft: '5px', marginRight: '5px' };
    if (priorityInd !== -1) {
      _.extend(priorityStyle, { backgroundColor: options.priorities[priorityInd].color });
    }

    const stateInd = data.state ? _.findIndex(options.states, { id: data.state }) : -1;
    let stateClassName = '';
    if (stateInd !== -1) {
      stateClassName = 'state-' + options.states[stateInd].category + '-label';
    }

    let selectedEpic = {};
    if (data.epic) {
      selectedEpic = _.find(options.epics, { id: data.epic });
    }

    //const storage = window.localStorage;
    //let issueStorage = storage.getItem(project.key + '-' + data.no);
    //if (issueStorage) {
    //  issueStorage = JSON.parse(issueStorage); 
    //}

    const commentsTab = (
      <div>
        <span style={ { paddingRight: '6px' } }>备注{ !itemLoading && '(' + (data.comments_num > 99 ? '99+' : (data.comments_num || 0)) + ')' }</span>
      </div>);

    const worklogTab = (
      <div>
        <span style={ { paddingRight: '6px' } }>工作日志{ !itemLoading && '(' + (data.worklogs_num > 99 ? '99+' : (data.worklogs_num || 0)) + ')' }</span>
      </div>);

    const gitTab = (
      <div>
        <span style={ { paddingRight: '6px' } }>Git提交{ !itemLoading && '(' + (data.gitcommits_num > 99 ? '99+' : (data.gitcommits_num || 0)) + ')' }</span>
      </div>);

    return (
      <div className='animate-dialog' style={ { ...detailFloatStyle } }>
        <Button className='close' onClick={ close } title='关闭'>
          <i className='fa fa-close'></i>
        </Button>
        <Button className={ curInd < 0 || curInd >= issueCollection.length - 1 ? 'angle-disable' : 'angle' } onClick={ this.next.bind(this, curInd) } disabled={ curInd < 0 || curInd >= issueCollection.length - 1 } title='下一个'>
          <i className='fa fa-angle-down'></i>
        </Button>
        <Button className={ curInd <= 0 ? 'angle-disable' : 'angle' } onClick={ this.previous.bind(this, curInd) } disabled={ curInd <= 0 } title='上一个'>
          <i className='fa fa-angle-up'></i>
        </Button>
        <Button className={ visitedIndex < 0 || visitedIndex >= visitedCollection.length - 1 ? 'angle-disable' : 'angle' } onClick={ this.forward.bind(this, 1) } disabled={ visitedIndex < 0 || visitedIndex >= visitedCollection.length - 1 } title='前进'>
          <i className='fa fa-angle-right'></i>
        </Button>
        <Button className={ visitedIndex <= 0 ? 'angle-disable' : 'angle' } onClick={ this.forward.bind(this, -1) } disabled={ visitedIndex <= 0 } title='后退'>
          <i className='fa fa-angle-left'></i>
        </Button>
        <Button className='angle' title={ data.watching ? '点击取消关注' : '点击关注' } onClick={ () => { this.watch(data.id, !data.watching) } }>
        { data.watching ? <i className='fa fa-eye-slash'></i> : <i className='fa fa-eye'></i> }
        </Button>
        <div className='panel panel-default' style={ panelStyle }>
          <Tabs activeKey={ this.state.tabKey } onSelect={ this.handleTabSelect.bind(this) } id='issue-detail-tab'>
            <Tab eventKey={ 1 } title='基本'>
              <div className='detail-view-blanket' style={ { display: itemLoading ? 'block' : 'none' } }><img src={ img } className='loading detail-loading'/></div>
              <Form horizontal className={ itemLoading && 'hide' } style={ { marginRight: '10px', marginBottom: '40px', marginLeft: '10px' } }>
                <ButtonToolbar style={ { margin: '15px 0px 15px -5px' } }>
                  { options.permissions && options.permissions.indexOf('edit_issue') !== -1 && <Button onClick={ () => { this.setState({ editModalShow: true }) } }><i className='fa fa-pencil'></i> 编辑</Button> }
                  { options.permissions && options.permissions.indexOf('exec_workflow') !== -1 && (
                    data.wfactions && data.wfactions.length <= 3 ?
                    <ButtonGroup style={ { marginLeft: '10px' } }>
                    { _.map(data.wfactions || [], (v, i) => {
                      return ( <Button key={ v.id } onClick={ this.doAction.bind(this, v.id) }>{ v.name }</Button> ); 
                    }) }
                    </ButtonGroup>
                    :
                    <div style={ { float: 'left', marginLeft: '10px' } }>
                      <DropdownButton title='动作' onSelect={ this.actionSelect.bind(this) }>
                      { _.map(data.wfactions || [], (v, i) => {
                        return ( <MenuItem eventKey={ v.id }>{ v.name }</MenuItem> ); 
                      }) }
                      </DropdownButton>
                    </div> ) }
                  <div style={ { float: 'right' } }>
                    <DropdownButton pullRight title='更多' onSelect={ this.operateSelect.bind(this) }>
                      <MenuItem eventKey='refresh'>刷新</MenuItem>
                      { options.permissions && options.permissions.indexOf('assign_issue') !== -1 && <MenuItem eventKey='assign'>分配</MenuItem> }
                      { options.permissions && options.permissions.indexOf('edit_issue') !== -1 && <MenuItem eventKey='setLabels'>设置标签</MenuItem> }
                      <MenuItem divider/>
                      <MenuItem eventKey='watch'>{ data.watching ? '取消关注' : '关注' }</MenuItem>
                      <MenuItem eventKey='watchers'><span>查看关注者 <span className='badge-number'>{ data.watchers && data.watchers.length }</span></span></MenuItem>
                      <MenuItem eventKey='share'>分享链接</MenuItem>
                      { !data.parent_id && subtaskTypeOptions.length > 0 && options.permissions && ((options.permissions.indexOf('edit_issue') !== -1 && !data.hasSubtasks) || options.permissions.indexOf('create_issue') !== -1) && <MenuItem divider/> }
                      { !data.parent_id && subtaskTypeOptions.length > 0 && options.permissions && options.permissions.indexOf('create_issue') !== -1 && <MenuItem eventKey='createSubtask'>创建子任务</MenuItem> }
                      { !data.hasSubtasks && !data.parent_id && subtaskTypeOptions.length > 0 && options.permissions && options.permissions.indexOf('edit_issue') !== -1 && <MenuItem eventKey='convert2Subtask'>转换为子任务</MenuItem> }
                      { data.parent_id && options.permissions && options.permissions.indexOf('edit_issue') !== -1 && <MenuItem divider/> }
                      { data.parent_id && options.permissions && options.permissions.indexOf('edit_issue') !== -1 && <MenuItem eventKey='convert2Standard'>转换为标准问题</MenuItem> }
                      { options.permissions && (_.intersection(options.permissions, ['link_issue', 'create_issue']).length > 0 || (options.permissions.indexOf('move_issue') !== -1 && data.parent_id)) && <MenuItem divider/> }
                      { options.permissions && options.permissions.indexOf('move_issue') !== -1 && data.parent_id && <MenuItem eventKey='move'>移动</MenuItem> }
                      { options.permissions && options.permissions.indexOf('link_issue') !== -1 && <MenuItem eventKey='link'>链接</MenuItem> }
                      { options.permissions && options.permissions.indexOf('create_issue') !== -1 && <MenuItem eventKey='copy'>复制</MenuItem> }
                      { options.permissions && _.intersection(options.permissions, ['reset_issue', 'delete_issue']).length > 0 && <MenuItem divider/> }
                      { options.permissions && options.permissions.indexOf('reset_issue') !== -1 && <MenuItem eventKey='reset'>重置状态</MenuItem> }
                      { options.permissions && options.permissions.indexOf('delete_issue') !== -1 && <MenuItem eventKey='del'>删除</MenuItem> }
                    </DropdownButton>
                  </div>
                </ButtonToolbar>
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    主题/NO 
                  </Col>
                  <Col sm={ 9 }>
                    <div style={ { marginTop: '7px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' } }>
                      { data.parent && 
                        <a href='#' onClick={ (e) => { e.preventDefault(); this.goTo(data.parent.id); } }>
                          { data.parent.no + '-' + data.parent.title }
                        </a> }
                      { data.parent && ' / ' }{ data.no + '-' + data.title }
                    </div>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    类型 
                  </Col>
                  <Col sm={ 3 }>
                    <div style={ { marginTop: '7px' } }>
                      <span className='type-abb'>
                        { type ? type.abb : '-' }
                      </span>
                      { type ? type.name : '-' }
                    </div>
                  </Col>
                  <Col sm={ 2 } componentClass={ ControlLabel }>
                    状态
                  </Col>
                  <Col sm={ 4 }>
                    <div style={ { marginTop: '7px' } }>
                      { stateInd !== -1 ? <span className={ stateClassName }>{ options.states[stateInd].name }</span> : '-' } 
                      { !wfLoading ? <a href='#' onClick={ this.viewWorkflow.bind(this) }><span style={ { marginLeft: '5px' } }>(查看)</span></a> : <img src={ img } className='small-loading'/> }
                    </div>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    优先级
                  </Col>
                  <Col sm={ 3 }>
                    <div style={ { marginTop: '7px' } }>
                      { priorityInd !== -1 &&
                      <div className='circle' style={ priorityStyle }/> }
                      { priorityInd !== -1 ? options.priorities[priorityInd].name : '-' }
                      </div>
                  </Col>
                  <Col sm={ 2 } componentClass={ ControlLabel }>
                    解决结果
                  </Col>
                  <Col sm={ 4 }>
                    <div style={ { marginTop: '7px' } }>
                      { _.find(options.resolutions || [], { id: data.resolution }) ? _.find(options.resolutions, { id: data.resolution }).name : '-' }
                    </div>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    经办人
                  </Col>
                  <Col sm={ editAssignee ? 7 : 3 }>
                    { !editAssignee ?
                    <div style={ { marginTop: '7px' } }>
                      { options.permissions && options.permissions.indexOf('assign_issue') !== -1 ?
                      <div className='editable-list-field' style={ { display: 'table', width: '100%' } }>
                        <span>
                          <div style={ { display: 'inline-block', float: 'left', margin: '3px' } }>
                            { data['assignee'] && data['assignee'].name || '-' }
                          </div>
                        </span>
                        <span className='edit-icon-zone edit-icon' onClick={ this.editAssignee.bind(this) }><i className='fa fa-pencil'></i></span>
                      </div> 
                      : 
                      <div>
                        <span>{ data['assignee'] && data['assignee'].name || '-' }</span>
                      </div> }
                      { (!data['assignee'] || data['assignee'].id !== user.id) && options.permissions && options.permissions.indexOf('assigned_issue') !== -1 &&
                      <span style={ { float: 'left' } }><a href='#' onClick={ this.assignToMe.bind(this) }>分配给我</a></span> }
                    </div>
                    :
                    <div style={ { marginTop: '7px' } }>
                      <Select 
                        simpleValue 
                        clearable={ false } 
                        disabled={ settingAssignee } 
                        options={ assigneeOptions } 
                        value={ newAssignee || data['assignee'].id } 
                        onChange={ this.handleAssigneeSelectChange.bind(this) } 
                        placeholder='选择经办人'/>
                      <div style={ { float: 'right' } }>
                        <Button className='edit-ok-button' onClick={ this.setAssignee.bind(this) }><i className='fa fa-check'></i></Button>
                        <Button className='edit-ok-button' onClick={ this.cancelSetAssignee.bind(this) }><i className='fa fa-close'></i></Button>
                      </div>
                    </div> }
                  </Col>
                  { !editAssignee && 
                  <Col sm={ 2 } componentClass={ ControlLabel }>
                    报告人 
                  </Col> }
                  { !editAssignee && 
                  <Col sm={ 4 }>
                    <div style={ { marginTop: '7px' } }>
                      <span>{ data['reporter'] && data['reporter'].name || '-' }</span>
                    </div>
                  </Col> }
                </FormGroup>
                { data.labels && data.labels.length > 0 &&
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    标签 
                  </Col>
                  <Col sm={ 9 }>
                    <div style={ { marginTop: '7px' } }>
                    { _.map(data.labels, (v) => {
                      return (<Link to={ '/project/' + project.key + '/issue?labels=' + v }><span title={ v } className='issue-label'>{ v }</span></Link>);
                    }) }
                    </div>
                  </Col>
                </FormGroup> }
                { data.resolve_version &&
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    解决版本 
                  </Col>
                  <Col sm={ 7 }>
                    <div style={ { marginTop: '7px' } }>
                     { _.find(options.versions, { id: data.resolve_version }) ? _.find(options.versions, { id: data.resolve_version }).name : '-' }
                    </div>
                  </Col>
                </FormGroup> }
                { data.epic &&
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    Epic
                  </Col>
                  <Col sm={ 7 }>
                    <div style={ { marginTop: '7px' } }>
                      <Link to={ '/project/' + project.key + '/issue?epic=' + data.epic }>
                        <span className='epic-title' style={ { borderColor: selectedEpic.bgColor, backgroundColor: selectedEpic.bgColor, maxWidth: '100%', marginRight: '5px', marginTop: '0px', float: 'left' } } title={ selectedEpic.name || '-' } >
                          { selectedEpic.name || '-' }
                        </span>
                      </Link>
                    </div>
                  </Col>
                </FormGroup> }
                { data.sprints && data.sprints.length > 0 &&
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    Sprint
                  </Col>
                  <Col sm={ 7 }>
                    <div style={ { marginTop: '7px' } }>
                      Sprint { data.sprints.join(', ') }
                    </div>
                  </Col>
                </FormGroup> }
                { data.subtasks && data.subtasks.length > 0 &&
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    子任务 
                  </Col>
                  <Col sm={ 9 }>
                    { data.subtasks.length > 3 &&
                    <div style={ { marginTop: '7px' } }>
                      共{ data.subtasks.length }个子任务
                      <span style={ { marginLeft: '5px' } }> 
                        <a href='#' onClick={ (e) => { e.preventDefault(); this.setState({ subtaskShow: !this.state.subtaskShow }) } }>
                          { this.state.subtaskShow ? '收起' : '展开' } 
                          <i className={ this.state.subtaskShow ?  'fa fa-angle-double-up' : 'fa fa-angle-double-down' }></i>
                        </a>
                      </span>
                    </div> }
                    <Table condensed hover responsive className={ (!this.state.subtaskShow && data.subtasks.length > 3) ? 'hide' : '' } style={ { marginTop: '10px', marginBottom: '0px' } }>
                      <tbody>
                      { _.map(data.subtasks, (val, key) => {
                        return (<tr key={ 'subtask' + key }>
                          <td>
                            <a href='#' style={ val.state == 'Closed' ? { textDecoration: 'line-through' } : {} } onClick={ (e) => { e.preventDefault(); this.goTo(val.id); } }>
                            { val.no } - { val.title }
                            </a>
                          </td>
                          <td style={ { whiteSpace: 'nowrap', width: '10px', textAlign: 'center' } }>
                            { _.find(options.states || [], { id: val.state }) ? <span className={ 'state-' +  _.find(options.states, { id: val.state }).category  + '-label' }>{ _.find(options.states, { id: val.state }).name }</span> : '-' }
                          </td>
                        </tr>); 
                      }) }
                      </tbody>
                    </Table>
                  </Col>
                </FormGroup> }

                { data.links && data.links.length > 0 &&
                <FormGroup>
                  <Col sm={ 3 } componentClass={ ControlLabel }>
                    链接问题 
                  </Col>
                  <Col sm={ 9 }>
                    { data.links.length > 3 &&
                    <div style={ { marginTop: '7px' } }>
                      共{ data.links.length }个问题
                      <span style={ { marginLeft: '5px' } }> 
                        <a href='#' onClick={ (e) => { e.preventDefault(); this.setState({ linkShow: !this.state.linkShow }) } }>
                          { this.state.linkShow ? '收起' : '展开' } 
                          <i className={ this.state.linkShow ?  'fa fa-angle-double-up' : 'fa fa-angle-double-down' }></i>
                        </a>
                      </span>
                    </div> }
                    <Table condensed hover responsive className={ (!this.state.linkShow && data.links.length > 3) ? 'hide' : '' } style={ { marginTop: '10px', marginBottom: '0px' } }>
                      <tbody>
                      { _.map(data.links, (val, key) => {
                        let linkedIssue = {};
                        let relation = '';
                        let linkIssueId = ''
                        if (val.src.id == data.id) {
                          linkedIssue = val.dest;
                          relation = val.relation;
                          linkIssueId = val.dest.id;
                        } else if (val.dest.id == data.id) {
                          linkedIssue = val.src;
                          relation = val.relation;
                          if (relation == 'is blocked by') {
                            relation = 'blocks';
                          } else if (relation == 'blocks') {
                            relation = 'is blocked by';
                          } else if (relation == 'is cloned by') {
                            relation = 'clones';
                          } else if (relation == 'clones') {
                            relation = 'is cloned by';
                          } else if (relation == 'is duplicated by') {
                            relation = 'duplicates';
                          } else if (relation == 'duplicates') {
                            relation = 'is duplicated by';
                          }
                          linkIssueId = val.src.id;
                        }
                        return (<tr key={ 'link' + key }>
                          <td>
                            { relation }
                            <br/>
                            <a href='#' style={ linkedIssue.state == 'Closed' ? { textDecoration: 'line-through' } : {} } onClick={ (e) => { e.preventDefault(); this.goTo(linkIssueId); } }>
                              { linkedIssue.no } - { linkedIssue.title }
                            </a>
                          </td>
                          <td style={ { whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center', width: '10px' } }>
                            { _.find(options.states || [], { id: linkedIssue.state }) ? <span className={ 'state-' +  _.find(options.states, { id: linkedIssue.state }).category  + '-label' }>{ _.find(options.states, { id: linkedIssue.state }).name }</span> : '-' }
                          </td>
                          <td style={ { verticalAlign: 'middle', width: '10px' } }>
                            { options.permissions && options.permissions.indexOf('link_issue') !== -1 ? <span className='remove-icon' onClick={ this.delLink.bind(this, { title: linkedIssue.title, id: val.id }) }><i className='fa fa-trash'></i></span> : '' }
                          </td>
                        </tr>); 
                      }) }
                      </tbody>
                    </Table>
                  </Col>
                </FormGroup> }
                { _.map(schema, (field, key) => {
                  if (field.key == 'title' || field.key == 'resolution' || field.key == 'priority' || field.key == 'assignee' || field.key == 'epic' || field.key == 'labels' || field.key == 'resolve_version') {
                    return;
                  }
                  if (field.type === 'File') {
                    if (options.permissions && options.permissions.indexOf('upload_file') === -1 && !data[field.key]) {
                      return;
                    }
                  } else if (_.isEmpty(data[field.key]) && !_.isNumber(data[field.key])) {
                    return;
                  }

                  let contents = '';
                  if (field.type === 'SingleUser') {
                    contents = data[field.key] && data[field.key].name || '-';
                  } else if (field.type === 'MultiUser') {
                    contents = _.map(data[field.key] || [], (v) => v.name).join(',');
                  } else if (field.type === 'Select' || field.type === 'RadioGroup' || field.type === 'SingleVersion') {
                    const optionValues = field.optionValues || [];
                    contents = _.find(optionValues, { id: data[field.key] }) ? _.find(optionValues, { id: data[field.key] }).name : '-';
                  } else if (field.type === 'MultiSelect' || field.type === 'CheckboxGroup' || field.type === 'MultiVersion') {
                    const optionValues = field.optionValues || [];
                    const values = !_.isArray(data[field.key]) ? data[field.key].split(',') : data[field.key];
                    const newValues = [];
                    _.map(values, (v, i) => {
                      if (_.find(optionValues, { id: v })) {
                        newValues.push(_.find(optionValues, { id: v }).name);
                      }
                    });
                    contents = newValues.join(',') || '-';
                  } else if (field.type === 'DatePicker') {
                    contents = moment.unix(data[field.key]).format('YYYY/MM/DD');
                  } else if (field.type === 'DateTimePicker') {
                    contents = moment.unix(data[field.key]).format('YYYY/MM/DD HH:mm');
                  } else if (field.type === 'File') {
                    const componentConfig = {
                      showFiletypeIcon: true,
                      postUrl: '/api/project/' + project.key + '/file?issue_id=' + data.id 
                    };
                    const djsConfig = {
                      parallelUploads: 1,
                      addRemoveLinks: false,
                      paramName: field.key,
                      maxFilesize: 50
                    };
                    const eventHandlers = {
                      init: dz => this.dropzone = dz,
                      success: (localfile, response) => { this.uploadSuccess(localfile, response); this.dropzone.removeFile(localfile); }
                    };

                    const imgFiles = _.filter(data[field.key], (f) => { return _.indexOf([ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ], f.type) !== -1 });
                    const noImgFiles = _.filter(data[field.key], (f) => { return _.indexOf([ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ], f.type) === -1 });
                    contents = (<div>
                      { noImgFiles.length > 0 &&
                        <Table condensed hover responsive>
                          <tbody>
                            { _.map(noImgFiles, (f, i) => 
                              <tr key={ i }>
                                <td>
                                  <span style={ { marginRight: '5px', color: '#777' } }><i className={ this.getFileIconCss(f.name) }></i></span> 
                                  { options.permissions && options.permissions.indexOf('download_file') !== -1 ? 
                                    <a href={ '/api/project/' + project.key + '/file/' + f.id } download={ f.name }>{ f.name }</a> :
                                    <span>{ f.name }</span> }
                                </td>
                                { options.permissions && options.permissions.indexOf('remove_file') !== -1 && 
                                  <td width='2%'>
                                    <span className='remove-icon' onClick={ this.delFileNotify.bind(this, field.key, f.id, f.name) }>
                                      <i className='fa fa-trash'></i>
                                    </span>
                                  </td> }
                              </tr> ) }
                          </tbody>
                        </Table> }

                      { imgFiles.length > 0 && 
                        <Grid style={ { paddingLeft: '0px' } }>
                          <Row>
                          { _.map(imgFiles, (f, i) =>
                            <Col sm={ 6 } key={ i }>
                              <div className='attachment-content'>
                                <div className='attachment-thumb' onClick={ this.openPreview.bind(this, i, field.key) }>
                                  <img src={  '/api/project/' + project.key + '/file/' + f.id + '/thumbnail' }/>
                                </div>
                                <div className='attachment-title-container'>
                                   <div className='attachment-title' title={ f.name }>{ f.name }</div>
                                   { options.permissions && options.permissions.indexOf('remove_file') !== -1 && <div className='remove-icon' onClick={ this.delFileNotify.bind(this, field.key, f.id, f.name) }><i className='fa fa-trash'></i></div> }
                                </div>
                              </div>
                            </Col> ) }
                          </Row>
                        </Grid> }
                      { options.permissions && options.permissions.indexOf('upload_file') !== -1 &&
                      <div style={ { marginTop: '8px' } }>
                        <DropzoneComponent 
                          config={ componentConfig } 
                          eventHandlers={ eventHandlers } 
                          djsConfig={ djsConfig } />
                      </div> }
                      { previewShow[field.key] &&
                        <Lightbox
                          mainSrc={  '/api/project/' + project.key + '/file/' + imgFiles[photoIndex].id }
                          nextSrc={  '/api/project/' + project.key + '/file/' + imgFiles[(photoIndex + 1) % imgFiles.length].id }
                          prevSrc={  '/api/project/' + project.key + '/file/' + imgFiles[(photoIndex + imgFiles.length - 1) % imgFiles.length].id }
                          imageTitle={ imgFiles[photoIndex].name }
                          imageCaption={ imgFiles[photoIndex].uploader.name + ' 上传于 ' + imgFiles[photoIndex].created_at }
                          onCloseRequest={ () => { this.state.previewShow[field.key] = false; this.setState({ previewShow: this.state.previewShow }) } }
                          onMovePrevRequest={ () => this.setState({ photoIndex: (photoIndex + imgFiles.length - 1) % imgFiles.length }) }
                          onMoveNextRequest={ () => this.setState({ photoIndex: (photoIndex + 1) % imgFiles.length }) } /> }
                    </div>);
                  } else if (field.type === 'TextArea') {
                    let txt = _.escape(data[field.key]);

                    const images = txt.match(/!\[file\]\(http(s)?:\/\/(.*?)\)((\r\n)|(\n))?/ig);
                    const imgFileUrls = [];
                    if (images) {
                      _.forEach(images, (v, i) => {
                        const imgurls = v.match(/http(s)?:\/\/([^\)]+)/ig); 
                        const pattern = new RegExp('^http[s]?:\/\/[^\/]+(.+)$');
                        if (pattern.exec(imgurls[0])) {
                          const imgurl = RegExp.$1;
                          txt = txt.replace(v, '<div><img class="inline-img" id="inlineimg-' + field.key + '-' + i + '" style="margin-bottom:5px; margin-right:10px;" src="' + imgurl + '/thumbnail"/></div>');
                          imgFileUrls.push(imgurl);
                        }
                      });
                      txt = txt.replace(/<\/div>(\s*?)<div>/ig, '');
                    }

                    const links = txt.match(/\[.*?\]\(.*?\)/ig);
                    if (links) {
                      _.forEach(links, (v, i) => {
                        const pattern = new RegExp('^\\[([^\\]]*)\\]\\(([^\\)]*)\\)$');
                        pattern.exec(v);
                        txt = txt.replace(v, '<a target=\'_blank\' href=\'' + RegExp.$2 + '\'>' + RegExp.$1 + '</a>');
                      });
                    }

                    contents = ( 
                      <div>
                        <div 
                          onClick={ this.previewInlineImg.bind(this) } 
                          style={ { whiteSpace: 'pre-wrap', wordWrap: 'break-word' } } 
                          dangerouslySetInnerHTML={ { __html: txt.replace(/(\r\n)|(\n)/g, '<br/>') } } /> 
                      { inlinePreviewShow[field.key] && 
                        <Lightbox
                          mainSrc={  imgFileUrls[photoIndex] }
                          nextSrc={  imgFileUrls[(photoIndex + 1) % imgFileUrls.length] }
                          prevSrc={  imgFileUrls[(photoIndex + imgFileUrls.length - 1) % imgFileUrls.length] }
                          imageTitle=''
                          imageCaption=''
                          onCloseRequest={ () => { this.state.inlinePreviewShow[field.key] = false; this.setState({ inlinePreviewShow: this.state.inlinePreviewShow }) } }
                          onMovePrevRequest={ () => this.setState({ photoIndex: (photoIndex + imgFileUrls.length - 1) % imgFileUrls.length }) }
                          onMoveNextRequest={ () => this.setState({ photoIndex: (photoIndex + 1) % imgFileUrls.length }) } /> }
                      </div>); 
                  } else {
                    contents = data[field.key];
                  }
                  return (
                    <FormGroup key={ 'form-' + key }>
                      <Col sm={ 3 } componentClass={ ControlLabel }>
                        { field.name || '-' }
                      </Col>
                      <Col sm={ 9 }>
                        <div style={ { marginTop: '7px' } }>
                          { contents }
                        </div>
                      </Col>
                    </FormGroup>
                  );
                }) }
              </Form>
            </Tab>
            <Tab eventKey={ 2 } title={ commentsTab }>
              <Comments 
                i18n={ i18n }
                currentTime={ options.current_time || 0 }
                currentUser={ user }
                project={ project } 
                permissions={ options.permissions || [] }
                issue_id={ data.id }
                collection={ commentsCollection } 
                indexComments={ indexComments } 
                sortComments={ sortComments } 
                indexLoading={ commentsIndexLoading } 
                loading={ commentsLoading } 
                users={ options.users || [] } 
                addComments={ addComments } 
                editComments={ editComments } 
                delComments={ delComments } 
                itemLoading={ commentsItemLoading }/>
            </Tab>
            <Tab eventKey={ 3 } title='改动纪录'>
              <History 
                issue_id={ data.id }
                currentTime={ options.current_time || 0 }
                currentUser={ user }
                collection={ historyCollection } 
                indexHistory={ indexHistory } 
                sortHistory={ sortHistory } 
                indexLoading={ historyIndexLoading } />
            </Tab>
            <Tab eventKey={ 4 } title={ worklogTab }>
              <Worklog 
                i18n={ i18n }
                currentTime={ options.current_time || 0 }
                currentUser={ user }
                permissions={ options.permissions || [] }
                issue={ data }
                original_estimate = { data.original_estimate }
                options={ options.timetrack || {} }
                collection={ worklogCollection } 
                indexWorklog={ indexWorklog } 
                sort={ worklogSort }
                sortWorklog={ sortWorklog } 
                indexLoading={ worklogIndexLoading } 
                loading={ worklogLoading }
                addWorklog={ addWorklog } 
                editWorklog={ editWorklog } 
                delWorklog={ delWorklog } />
            </Tab>
            { data.gitcommits_num > 0 &&
            <Tab eventKey={ 5 } title={ gitTab }>
              <GitCommits
                issue_id={ data.id }
                currentTime={ options.current_time || 0 }
                currentUser={ user }
                collection={ gitCommitsCollection }
                indexGitCommits={ indexGitCommits }
                sortGitCommits={ sortGitCommits }
                indexLoading={ gitCommitsIndexLoading } />
            </Tab> }
          </Tabs>
        </div>
        { delFileShow && 
          <DelFileModal 
            show 
            close={ this.delFileModalClose } 
            del={ delFile } 
            data={ selectedFile } 
            loading={ fileLoading }
            i18n={ i18n }/> }
        { this.state.editModalShow && 
          <CreateModal 
            show 
            close={ this.editModalClose.bind(this) } 
            options={ options } 
            edit={ edit } 
            loading={ loading } 
            project={ project } 
            data={ data } 
            isSubtask={ data.parent_id && true }
            addLabels={ addLabels }
            i18n={ i18n }/> }
        { this.state.workflowScreenShow &&
          <CreateModal 
            show
            close={ this.workflowScreenModalClose.bind(this) }
            options={ options }
            edit={ edit }
            loading={ loading }
            project={ project }
            data={ data }
            action_id={ action_id  }
            doAction={ doAction }
            isFromWorkflow={ true }
            i18n={ i18n }/> }
        { this.state.workflowCommentsShow &&
          <WorkflowCommentsModal 
            show
            close={ this.workflowCommentsModalClose.bind(this) }
            data={ data }
            action_id={ action_id  }
            doAction={ doAction }/> }
        { this.state.createSubtaskModalShow && 
          <CreateModal 
            show 
            close={ this.createSubtaskModalClose.bind(this) } 
            options={ options } 
            create={ create } 
            loading={ loading } 
            project={ project } 
            parent_id={ data.id } 
            isSubtask={ true }
            i18n={ i18n }/> }
        { this.state.previewModalShow && 
          <PreviewModal 
            show 
            close={ () => { this.setState({ previewModalShow: false }); } } 
            state={ data.state }
            collection={ wfCollection } /> }
        { this.state.linkIssueModalShow && 
          <LinkIssueModal 
            show 
            close={ () => { this.setState({ linkIssueModalShow: false }); } } 
            loading={ linkLoading } 
            createLink={ createLink } 
            issue={ data } 
            types={ options.types } 
            project={ project }
            i18n={ i18n }/> }
        { this.state.delLinkModalShow && 
          <DelLinkModal 
            show 
            close={ () => { this.setState({ delLinkModalShow: false }); } } 
            loading={ linkLoading } 
            delLink={ delLink } 
            data={ this.state.delLinkData }
            i18n={ i18n }/> }
        { this.state.convertTypeModalShow &&
          <ConvertTypeModal 
            show
            close={ () => { this.setState({ convertTypeModalShow: false }); } }
            options={ options }
            convert={ convert }
            loading={ loading }
            issue={ data }
            i18n={ i18n }/> }
        { this.state.convertType2ModalShow &&
          <ConvertType2Modal 
            show
            close={ () => { this.setState({ convertType2ModalShow: false }); } }
            options={ options }
            project={ project }
            convert={ convert }
            loading={ loading }
            issue={ data }
            i18n={ i18n }/> }
        { this.state.moveModalShow &&
          <MoveModal 
            show
            close={ () => { this.setState({ moveModalShow: false }); } }
            options={ options }
            project={ project }
            move={ move }
            loading={ loading }
            issue={ data }
            i18n={ i18n }/> }
        { this.state.assignModalShow &&
          <AssignModal 
            show
            close={ () => { this.setState({ assignModalShow: false }); } }
            options={ options }
            setAssignee={ setAssignee }
            issue={ data }
            i18n={ i18n }/> }
        { this.state.setLabelsModalShow &&
          <SetLabelsModal 
            show
            close={ () => { this.setState({ setLabelsModalShow: false }); } }
            options={ options }
            setLabels={ setLabels }
            addLabels={ addLabels }
            issue={ data }
            i18n={ i18n }/> }
        { this.state.shareModalShow &&
          <ShareLinkModal 
            show
            project={ project }
            close={ () => { this.setState({ shareModalShow: false }); } }
            issue={ data }/> }
        { this.state.resetModalShow &&
          <ResetStateModal 
            show
            close={ () => { this.setState({ resetModalShow: false }); } }
            resetState={ resetState }
            loading={ itemLoading }
            issue={ data }
            i18n={ i18n }/> }
        { this.state.delNotifyShow &&
          <DelNotify 
            show
            close={ () => { this.setState({ delNotifyShow: false }) } }
            data={ data }
            del={ del }
            detailClose={ close }
            i18n={ i18n }/> }
        { this.state.copyModalShow &&
          <CopyModal 
            show
            close={ () => { this.setState({ copyModalShow: false }); } }
            loading={ loading }
            copy={ copy }
            data={ data }
            i18n={ i18n }/> }
        { this.state.watchersModalShow &&
          <WatcherListModal 
            show
            close={ () => { this.setState({ watchersModalShow: false }); } }
            issue_no={ data.no }
            watchers={ data.watchers || [] }
            i18n={ i18n }/> }
      </div>
    );
  }
}
