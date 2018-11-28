import React, { Component } from "react";
import VideoList from "../../components/VideoList";
import API from "../../utils/API";

class ViewProfile extends Component {
  state = {
    videos: []
  }
  componentDidMount() {
    API.getUserVideos(this.props.match.params.username).then(res => {
      this.setState({
        videos: res.data.videos
      });
    });
  }
  render() {
    const { videos } = this.state;
    return (
      <div>
        <h3>Video(s) by {this.props.match.params.username}</h3>
        <VideoList videos={videos} />
      </div>
    );
  }
}

export default ViewProfile;