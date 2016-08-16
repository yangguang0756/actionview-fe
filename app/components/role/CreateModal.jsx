import React, { PropTypes, Component } from 'react';
import { reduxForm } from 'redux-form';
import { Modal, Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import Select from 'react-select';
import _ from 'lodash';
import ApiClient from '../../../shared/api-client';

const img = require('../../assets/images/loading.gif');
const allPermissions = require('../share/Permissions.js');

const validate = (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = 'Required';
  }
  return errors;
};

@reduxForm({
  form: 'state',
  fields: ['name', 'description', 'permissions', 'users'],
  validate
})
export default class CreateModal extends Component {
  constructor(props) {
    super(props);
    this.state = { ecode: 0 };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.searchUsers = this.searchUsers.bind(this);
  }

  static propTypes = {
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    values: PropTypes.object,
    fields: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired
  }

  async handleSubmit() {
    const { values, create, close } = this.props;
    if (values.permissions)
    {
      values.permissions = _.map(values.permissions, _.iteratee('value'));
    }
    if (values.users)
    {
      values.users = _.map(values.users, _.iteratee('value'));
    }
    const ecode = await create(values);
    if (ecode === 0) {
      this.setState({ ecode: 0 });
      close();
    } else {
      this.setState({ ecode: ecode });
    }
  }

  handleCancel() {
    const { close, submitting } = this.props;
    if (submitting) {
      return;
    }
    this.setState({ ecode: 0 });
    close();
  }

  async searchUsers(input) {
    input = input.toLowerCase();
    if (!input)
    {
      return { options: [] };
    }
    const api = new ApiClient;
    const results = await api.request( { url: '/user?s=' + input } ); 
    return { options: results.data };
  }

  render() {
    const { fields: { name, description, permissions, users }, handleSubmit, invalid, submitting } = this.props;

    return (
      <Modal { ...this.props } onHide={ this.handleCancel } backdrop='static' aria-labelledby='contained-modal-title-sm'>
        <Modal.Header closeButton style={ { background: '#f0f0f0' } }>
          <Modal.Title id='contained-modal-title-la'>创建新角色</Modal.Title>
        </Modal.Header>
        <form onSubmit={ handleSubmit(this.handleSubmit) }>
        <Modal.Body className={ submitting ? 'disable' : 'enable' }>
          <FormGroup controlId='formControlsText'>
            <ControlLabel>角色名</ControlLabel>
            <FormControl type='text' { ...name } placeholder='角色名'/>
          </FormGroup>
          <FormGroup controlId='formControlsSelect'>
            <ControlLabel>权限集</ControlLabel>
            <Select clearable={ false } searchable={ false } options={ _.map(allPermissions, function(v) { return { value: v.id, label: v.name }; }) } value={ permissions.value } onChange={ newValue => { permissions.onChange(newValue) } } placeholder='请选择权限' multi/>
          </FormGroup>
          <FormGroup controlId='formControlsSelect'>
            <ControlLabel>用户</ControlLabel>
            <Select.Async clearable={ false } value={ users.value } onChange={ newValue => { users.onChange(newValue) } } loadOptions={ this.searchUsers } valueKey='id' labelKey='name' placeholder='请输入用户' multi/>
          </FormGroup>
          <FormGroup controlId='formControlsText'>
            <ControlLabel>描述</ControlLabel>
            <FormControl type='text' { ...description } placeholder='描述'/>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <span className='ralign'>{ this.state.ecode !== 0 && !submitting && 'aaaa' }</span>
          <image src={ img } className={ submitting ? 'loading' : 'hide' }/>
          <Button className='ralign' disabled={ submitting || invalid } type='submit'>确定</Button>
          <Button disabled={ submitting } onClick={ this.handleCancel }>取消</Button>
        </Modal.Footer>
        </form>
      </Modal>
    );
  }
}