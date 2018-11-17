import React, { Component } from "react";
import { VideoList } from "../../components/VideoList";
import API from "../../utils/API";

class UserProfile extends Component {
  state = {
    videos: []
  }
  componentDidMount() {
    API.getVideos(this.props.match.params.username).then(res => {
      console.log(res.data.videos);
      this.setState({
        videos: res.data.videos
      });
    });
  }
  render() {
    const { videos } = this.state;
    return (
      <div>
        <p>Hello {this.props.match.params.username}!</p>
        <VideoList videos={videos} />
      </div>
    );
  }
}

export default UserProfile;