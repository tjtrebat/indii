import React, { Component } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default class Video extends Component {
  componentDidMount() {
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      console.log("onPlayerReady", this);
    });
  }
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }
  render() {
    return (
      <div data-vjs-player>
        <video ref={node => this.videoNode = node} className="video-js">
          <source src={this.props.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
}