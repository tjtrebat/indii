import React, { Component } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/API";


class Home extends Component {
    state = {
        videos: []
    }
    componentDidMount() {
        API.getVideos().then(res => {
            this.setState({
                videos: res.data.videos
            });
        });
    }
    render() {
        const { videos } = this.state;
        return (
            <div>
                <h3>Home</h3>
                {videos ? (
                    <ul>
                        {videos.map(video => (
                            <li key={video._id}>
                                <span>{video.title} by 
                                <Link to={`/users/${video.user.username}`}>
                                    {video.user.username}
                                </Link><br />
                                {video.createdAt}</span>
                            </li>
                        ))}
                    </ul>
                ) : ""}
            </div>
        );
    }
}

export default Home;
