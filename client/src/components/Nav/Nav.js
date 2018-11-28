import React from "react";
import { NavLink } from "react-router-dom";
import "./Nav.css";

export const Nav = props => {
    return (
        <nav>
            {!props.user ? (
                <ul className="nav-list">
                    <li><NavLink to="/">Home</NavLink></li>
                </ul>
            ) : (
                    <ul className="nav-list">
                        <li><NavLink to="/">Home</NavLink></li>
                        <li><NavLink exact to="/profile">Profile</NavLink></li>
                        <li><NavLink exact to="/profile/upload">Upload Video</NavLink></li>
                    </ul>
                )}
        </nav>
    );
}