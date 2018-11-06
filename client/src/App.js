import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
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
      .then(res => {
        this.setState({
          user: res.data
        });
      })
      .catch(err => console.log(err));
  }
  handleClick = (username, password) => {
    console.log("Logging user in.");
    API.login(username, password)
      .then(res => {
        console.log(res.data);
        this.setState({
          user: res.data
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
            <Link to="/">Home</Link>
            {!user ? (
              <Link to="/login">Login</Link>
            ) : (
                `Welcome, ${user.username}!`
              )}
            <Route exact path="/" component={Home} />
            <Route exact path="/login">
              <Login handleClick={this.handleClick} />
            </Route>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
