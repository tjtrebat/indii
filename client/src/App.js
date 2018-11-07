import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
    API.getUserStatus()
      .then(({ data }) => {
        this.setState({
          user: data
        });
      })
      .catch(err => console.log(err));
  }
  handleLogin = (username, password) => {
    username = username.trim();
    password = password.trim();
    return API.login(username, password)
      .then(({ data }) => {
        console.log(data);
        this.setState({
          user: data
        });
      })
      .catch(err => {
        console.log(err);
        return new Error("Invalid username or password.");
      });
  }
  handleRegister = (username, password, passwordConf) => {
    username = username.trim();
    password = password.trim();
    passwordConf = passwordConf.trim();
    return API.register(username, password, passwordConf)
      .then(({ data }) => {
        const { error } = data;
        if (error) {
          return new Error(error);
        }
        this.setState({
          user: data
        });
      })
      .catch(err => console.log(err));
  }
  handleLogout = () => {
    API.logout()
      .then(() => {
        this.setState({
          user: ""
        });
      })
      .catch(err => console.log(err));
  }
  render() {
    const { user } = this.state;
    return (
      <div>
        <Router>
          <div>
            <Header user={user.username}
              handleClick={this.handleLogout} />
            <Nav />
            <Route exact path="/" component={Home} />
            <Route exact path="/login"
              render={() => <Login handleClick={this.handleLogin} />} />
            <Route exact path="/register"
              render={() => <Register handleClick={this.handleRegister} />} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
