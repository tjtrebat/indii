import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import UploadFileForm from "../../components/UploadFileForm";

class UploadVideo extends Component {
  state = {
    redirect: false
  }
  componentDidMount() {
    this.props.getUserStatus().catch(() => {
      this.setState({
        redirect: true
      });
    });
  }
  componentWillReceiveProps(newProps) {
    if (!newProps.user) {
      this.setState({
        redirect: true
      });
    }
  }
  render() {
    const { redirect } = this.state;
    if (redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <h3>Upload Video</h3>
        <UploadFileForm />
      </div>
    )
  }
}

export default UploadVideo;