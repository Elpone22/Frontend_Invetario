import { createStore } from 'vuex';

export default createStore({
  state: {
    // Variables de estado global en la aplicación
    usuario: null,
    token: null,
    rol: null, // Agregar rol al estado
  },
  getters: {
    // Retorna el usuario
    getUsuario(state) {
      return state.usuario;
    },
    // Retorna el token
    getToken(state) {
      return state.token;
    },
    // Retorna el rol del usuario
    getRol(state) {
      return state.rol;
    },
  },
  mutations: {
    // Modifica el valor del usuario
    setUsuario(state, usuario) {
      state.usuario = usuario;
    },
    // Modifica el valor del token
    setToken(state, token) {
      state.token = token;
    },
    // Modifica el rol
    setRol(state, rol) {
      state.rol = rol;
    },
  },
  actions: {
    // Acción para realizar el login
    login(context, data) {
      // Llenar variables de estado
      context.commit('setUsuario', data.usuario);
      context.commit('setToken', data.token);
      context.commit('setRol', data.rol); // Guardar el rol en el estado

      // Guardar data en el local storage
      localStorage.setItem('userData', JSON.stringify(data));
    },

    // Acción para realizar el logout
    logout(context) {
      // Vaciar variables de estado
      context.commit('setUsuario', null);
      context.commit('setToken', null);
      context.commit('setRol', null); // Limpiar el rol

      // Eliminar data de local storage
      localStorage.removeItem('userData');
    },
  },
});
