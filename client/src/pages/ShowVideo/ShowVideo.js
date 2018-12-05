import React, { Component } from "react";
import { Link } from "react-router-dom";
import Video from "../../components/Video";
import API from "../../utils/API";
import "./ShowVideo.css";

class ShowVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null,
      comment: ""
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    API.getVideo(this.props.match.params.videoId).then(
      res => {
        this.setState({ video: res.data });
      }).catch(err => console.log(err));
  }
  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }
  handleClick(event) {
    event.preventDefault();
    API.submitComment(this.state.video._id, { text: this.state.comment }).then(
      res => {
        console.log(res.data);
        this.setState({
          video: res.data,
          comment: ""
        });
      });
  }
  render() {
    const { video } = this.state;
    if (!video) {
      return <span>Video is unavailable.</span>;
    }
    const videoJsOptions = {
      autoplay: false,
      controls: true,
      width: "320",
      height: "240",
      sources: [{
        src: `https://s3.amazonaws.com/${video.s3Bucket}/${video.fileName}`,
        type: 'video/mp4'
      }]
    }
    return (
      <div>
        <div className="video-info">
          <span className="video-title">Title: {video.title}</span>
          <span className="video-uploaded">(Uploaded: {video.createdAt})</span>
          <p className="video-description">{video.description}</p>
        </div>
        <Video {...videoJsOptions} />
        <div className="comments">
          <h3 className="comments-heading">Comments</h3>
          {this.props.user ? (
            <form>
              <p>Please use the form below for your comment.</p>
              <textarea name="comment" onChange={this.handleInputChange}></textarea>
              <button type="submit" onClick={this.handleClick}>Submit</button>
            </form>
          ) : ""}
          {video.comments.length > 0 ? (
            <ul className="user-comments">
              {video.comments.map(comment => (
                <li key={comment._id}>
                  <p className="comment-text">{comment.text}</p>
                  <span>by <Link to={`/users/${comment.user.username}`}>
                    {comment.user.username}</Link> on {comment.createdAt}</span>
                </li>
              ))}
            </ul>
          ) : "No comment(s) to be shown."}
        </div>
      </div>
    );
  }
}

export default ShowVideo;