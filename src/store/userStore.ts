import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    role: '',
    token: ''
  }),
  actions: {
    setUser(name: string, role: string, token: string) {
      this.username = name
      this.role = role
      this.token = token
      localStorage.setItem('role', role)
      localStorage.setItem('token', token)
    },
    logout() {
      this.username = ''
      this.role = ''
      this.token = ''
      localStorage.clear()
    }
  }
})
