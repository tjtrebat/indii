import React, { Component } from "react";

class Profile extends Component {
  state = {
    selectedFile: ""
  }
  handleInputChange = event => {
    this.setState({
      selectedFile: event.target.files[0]
    })
  }
  handleFileUpload = event => {
    event.preventDefault();
    console.log("File: ", this.state.selectedFile);
  }
  render() {
    return (
      <div>
        <h3>Profile</h3>
        <form>
          <input type="file" name="uploadFile"
            onChange={this.handleInputChange} />
          <button type="submit"
            onClick={this.handleFileUpload}>Upload</button>
        </form>
      </div>
    );
  }
}

export default Profile;