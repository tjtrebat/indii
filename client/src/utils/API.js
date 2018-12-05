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
    uploadVideo: function (data, fn) {
        return axios.post("/api/profile/upload", data, {
            onUploadProgress: ProgressEvent => {
                fn(ProgressEvent.loaded / ProgressEvent.total * 100);
            }
        });
    },
    deleteVideo: function (id) {
        return axios.delete(`/api/profile/videos/${id}`);
    },
    getUserVideos: function (username) {
        return axios.get(`/api/users/videos/${username}`);
    },
    getVideos: function () {
        return axios.get("/api/videos");
    },
    getVideo: function (id) {
        return axios.get(`/api/videos/${id}`);
    },
    submitComment: function (id, data) {
        return axios.post(`/api/videos/${id}`, data);
    }
};
