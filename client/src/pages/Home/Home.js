import React, { Component } from "react";
import { VideoList } from "../../components/VideoList";
import API from "../../utils/API";

class Home extends Component {
    state = {
        videos: []
    }
    componentDidMount() {
        API.getVideos().then(res => {
            this.setState({
                videos: res.data
            });
        });
    }
    render() {
        const { videos } = this.state;
        return (
            <div>
                <h3 className="page-header">Home</h3>
                <VideoList videos={videos} />
            </div>
        );
    }
}

export default Home;
