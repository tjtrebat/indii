import React, { Component } from "react";
import { Video } from "../../components/Video";

class ShowVideo extends Component {
  state = {
    video: null
  }
  componentDidMount() {
    console.log(`Retrieving Video: ${this.props.match.params.videoId}`);
  }
  render() {
    const { video } = this.state;
    if (!video) {
      return <span>Video does not exist.</span>;
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