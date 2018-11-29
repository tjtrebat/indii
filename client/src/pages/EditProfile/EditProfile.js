import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { VideoList } from "../../components/VideoList";
import API from "../../utils/API";

class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: this.props.user ? this.props.user.videos : [],
      redirect: false
    }
    this.handleClick = this.handleClick.bind(this);
    this.sendRedirect = this.sendRedirect.bind(this);
  }
  componentDidMount() {
    this.props.getUserStatus().then(res => {
      this.setState({
        videos: res.data.videos
      });
    }).catch(this.sendRedirect);
  }
  componentWillReceiveProps(newProps) {
    if (!newProps.user) {
      this.sendRedirect();
    }
  }
  handleClick(id) {
    API.deleteVideo(id).then(res => {
      this.setState({
        videos: res.data
      });
    });
  }
  sendRedirect() {
    this.setState({
      redirect: true
    });
  }
  render() {
    const { videos, redirect } = this.state;
    if (redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <h3 className="page-header">Profile</h3>
        <VideoList user={this.props.user} videos={videos} handleClick={this.handleClick} />
      </div>
    );
  }
}

export default EditProfile;
