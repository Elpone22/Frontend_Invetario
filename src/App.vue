<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h6">Inventario</v-list-item-title>
            <v-list-item-subtitle v-if="usuario">Bienvenido, {{ usuario }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <!-- Menú para admin -->
        <template v-if="rol === 'admin'">
          <v-list-item link to="/welcome" title="Inicio" prepend-icon="mdi-home" />
          <v-list-item link to="/users" title="Usuarios" prepend-icon="mdi-account-group" />
          <v-list-item link to="/cliente" title="Clientes" prepend-icon="mdi-account" />
          <v-list-item link to="/empleados" title="Empleados" prepend-icon="mdi-account-tie" />
          <v-list-item link to="/marca" title="Marcas" prepend-icon="mdi-factory" />
          <v-list-item link to="/categoria" title="Categorías" prepend-icon="mdi-tag" />
          <v-list-item link to="/producto" title="Productos" prepend-icon="mdi-package-variant" />
          <v-list-item link to="/Ver" title="Ver Productos" prepend-icon="mdi-eye" />
          <v-list-item link to="/Movimientos" title="Movimientos" prepend-icon="mdi-swap-horizontal" />
          <v-list-item link to="/reportes/movimientos" title="Reportes" prepend-icon="mdi-chart-bar" />
        </template>
        <!-- Menú para empleado -->
        <template v-else-if="rol === 'empleado'">
          <v-list-item link to="/Ver" title="Ver Productos" prepend-icon="mdi-eye" />
          <v-list-item link to="/Movimientos" title="Movimientos" prepend-icon="mdi-swap-horizontal" />
        </template>
        <!-- Si no hay usuario, solo login -->
        <template v-else>
          <v-list-item link to="/" title="Login" prepend-icon="mdi-login" />
        </template>
        <v-divider></v-divider>
        <v-list-item v-if="usuario" @click="logout" title="Cerrar sesión" prepend-icon="mdi-logout" />
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Sistema Inventario</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      drawer: false,
    }
  },
  computed: {
    usuario() {
      return this.$store.getters.getUsuario;
    },
    rol() {
      return this.$store.getters.getRol;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/');
    },
    restaurarSesion() {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { usuario, token, rol } = JSON.parse(userData);
        this.$store.commit('setUsuario', usuario);
        this.$store.commit('setToken', token);
        this.$store.commit('setRol', rol);
      }
    }
  },
  created() {
    this.restaurarSesion();
  }
}
</script>