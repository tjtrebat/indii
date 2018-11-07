import React from "react";
import { NavLink } from "react-router-dom";

export const Nav = props => {
    return (
        <nav>
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
            </ul>
        </nav>
    );
}