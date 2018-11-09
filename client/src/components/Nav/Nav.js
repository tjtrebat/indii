import React from "react";
import { NavLink } from "react-router-dom";

export const Nav = props => {
    return (
        <nav>
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
                {props.user ? (
                    <li><NavLink to="/profile">Profile</NavLink></li>
                ) : ""}
            </ul>
        </nav>
    );
}