import React, { Component } from 'react'
import { withRouter } from "react-router-dom";
import { Table, Switch, Space, PageHeader, message, Modal } from 'antd';

import * as AJAX from '../../util/Ajax'
import '../common/Common.css'
import * as PaperStateEnum from '../../enum/PaperStateEnum'

class PaperList extends Component {

  constructor(props) {
        super(props)
        this.state = {
            data: null,
            deletePaper: null,
        }
  }

    componentDidMount() {
        this.getPaperListRequest()
    }

    getPaperListRequest() {
        AJAX.GET('/exam/paper/get', (res) => {
            this.setState({
                data: res.data.object,
                deletePaper: null,
            })
        }, this.props.history)
    }

    deletePaperRequest() {
        AJAX.DELETE('/exam/paper/delete?paperId=' + this.state.deletePaper.id, (res) => {
            message.success('删除成功！')
            this.getPaperListRequest()
        }, this.props.history)
    }


    columns = [
        { title: '试卷标题', dataIndex: 'title', key: 'title' },
        { title: '代码', dataIndex: 'code', key: 'code' },
        { title: '试卷状态', dataIndex: 'state', key: 'state', 
            render: (state, record) => {
                let isChecked, checkedName, unCheckedName
                if (state === PaperStateEnum.CREATING) {
                    isChecked = false
                    unCheckedName = "创建中"
                    checkedName = "允许作答"
                } else if (state === PaperStateEnum.READY_TO_ANSWERING) {
                    isChecked = true
                    unCheckedName = "创建中"
                    checkedName = "允许作答"
                } else if (state === PaperStateEnum.ANSWERING) {
                    isChecked = true
                    checkedName = "作答中"
                    unCheckedName = "停止作答"
                } else {
                    isChecked = false
                    checkedName = "作答中"
                    unCheckedName = "停止作答"
                }
                return (
                    <Switch checkedChildren={checkedName} unCheckedChildren={unCheckedName}
                        defaultChecked={isChecked}
                        onChange={(checked, event) => {
                            let newState
                            if (state === PaperStateEnum.CREATING || state === PaperStateEnum.READY_TO_ANSWERING) {
                                if (!checked) {
                                    newState = PaperStateEnum.CREATING
                                } else {
                                    newState = PaperStateEnum.READY_TO_ANSWERING
                                }
                            } else {
                                if (!checked) {
                                    newState = PaperStateEnum.END_ANSWER
                                } else {
                                    newState = PaperStateEnum.ANSWERING
                                }
                            }
                            AJAX.POST('/exam/paper/changeState', {
                                paperId: record.id,
                                state: newState
                            }, (res) => {
                                message.success('变更成功！')
                                this.getPaperListRequest()
                            }, this.props.history)
                        }}
                    />
                );
            },
        },
        { title: '动作', key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <a onClick={() => {
                        this.props.history.push({
                            pathname: '/editPaper',
                            paperId: record.id
                        })
                    }}>编辑试题</a>
                    <a onClick={() => {
                        this.setState({
                            deletePaper: record
                        })
                    }}>删除</a>
                    {
                        record.state === PaperStateEnum.END_ANSWER? (
                            <a
                                href={'/exam/export/exportPaper?paperId=' + record.id}
                                download={record.title}
                            >导出</a>
                        ) : null
                    }
                </Space>
            ),
        },
    ];

    render() {
        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    onBack={() => this.props.history.goBack()}
                    title="管理试卷"
                />
                <div className="component-content" >
                    <Table columns={this.columns} dataSource={this.state.data} pagination={false} />
                </div>
                <Modal
                    title={'删除试卷'}
                    visible={this.state.deletePaper != null}
                    onOk={e => { this.deletePaperRequest() }}
                    onCancel={() => {
                        this.setState({
                            deletePaper: null,
                        })
                    }}
                    okText="确认删除"
                    cancelText="取消"
                >
                    <p>您确定要删除此试卷？删除后将不可恢复！</p>
                </Modal>
            </div>
        )
    }
}

export default withRouter(PaperList)