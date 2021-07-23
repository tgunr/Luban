import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import api from '../../../api';
// import { CONNECTION_TYPE_WIFI, WORKFLOW_STATUS_IDLE } from '../../../constants';
import i18n from '../../../lib/i18n';
import WarningModal from '../../../lib/modal-warning';
import Modal from '../../components/Modal';
import Space from '../../components/Space';

import { actions } from '../../../flux/laser';
import ExtractSquareTrace from './ExtractSquareTrace';
// import ManualCalibration from './ManualCalibration';

const PANEL_EXTRACT_TRACE = 1;
const PANEL_NOT_CALIBRATION = 3;
const iconSrc = 'images/camera-aid/ic_warning-64x64.png';

class SetBackground extends PureComponent {
    static propTypes = {
        // isConnected: PropTypes.bool.isRequired,
        // workflowStatus: PropTypes.string.isRequired,
        // connectionType: PropTypes.string.isRequired,
        // hasBackground: PropTypes.bool.isRequired,
        // workPosition: PropTypes.object,
        server: PropTypes.object.isRequired,

        // redux
        hideModal: PropTypes.func.isRequired,
        size: PropTypes.object.isRequired,
        setBackgroundImage: PropTypes.func.isRequired
    };

    state = {
        canTakePhoto: true,
        xSize: [],
        ySize: [],
        lastFileNames: [],
        showCalibrationModal: true,
        panel: PANEL_EXTRACT_TRACE
    };

    actions = {
        showModal: async () => {
            const resPro = await api.getCameraCalibration({ 'address': this.props.server.address });
            if (!('res' in resPro.body) || !('points' in JSON.parse(resPro.body.res.text))) {
                this.setState({
                    panel: PANEL_NOT_CALIBRATION
                });
            } else {
                this.setState({
                    panel: PANEL_EXTRACT_TRACE
                });
            }
        },
        changeLastFileNames: (lastFileNames) => {
            this.setState({
                lastFileNames: lastFileNames
            });
        },
        updateEachPicSize: (size, value) => {
            this.setState({
                size: value
            });
        },
        changeCanTakePhoto: (bool) => {
            this.setState({
                canTakePhoto: bool
            });
        },
        updateAffinePoints: (manualPoints) => {
            this.setState({
                manualPoints
            });
        },
        hideModal: () => {
            if (!this.state.canTakePhoto && this.state.panel === PANEL_EXTRACT_TRACE) {
                WarningModal({
                    body: i18n._('This action cannot be undone. Are you sure you want to stop the job?'),
                    iconSrc,
                    bodyTitle: i18n._('Warning'),
                    insideHideModal: this.props.hideModal
                });
            } else {
                this.props.hideModal();
            }
        },
        setBackgroundImage: (filename) => {
            const { size } = this.props;
            this.props.setBackgroundImage(filename, size.x, size.y, 0, 0);

            this.actions.hideModal();
        }

    };

    componentDidMount() {
    }


    render() {
        const state = { ...this.state };
        // const { connectionType, isConnected, workflowStatus } = this.props;
        // const canCameraCapture = workflowStatus === WORKFLOW_STATUS_IDLE;
        return (
            <React.Fragment>
                <div>
                    <ExtractSquareTrace
                        canTakePhoto={this.state.canTakePhoto}
                        changeCanTakePhoto={this.actions.changeCanTakePhoto}
                        ySize={this.state.ySize}
                        xSize={this.state.xSize}
                        hideModal={this.actions.hideModal}
                        lastFileNames={this.state.lastFileNames}
                        updateEachPicSize={this.actions.updateEachPicSize}
                        changeLastFileNames={this.actions.changeLastFileNames}
                        setBackgroundImage={this.actions.setBackgroundImage}
                        updateAffinePoints={this.actions.updateAffinePoints}
                    />

                    {state.panel === PANEL_NOT_CALIBRATION && (
                        <Modal style={{ paddingBottom: '10px' }} size="lg" onClose={this.actions.hideModal}>
                            <Modal.Header>
                                {/* <Modal.Title> */}
                                {i18n._('Warning')}
                                {/* </Modal.Title> */}
                            </Modal.Header>
                            <Modal.Body style={{ margin: '0', paddingBottom: '15px', height: '100%' }}>
                                <div>
                                    {i18n._('Information')}
                                    <br />
                                    <Space width={4} />
                                    {i18n._('The camera hasn\'t been calibrated yet. Please go through the Camera Calibration procedures on touchscreen first.')}
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <div style={{ display: 'inline-block', marginRight: '8px' }}>
                                    <input
                                        type="checkbox"
                                        defaultChecked={false}
                                    />
                                    <span style={{ paddingLeft: '4px' }}>{i18n._('Don\'t show again in current session')}</span>
                                </div>
                            </Modal.Footer>
                        </Modal>
                    )}
                </div>
                {/* <button
                    type="button"
                    className={classNames(
                        'sm-btn-large',
                        'sm-btn-default',
                        styles['btn-addbackground'],
                    )}
                    disabled={!canCameraCapture}
                    onClick={this.actions.showModal}
                    style={{ display: (!workPosition.isFourAxis && (connectionType === CONNECTION_TYPE_WIFI && isConnected && !hasBackground)) ? 'block' : 'none' }}
                >
                    {i18n._('Camera Capture')}
                </button>*/}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const machine = state.machine;
    const laser = state.laser;
    return {
        isConnected: machine.isConnected,
        connectionType: machine.connectionType,
        server: machine.server,
        series: machine.series,
        hasBackground: laser.background.enabled,
        laserSize: machine.laserSize,
        size: machine.size,
        workPosition: machine.workPosition,
        workflowStatus: machine.workflowStatus
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setBackgroundImage: (filename, width, height, dx, dy) => dispatch(actions.setBackgroundImage(filename, width, height, dx, dy))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SetBackground);
