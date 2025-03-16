/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '../views/WelcomeView.vue'
import ClienteView from '../views/ClienteView.vue'
import LoginView from '@/views/LoginView.vue'
import MarcaView from '@/views/MarcaView.vue'
import CategoriaView from '@/views/CategoriaView.vue'
import ProductoView from '@/views/ProductoView.vue'
import UsersView from '@/views/UsersView.vue'
import EmpleadosView from '@/views/EmpleadosView.vue'
import MoviminetosView from '@/views/MoviminetosView.vue'
import VerProducView from '@/views/VerProducView.vue'

const routes = [
  { 
    path: '/', 
    name: 'login', 
    component: LoginView 
  }, 
  {
    path: '/welcome',
    name: 'welcome',
    component: WelcomeView
  },
  {
    path: '/cliente',
    name: 'cliente',
    component: ClienteView
  },
  {
    path: '/marca',
    name: 'marca',
    component: MarcaView
  },
  {
    path: '/categoria',
    name: 'categoria',
    component: CategoriaView
  },
  {
    path: '/producto',
    name: 'producto',
    component: ProductoView
  },
  {
    path: '/users',
    name: 'users',
    component: UsersView
  },
  {
    path: '/empleados',
    name: 'empleados',
    component: EmpleadosView
  },
  {
    path: '/Movimientos',
    name: 'Movimientos',
    component: MoviminetosView
  },
  {
    path: '/Ver',
    name: 'Ver',
    component: VerProducView
  },


]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
