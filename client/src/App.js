import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProfile from "./pages/EditProfile";
import UploadVideo from "./pages/UploadVideo";
import UserProfile from "./pages/UserProfile";
import UserVideo from "./pages/UserVideo";
import Header from "./components/Header";
import { Nav } from "./components/Nav";
import API from "./utils/API";
import "./App.css";

class App extends Component {
  state = {
    user: ""
  }
  componentDidMount() {
    this.getUserStatus().then(res => {
      this.setState({
        user: res.data
      })
    }).catch(err => {
      console.log(err);
    });
  }
  getUserStatus() {
    return API.getUserStatus();
  }
  handleLogin = (username, password) => {
    return API.login(username, password).then(res => {
      this.setState({
        user: res.data
      });
    }).catch(err => {
      throw new Error("Login Error", err);
    });
  }
  handleRegister = (username, password) => {
    return API.register(username, password)
      .then(res => {
        this.setState({
          user: res.data
        });
      }).catch(err => {
        throw new Error("Registration Error", err);
      });
  }
  handleLogout = () => {
    API.logout().then(() => {
      this.setState({
        user: ""
      });
    });
  }
  render() {
    const { user } = this.state;
    return (
      <div>
        <Router>
          <div>
            <Header user={user.username}
              handleClick={this.handleLogout} />
            <Nav user={user} />
            <Route exact path="/" component={Home} />
            <Route exact path="/login"
              render={() => <Login handleClick={this.handleLogin} />} />
            <Route exact path="/register"
              render={() => <Register handleClick={this.handleRegister} />} />
            <Route exact path="/profile"
              render={() => <EditProfile user={user}
                getUserStatus={this.getUserStatus} />} />
            <Route exact path="/profile/upload"
              render={() => <UploadVideo user={user}
                getUserStatus={this.getUserStatus} />} />
            <Route exact path="/users/:username" component={UserProfile} />
            <Route exact path="/videos/:videoId" component={UserVideo} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
