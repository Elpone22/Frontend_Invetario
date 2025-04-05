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
      // Asegurar que data.data existe y tiene la estructura correcta
      const userInfo = data.data || data;
      
      if (!userInfo.id) {
          console.error('Datos de usuario incompletos:', data);
          throw new Error('La respuesta del login no contiene ID de usuario');
      }
  
      const userData = {
          usuario: userInfo.usuario || userInfo.name,
          id: String(userInfo.id), // Convertir a string para consistencia
          rol: userInfo.rol,
          token: data.token
      };
  
      console.log('Datos de usuario a guardar:', userData); // Verificación
      
      context.commit('setUsuario', userData.usuario);
      context.commit('setToken', userData.token);
      context.commit('setRol', userData.rol);
      
      localStorage.setItem('userData', JSON.stringify(userData));
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
