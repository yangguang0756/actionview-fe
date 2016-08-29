import React, { PropTypes, Component } from 'react';
import { reduxForm } from 'redux-form';
import { Modal, Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import Select from 'react-select';
import Tabs, { TabPane } from 'rc-tabs';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import { findDOMNode } from 'react-dom';
import _ from 'lodash';

const img = require('../../assets/images/loading.gif');

const CONDITION_FUNCTIONS = {
  isReporter: { name: 'App\\Workflow\\Util@isReporter' },
  isAssignee: { name: 'App\\Workflow\\Util@isAssignee' },
  checkSubTasksState: { name: 'App\\Workflow\\Util@checkSubTasksState', args: [ 'stateParam' ] },
  hasPermission: { name: 'App\\Workflow\\Util@hasPermission', args: [ 'permissionParam' ] },
  belongsToRole: { name: 'App\\Workflow\\Util@belongsToRole', args: [ 'roleParam' ] }
};

const POST_FUNCTIONS = {
  setResolution: { name : 'App\\Workflow\\Util@setResolution', args: [ 'resolutionParam' ], sn: 1 },
  setState: { name : 'App\\Workflow\\Util@setState', sn: 2 },
  assignIssue: { name : 'App\\Workflow\\Util@assignIssue', args: [ 'assigneeParam' ], sn: 3 },
  addComments: { name : 'App\\Workflow\\Util@addComments', sn: 4 },
  updateHistory: { name : 'App\\Workflow\\Util@updateHistory', sn: 5 },
  triggerEvent: { name : 'App\\Workflow\\Util@triggerEvent', args: [ 'eventParam' ], sn: 6 }
};

const validate = (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = 'Required';
  }
  if (!values.destStep) {
    errors.name = 'Required';
  }
  if (!values.screen) {
    errors.name = 'Required';
  }
  return errors;
};

