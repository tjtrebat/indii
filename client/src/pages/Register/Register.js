import React, { Component } from "react";
import API from "../../utils/API";

class Register extends Component {
    state = {
        username: "",
        password: "",
        confirmPassword: ""
    }
    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }
    handleClick = event => {
        event.preventDefault();
        const { username, password, confirmPassword } = this.state;
        API.login(username, password, confirmPassword)
            .then(res => {
                console.log(res.data);
            })
            .catch(err => console.log(err));
    }
    render() {
        return (
            <div>
                <h3>Register</h3>
                <form>
                    <input type="text" name="username" value={this.state.username}
                        onChange={this.handleInputChange} placeholder="Username" /><br />
                    <input type="password" name="password" value={this.state.password}
                        onChange={this.handleInputChange} placeholder="Password" />
                    <input type="password" name="confirmPassword" value={this.state.confirmPassword}
                        onChange={this.handleInputChange} placeholder="Confirm Password" />
                    <button type="submit" onClick={this.handleClick}>Login</button>
                </form>
            </div>
        );
    }
}

export default Register;