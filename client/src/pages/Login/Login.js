import React, { Component } from "react";

class Login extends Component {
    state = {
        username: "",
        password: ""
    }
    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }
    handleClick = event => {
        event.preventDefault();
        const { username, password } = this.state;
        this.props.handleClick(username, password);
    }
    render() {
        const { username, password } = this.state;
        return (
            <div>
                <h3>Login</h3>
                <form>
                    <input type="text" name="username" value={username}
                        onChange={this.handleInputChange} placeholder="Username" /> <br />
                    <input type="password" name="password" value={password}
                        onChange={this.handleInputChange} placeholder="Password" />
                    <button type="submit" onClick={this.handleClick}>Login</button>
                </form>
            </div>
        );
    }
}

export default Login;