@reduxForm({
  form: 'wfconfig',
  fields: [ 'id', 'name', 'destStep', 'screen' ],
  validate
})
export default class AddActionModal extends Component {
  constructor(props) {
    super(props);

    this.state = { activeKey: '1', conditions: [], postFunctions: [], relation: '', stateParam: '', permissionParam: '', roleParam:'', resolutionParam: '', assigneeParam: '', eventParam: '' };

    const state = this.state;
    const { data } = props;
    if (!_.isEmpty(data))
    {
      if (data.restrict_to && data.restrict_to.conditions && data.restrict_to.conditions.list.length > 0)
      {
        this.state.conditions = _.map(data.restrict_to.conditions.list, function(value) { 
          value.args && _.assign(state, value.args);
          return _.findKey(CONDITION_FUNCTIONS, { name: value.name });
        });
        this.state.relation = data.restrict_to.conditions.type || 'and';
      }

      if (data.post_functions && data.post_functions.length > 0)
      {
        this.state.postFunctions = _.map(data.post_functions, function(value) { 
          value.args && _.assign(state, value.args);
          return _.findKey(POST_FUNCTIONS, { name: value.name });
        });
      }
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  static propTypes = {
    options: PropTypes.object,
    data: PropTypes.object,
    stepData: PropTypes.object,
    steps: PropTypes.array,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    values: PropTypes.object,
    fields: PropTypes.object,
    initializeForm: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired
  }

  handleSubmit() {
    const { values, create, edit, close, stepData } = this.props;

    const addedAction = {};
    addedAction.id = values.id;
    addedAction.name = values.name;
    addedAction.screen = values.screen;
    addedAction.results = [ { step: values.destStep, old_status: 'Finished', status: 'Underway' } ];

    const postFunctions = [];
    const postFuncsLength = this.state.postFunctions.length;
    for (let i = 0; i < postFuncsLength; i++)
    {
      const funcKey = this.state.postFunctions[i];
      const funcArgs = {};
      const argsLength = POST_FUNCTIONS[funcKey].args ? POST_FUNCTIONS[funcKey].args.length : 0;
      let validFlag = 1;
      for (let j = 0; j < argsLength; j++) 
      {
        const arg = (POST_FUNCTIONS[funcKey].args)[j];
        if (!this.state[arg])
        {
          validFlag = 0;
          break;
        }
        funcArgs[arg] = this.state[arg];
      }

      if (validFlag === 1)
      {
        argsLength > 0 ?
          postFunctions.push({ name: POST_FUNCTIONS[funcKey].name, args: funcArgs, sn: POST_FUNCTIONS[funcKey].sn }) :
          postFunctions.push({ name: POST_FUNCTIONS[funcKey].name, sn: POST_FUNCTIONS[funcKey].sn })
      }
    }
    if (postFunctions.length > 0)
    {
      addedAction.post_functions = _.map(_.sortBy(postFunctions, 'sn'), function(value) { return _.pick(value, ['name', 'args']); });
    }

    const restrictConditions = [];
    const restrictCondLength = this.state.conditions.length;
    for (let i = 0; i < restrictCondLength; i++)
    {
      const condKey = this.state.conditions[i];
      const condArgs = {};
      let validFlag = 1;
      const argsLength = CONDITION_FUNCTIONS[condKey].args ? CONDITION_FUNCTIONS[condKey].args.length : 0;
      for (let j = 0; j < argsLength; j++)
      {
        const arg = (CONDITION_FUNCTIONS[condKey].args)[j];
        if (!this.state[arg])
        {
          validFlag = 0;
          break;
        }
        condArgs[arg] = this.state[arg];
      }

      if (validFlag === 1)
      {
        argsLength > 0 ?
          restrictConditions.push({ name: CONDITION_FUNCTIONS[condKey].name, args: condArgs }) :
          restrictConditions.push({ name: CONDITION_FUNCTIONS[condKey].name })
      }
    }

    if (restrictConditions.length > 0)
    {
      addedAction.restrict_to = { conditions: { type: this.state.relation ? this.state.relation : 'and', list: restrictConditions } };
    }

    //alert(JSON.stringify(addedAction));
    //return;

    values.id ? edit(stepData.id, addedAction) : create(stepData.id, addedAction);
    close();
  }

  handleCancel() {
    const { close, submitting } = this.props;
    if (submitting) {
      return;
    }
    close();
  }

  componentWillMount() {
    const { initializeForm, data } = this.props;
    const basicData = {};
    if (!_.isEmpty(data))
    {
      basicData.id = data.id;
      basicData.name = data.name;
      basicData.destStep = data.results[0].step;
      basicData.screen = data.screen;
    }
    else
    {
      basicData.id = '';
      basicData.name = '';
      basicData.destStep = '';
      basicData.screen = '';
    }
    initializeForm(basicData);
  }

  onTabClick(key) {
    if (key === this.state.activeKey) 
    {
      this.setState({ activeKey: '' });
    }
  }

  onTabChange(activeKey) {
    this.setState({ activeKey });
  }

  conditionsChanged(newConditions) {
    this.setState({
      conditions: newConditions
    });
  }

  postFunctionsChanged(newFunctions) {
    this.setState({
      postFunctions: newFunctions
    });
  }

  render() {
    // const { fields: { name, destStep, screen, relation, stateParam, permissionParam, roleParam, resolutionParam, assigneeParam, eventParam }, options, steps, stepData, handleSubmit, invalid, submitting } = this.props;
    const { fields: { id, name, destStep, screen }, options, steps, stepData, handleSubmit, invalid, submitting } = this.props;
    const stepOptions = _.map(steps, (val) => { return { label: val.name, value: val.id } });
    stepOptions.splice(_.findIndex(steps, { id: stepData.id }), 1);

    const screenOptions = _.map(options.screens, (val) => { return { label: val.name, value: val.id } });
    screenOptions.unshift( { label: '不显示页面', value: '-1' } );;

    const relationOptions = [{ label: '必须全部满足', value: 'and' }, { label: '满足任何一个即可', value: 'or' }];
    const assigneeOptions = [ { id: 'whoami', name: '当前用户' }, { id: 'reporter', name: '报告人' }, { id: 'principal', name: '项目负责人' } ];
    const eventOptions = [ { id: 'normal', name: '一般事件' } ];

    const stateOptions = options.states || [];
    const permissionOptions = options.permissions || [];
    const roleOptions = options.roles || [];
    const resolutionOptions = options.resolutions || [];

    const selectEnableStyles = { width: '125px', marginLeft: '10px', backgroundColor: '#ffffff', borderRadius: '4px' }; 
    const selectDisabledStyles = { width: '125px', marginLeft: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }; 

    return (
      <Modal { ...this.props } onHide={ this.handleCancel } backdrop='static' aria-labelledby='contained-modal-title-sm'>
        <Modal.Header closeButton style={ { background: '#f0f0f0', height: '50px' } }>
          <Modal.Title id='contained-modal-title-la'>添加动作</Modal.Title>
        </Modal.Header>
        <form onSubmit={ handleSubmit(this.handleSubmit) }>
        <Modal.Body className={ submitting ? 'disable' : 'enable' } style={ { height: '450px' } }>
          <FormControl type='hidden' { ...id }/>
          <Tabs
            activeKey={ this.state.activeKey }
            onTabClick={ this.onTabClick.bind(this) } 
            onChange={ this.onTabChange.bind(this) } >
            <TabPane tab='基本' key='1'>
              <div style={ { paddingTop: '15px' } }>
                <FormGroup controlId='formControlsText'>
                  <ControlLabel>原步骤</ControlLabel>
                  <FormControl type='text' value={ stepData.name } disabled={ true }/>
                </FormGroup>
                <FormGroup controlId='formControlsText'>
                  <ControlLabel>动作名</ControlLabel>
                  <FormControl type='text' { ...name } placeholder='动作名'/>
                </FormGroup>
                <FormGroup controlId='formControlsText'>
                  <ControlLabel>目标步骤</ControlLabel>
                  <Select options={ stepOptions } simpleValue value={ destStep.value } onChange={ newValue => { destStep.onChange(newValue) } } placeholder='请选择目标步骤' clearable={ false } searchable={ false }/>
                </FormGroup>
                <FormGroup controlId='formControlsText'>
                  <ControlLabel>动作界面</ControlLabel>
                  <Select options={ screenOptions } simpleValue value={ screen.value } onChange={ newValue => { screen.onChange(newValue) } } placeholder='请选择界面' clearable={ false } searchable={ false }/>
                </FormGroup>
              </div>
            </TabPane>
            <TabPane tab='触发条件' key='2'>
              <div style={ { paddingTop: '25px', paddingBottom: '25px' } }>
                <Select options={ relationOptions } simpleValue value={ this.state.relation } onChange={ newValue => { this.setState({ relation: newValue }) } } placeholder='条件关系' clearable={ false } searchable={ false }/>
              </div>
              <ui className='list-unstyled clearfix cond-list'>
                <CheckboxGroup name='conditions' value={ this.state.conditions } onChange={ this.conditionsChanged.bind(this) }>
                  <li>
                    <Checkbox value='isReporter'/>
                    <span>只有</span><b>报告人</b><span>才能执行此动作</span>
                  </li>
                  <li>
                    <Checkbox value='isAssignee'/>
                    <span>只有</span><b>经办人</b><span>才能执行此动作</span>
                  </li>
                  <li>
                    <Checkbox value='checkSubTasksState'/>
                    <span>根据子任务状态</span>
                    <select 
                      value={ this.state.stateParam }
                      onChange={ (e) => this.setState({ stateParam: e.target.value }) }
                      disabled={ _.indexOf(this.state.conditions, 'checkSubTasksState') !== -1 ? false : true } 
                      style={ _.indexOf(this.state.conditions, 'checkSubTasksState') !== -1 ? selectEnableStyles : selectDisabledStyles }> 
                      <option value='' key=''>请选择状态</option>
                      { stateOptions.map( stateOption => <option value={ stateOption.id } key={ stateOption.id }>{ stateOption.name }</option> ) }
                    </select>
                    <span>限制父任务动作</span>
                  </li>
                  <li>
                    <Checkbox value='hasPermission'/>
                    <span>只有具有权限</span>
                    <select 
                      value={ this.state.permissionParam }
                      onChange={ (e) => this.setState({ permissionParam: e.target.value }) }
                      disabled={ _.indexOf(this.state.conditions, 'hasPermission') !== -1 ? false : true }
                      style={ _.indexOf(this.state.conditions, 'hasPermission') !== -1 ? selectEnableStyles : selectDisabledStyles }>
                      <option value='' key=''>请选择权限</option>
                      { permissionOptions.map( permissionOption => <option value={ permissionOption.id } key={ permissionOption.id }>{ permissionOption.name }</option> ) }
                    </select>
                    <span>的用户才能执行此动作</span>
                  </li>
                  <li>
                    <Checkbox value='belongsToRole'/>
                    <span>只有属于项目角色</span>
                    <select
                      value={ this.state.roleParam }
                      onChange={ (e) => this.setState({ roleParam: e.target.value }) }
                      disabled={ _.indexOf(this.state.conditions, 'belongsToRole') !== -1 ? false : true }
                      style={ _.indexOf(this.state.conditions, 'belongsToRole') !== -1 ? selectEnableStyles : selectDisabledStyles }> 
                      <option value='' key=''>请选择角色</option>
                      { roleOptions.map( roleOption => <option value={ roleOption.id } key={ roleOption.id }>{ roleOption.name }</option> ) }
                    </select>
                    <span>的成员才能执行此动作</span>
                  </li>
                </CheckboxGroup>
              </ui>
            </TabPane>
            <TabPane tab='结果处理' key='3'>
              <div style={ { paddingTop: '25px', paddingBottom: '25px' } }>
                <span><b>发生转变之后下面功能将被执行</b></span>
              </div>
              <ui className='list-unstyled clearfix cond-list'>
                <CheckboxGroup name='postFunctions' value={ this.state.postFunctions } onChange={ this.postFunctionsChanged.bind(this) }>
                  <li>
                    <Checkbox value='setResolution'/>
                    <span>问题的</span><b>解决结果</b><span>将被设置为</span>
                    <select
                      value={ this.state.resolutionParam }
                      onChange={ (e) => this.setState({ resolutionParam: e.target.newValue }) }
                      disabled={ _.indexOf(this.state.postFunctions, 'setResolution') !== -1 ? false : true }
                      style={ _.indexOf(this.state.postFunctions, 'setResolution') !== -1 ? selectEnableStyles : selectDisabledStyles }> 
                      <option value='' key=''>请选择结果值</option>
                      { resolutionOptions.map( resolutionOption => <option value={ resolutionOption.id } key={ resolutionOption.id }>{ resolutionOption.name }</option> ) }
                    </select>
                  </li>
                  <li>
                    <Checkbox value='setState'/>
                    <span>将状态设置为目标步骤链接的状态</span>
                  </li>
                  <li>
                    <Checkbox value='assignIssue'/>
                    <span>将问题分配给</span>
                    <select
                      value={ this.state.assigneeParam }
                      onChange={ (e) => this.setState({ assigneeParam: e.target.value }) }
                      disabled={ _.indexOf(this.state.postFunctions, 'assignIssue') !== -1 ? false : true }
                      style={ _.indexOf(this.state.postFunctions, 'assignIssue') !== -1 ? selectEnableStyles : selectDisabledStyles }> 
                      <option value='' key=''>请选择经办人</option>
                      { assigneeOptions.map( assigneeOption => <option value={ assigneeOption.id } key={ assigneeOption.id }>{ assigneeOption.name }</option> ) }
                    </select>
                  </li>
                  <li>
                    <Checkbox value='addComments'/>
                    <span>如果用户输入了备注，将备注添加到问题中</span>
                  </li>
                  <li>
                    <Checkbox value='updateHistory'/>
                    <span>更新问题的变动历史记录</span>
                  </li>
                  <li>
                    <Checkbox value='triggerEvent'/>
                    <span>过程结束后触发</span>
                    <select
                      value={ this.state.eventParam }
                      onChange={ (e) => this.setState({ eventParam: e.target.value }) }
                      disabled={ _.indexOf(this.state.postFunctions, 'triggerEvent') !== -1 ? false : true }
                      style={ _.indexOf(this.state.postFunctions, 'triggerEvent') !== -1 ? selectEnableStyles : selectDisabledStyles }> 
                      <option value='' key=''>请选择事件</option>
                      { eventOptions.map( eventOption => <option value={ eventOption.id } key={ eventOption.id }>{ eventOption.name }</option> ) }
                    </select>
                    <span>事件(待开发)</span>
                  </li>
                </CheckboxGroup>
              </ui>
            </TabPane>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button className='ralign' disabled={ submitting || invalid } type='submit'>确定</Button>
          <Button disabled={ submitting } onClick={ this.handleCancel }>取消</Button>
        </Modal.Footer>
        </form>
      </Modal>
    );
  }
}