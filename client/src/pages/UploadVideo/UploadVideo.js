import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import UploadVideoForm from "../../components/UploadVideoForm";

class UploadVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    }
    this.sendRedirect = this.sendRedirect.bind(this);
  }
  componentDidMount() {
    this.props.getUserStatus().catch(this.sendRedirect);
  }
  componentWillReceiveProps(newProps) {
    if (!newProps.user) {
      this.sendRedirect();
    }
  }
  sendRedirect() {
    this.setState({
      redirect: true
    });
  }
  render() {
    const { redirect } = this.state;
    if (redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <h3>Upload Video</h3>
        <UploadVideoForm />
      </div>
    )
  }
}

export default UploadVideo;