import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { Button, Label, Table, Panel } from 'react-bootstrap';
import { notify } from 'react-notify-toast';
import _ from 'lodash';

const img = require('../../assets/images/loading.gif');

export default class List extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    project: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    index: PropTypes.func.isRequired
  }

  componentWillMount() {
    const { index } = this.props;
    index();
  }

  render() {

    const { project, data, loading } = this.props;

    const issueTitle = (
      <div className='report-list-header'>
        <span><i className='fa fa-pie-chart'></i> 问题分布图</span>
        <span className='report-button report-edit-button' onClick={ () => { } } title='编辑'><i className='fa fa-pencil'></i></span>
        <span className='report-button report-edit-button' onClick={ () => { } } title='重置'><i className='fa fa-repeat'></i></span>
      </div>);
    const trendTitle = (<span><i className='fa fa-line-chart'></i> 问题趋势图</span>)
    const worklogTitle = (<span><i className='fa fa-bar-chart'></i> 人员工作日志报告</span>)
    const trackTitle = (<span><i className='fa fa-clock-o'></i> 时间跟踪报告</span>)
    const compareTitle = (<span><i className='fa fa-area-chart'></i> 创建问题和解决问题对比报告</span>)
    const othersTitle = (<span><i className='fa fa-bar-chart'></i> 其它报表</span>)

    return ( loading ?
      <div style={ { marginTop: '30px' } }>
        <div className='detail-view-blanket' style={ { display: loading ? 'block' : 'none' } }>
          <img src={ img } className='loading'/>
        </div>
      </div>
      :
      <div style={ { marginTop: '15px', marginBottom: '30px' } } className='report-container'>
        <Panel header={ issueTitle }>
          <Table responsive bordered={ false }>
            <thead>
              <tr>
                <td>aa</td>
                <td>bb</td>
                <td>bb</td>
                <td>bb</td>
              </tr>
            </thead>
          </Table>
        </Panel>
        <Panel header={ trendTitle }>
          <Table responsive>
            <thead><tr>
              <td>aa</td>
              <td>bb</td>
              <td>bb</td>
              <td>bb</td>
            </tr></thead>
          </Table>
        </Panel>
        <Panel header={ worklogTitle }>
          <Table responsive hover>
            <thead><tr>
              <td><Link to={ '/project/' + project.key + '/report/worklog' }>全部日志</Link></td>
              <td><Link to={ '/project/' + project.key + '/report/worklog?recorded_at=2w' }>最近两周的</Link></td>
              <td><Link to={ '/project/' + project.key + '/report/worklog?recorded_at=1m' }>最近一个月的</Link></td>
              <td></td>
            </tr></thead>
          </Table>
        </Panel>
        <Panel header={ trackTitle }>
          <Table responsive hover>
            <thead><tr>
              <td>aa</td>
              <td>bb</td>
              <td>bb</td>
              <td>bb</td>
            </tr></thead>
          </Table>
        </Panel>
        <Panel header={ compareTitle }>
          <Table responsive hover>
            <thead><tr>
              <td>aa</td>
              <td>bb</td>
              <td>bb</td>
              <td>bb</td>
            </tr></thead>
          </Table>
        </Panel>
        <Panel header={ othersTitle }>
          <Table responsive hover>
            <thead><tr>
              <td>延误率延误率延误率延误率延误率延误率延误率延误率延误率延误率延误率</td>
              <td>完成率</td>
              <td>bb</td>
              <td>bb</td>
            </tr></thead>
          </Table>
        </Panel>
      </div>
    );
  }
}
