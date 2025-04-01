<template>
  <v-app>
    <!-- Menú lateral -->
    <v-navigation-drawer app v-model="drawer">
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-h6">VentaXperto</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>

        <!-- Si el usuario NO está logueado -->
        <template v-if="!usuario">
          <v-list-item to="/">
            <v-list-item-icon><v-icon>mdi-login</v-icon></v-list-item-icon>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item>
        </template>

        <!-- Si el usuario ESTÁ logueado -->
        <template v-if="usuario">
          <v-list-item to="/welcome">
            <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
            <v-list-item-title>Inicio</v-list-item-title>
          </v-list-item>

          <!-- Menú para administradores -->
          <template v-if="$store.getters.getRol === 'admin'">
            <v-list-group value="Gestión">
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <v-list-item-icon><v-icon>mdi-folder</v-icon></v-list-item-icon>
                  <v-list-item-title>Gestión</v-list-item-title>
                </v-list-item>
              </template>
              <v-list-item to="/marca">
                <v-list-item-title>Marca</v-list-item-title>
              </v-list-item>
              <v-list-item to="/categoria">
                <v-list-item-title>Categoría</v-list-item-title>
              </v-list-item>
              <v-list-item to="/empleados">
                <v-list-item-title>Empleados</v-list-item-title>
              </v-list-item>
              <v-list-item to="/producto">
                <v-list-item-title>Producto</v-list-item-title>
              </v-list-item>
              <v-list-item to="/users">
                <v-list-item-title>Usuarios</v-list-item-title>
              </v-list-item>
            </v-list-group>
          </template>

          <!-- Menú para todos los usuarios -->
          <v-list-item to="/Ver">
            <v-list-item-icon><v-icon>mdi-eye</v-icon></v-list-item-icon>
            <v-list-item-title>Ver Productos</v-list-item-title>
          </v-list-item>

          <v-list-item to="/Movimientos">
            <v-list-item-icon><v-icon>mdi-transfer</v-icon></v-list-item-icon>
            <v-list-item-title>Movimientos</v-list-item-title>
          </v-list-item>

          <!-- Botón de Logout -->
          <v-list-item @click="logout">
            <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Barra superior con botón para abrir el menú -->
    <v-app-bar class="bg-deep-purple-darken-3">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>VentaXperto</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      drawer: false, // Estado del menú lateral
    };
  },
  computed: {
    // Obtener el usuario del estado global de Vuex
    usuario() {
      return this.$store.getters.getUsuario;
    },
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/");
    },
    validarAcceso() {
      let datos = localStorage.getItem("userData");
      if (datos) {
        const userData = JSON.parse(datos);
        console.log('Datos del localStorage:', userData);
        this.$store.dispatch("login", userData);
        this.$router.push("/welcome");
      } else {
        this.$router.push("/");
      }
    },
  },
  created() {
    this.validarAcceso();
  },
};
</script>

<style scoped>
.swal2-confirm {
    color: white !important;
    background-color: #6200ea !important;
}
.swal2-container {
  z-index: 9999 !important;
}

</style>