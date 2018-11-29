import React, { Component } from "react";
import { Video } from "../../components/Video";
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
    return (
      <div>
        Title: {video.title}<br />
        Uploaded: {video.createdAt}<br />
        <Video url={`https://s3.amazonaws.com/${video.s3Bucket}/${video.fileName}`}
          width="320" height="240" controls />
        <div className="comments">
          <h3>Comments</h3>
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
                <li key={comment._id}>{comment.text}<br />
                <span>by {comment.user.username}</span> on {comment.createdAt}</li>
              ))}
            </ul>
          ) : "No comment(s) to be shown."}
        </div>
      </div>
    );
  }
}

export default ShowVideo;