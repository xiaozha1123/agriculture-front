import axios from 'axios';

const service = axios.create({
  baseURL: 'http://localhost:8080', 
  timeout: 5000, 
  withCredentials: true,  //允许跨域携带cookie
});

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization= `Bearer ${token}`;
    }
    return config
  },
  (error) => Promise.reject(error)
)
service.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.log('请求错误：', error);
        return Promise.reject(error);
    }
)

export default service;