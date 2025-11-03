import request from '@/utils/request'

//登录
export const login = (data: { username: string; password: string; role: string }) => {
  return request.post('/auth/login', data)
}




