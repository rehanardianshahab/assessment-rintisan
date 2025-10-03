import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createWebHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'

import HomeView from './products/index.vue'
import CreateView from './products/create.vue'
import EditView from './products/edit.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/product/new', component: CreateView },
  { path: '/product/edit/:id', component: EditView },
]
export const router = createRouter({
  history: createWebHistory(),
  routes,
})
const pinia = createPinia()

createApp(App).use(router).use(pinia).mount('#app')
