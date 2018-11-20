import React, { Component } from "react";
import { Video } from "../../components/Video";
import API from "../../utils/API";

class ShowVideo extends Component {
  state = {
    video: null
  }
  componentDidMount() {
    API.getVideo(this.props.match.params.videoId).then(res => {
      this.setState({ video: res.data });
    })
  }
  render() {
    const { video } = this.state;
    if (!video) {
      return <span>Video is unavailable.</span>;
    }
    return (
      <div>
        Title: {video.title}<br />
        Uploaded: {video.createdAt}<br />
        <Video url={video.url} width="320" height="240" controls />
      </div>
    );
  }
}

export default ShowVideo;