import axiosClient, { API_BASE } from "./axiosClient";

function unwrap(promise) {
  return promise
    .then((res) => res.data)
    .catch((err) => {
      const message = err.response?.data?.message || err.message || "Request failed";
      throw new Error(message);
    });
}

export const api = {
  get: (path, config) => unwrap(axiosClient.get(path, config)),
  post: (path, body, config) => unwrap(axiosClient.post(path, body, config)),
  put: (path, body, config) => unwrap(axiosClient.put(path, body, config)),
  del: (path, config) => unwrap(axiosClient.delete(path, config)),
};

export { API_BASE };
