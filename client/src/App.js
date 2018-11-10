import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import { Nav } from "./components/Nav";
import API from "./utils/API";
import "./App.css";

class App extends Component {
  state = {
    user: ""
  }
  componentDidMount() {
    this.getUserStatus();
  }
  getUserStatus() {
    API.getUserStatus().then(res => {
      this.setState({
        user: res.data
      });
    }).catch(err => console.log(err));
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
    }).catch(err => console.log(err));
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
            <Route exact path="/profile" component={Profile} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
