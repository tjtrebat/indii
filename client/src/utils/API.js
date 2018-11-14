import axios from "axios";

export default {
    login: function (username, password) {
        return axios.post("/api/users/login", {
            username,
            password
        });
    },
    register: function (username, password) {
        return axios.post("/api/users/register", {
            username,
            password
        });
    },
    getUserStatus: function () {
        return axios.get("/api/users/getUserStatus");
    },
    logout: function () {
        return axios.get("/api/users/logout");
    },
    upload: function (data) {
        return axios.post("api/users/upload", data);
    },
    getVideos: function () {
        return axios.get("api/videos");
    }
};
