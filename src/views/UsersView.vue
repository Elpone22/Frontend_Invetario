<template>
    <v-container fluid>
        <h1>Usuarios</h1>
        <v-row>
            <!-- Formulario para agregar usuario -->
            <v-col xs="12" sm="3" md="3" lg="3" xl="3" xxl="3">
                <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre del usuario" 
                v-model="user.name"
                ></v-text-field>

                <v-select label="Rol" maxlength="50" counter :items="['admin', 'empleado']"
                    color="indigo" clearable placeholder="Rol del usuario" 
                     v-model="user.rol">
                </v-select>


                <v-text-field label="Correo Electrónico" maxlength="50" counter
                color="indigo" clearable placeholder="Correo electrónico" 
                v-model="user.email"
                ></v-text-field>
             
                <v-text-field label="Contraseña" maxlength="50" counter
                color="indigo" clearable placeholder="Contraseña" type="password"
                v-model="user.password"
                ></v-text-field>
                <v-btn prepend-icon="mdi-check" color="indigo" block 
                @click="agregarUsuario">Agregar</v-btn>
            </v-col>
            <!-- Tabla para mostrar usuarios -->
            <v-col cols="9" xs="12" sm="9" md="9" lg="9" xl="9" xxl="9">
                <v-card>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Rol</th>
                                    <th>Email</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(user, i) in users" :key="i">
                                    <th>{{ user.id }}</th>
                                    <th>{{ user.name }}</th>
                                    <th>{{ user.rol }}</th>
                                    <th>{{ user.email }}</th>
                                    <th>
                                        <v-btn-group>
                                            <v-btn icon="mdi-eye" color="indigo" @click="obtenerUsuario(user.id, 1)"></v-btn>
                                            <v-btn icon="mdi-pencil" color="green" @click="obtenerUsuario(user.id, 2)"></v-btn>
                                            <v-btn icon="mdi-delete" color="red" @click="eliminarUsuario(user.id)"></v-btn>
                                        </v-btn-group>
                                    </th>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

    <!-- Cuadro de diálogo para ver registro -->
    <v-dialog v-model="dialogOne" transition="dialog-top-transition" width="500">
        <v-card title="Ver" subtitle="Datos del usuario">
            <v-card-text>
                <v-list>
                    <v-list-item prepend-icon="mdi-label" :title="datos.name"></v-list-item>
                    <v-list-item prepend-icon="mdi-email" :title="datos.email"></v-list-item>
                </v-list> 
            </v-card-text>
        </v-card>
    </v-dialog> 

    <!-- Cuadro de diálogo para editar registro -->
    <v-dialog v-model="dialogTwo" transition="dialog-top-transition" width="500">
        <v-card title="Editar" subtitle="Datos del usuario">
            <v-card-text>
                <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre del usuario"
                v-model="datos.name"
                ></v-text-field>

                <v-select label="Rol" maxlength="50" counter :items="['admin', 'empleado']"
                color="indigo"  clearable placeholder="Rol del usuario" 
                v-model="datos.rol">
                </v-select>
                
                <v-text-field label="Correo Electrónico" maxlength="50" counter
                color="indigo" clearable placeholder="Correo electrónico"
                v-model="datos.email"
                ></v-text-field>
              
                <v-text-field label="Contraseña" maxlength="50" counter
                color="indigo" clearable placeholder="Contraseña" type="password"
                v-model="datos.password"
                ></v-text-field>
                <v-btn prepend-icon="mdi-check" color="indigo" block
                @click="modificarUsuario(datos.id)">Guardar</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog> 
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

const ruta = 'https://backendinventario-production-0b0f.up.railway.app'

export default {
    name: 'UserView',
    data() {
        return {
            user: {},        // para almacenar el usuario a registrar
            users: [],       // para almacenar los usuarios obtenidos del endpoint
            datos: {},       // para almacenar los datos del usuario seleccionado
            dialogOne: false,// controlar el modal de vista
            dialogTwo: false,// controlar el modal de edición
            config: { headers: { 'Authorization': 'Bearer ' + this.$store.getters.getToken } }
        }
    },
    methods: {
        // Mostrar alerta
        getAlert(message) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: message,
                showConfirmButton: false,
                timer: 1500,
                
            });
        },
        // Petición para agregar usuario
        agregarUsuario() {
            axios.post(ruta + '/api/user/register', this.user, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data)
                        this.user = {}
                        this.$store.dispatch('logout') 
                        this.$router("/")
                       
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para obtener todos los usuarios
        obtenerUsuarios() {
            this.users = []
            axios.get(ruta + '/api/users', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        let res = response.data
                        this.users = res.data
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para consultar los datos de un usuario
        obtenerUsuario(id, accion) {
            if (accion === 1) {
                this.dialogOne = true
            } else {
                this.dialogTwo = true
            }
            axios.get(ruta + `/api/users/${id}`, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.datos = response.data.data
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para modificar un usuario
        modificarUsuario(id) {
            axios.put(ruta + `/api/users/${id}`, this.datos, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data)
                        this.dialogTwo = false // Ocultar modal
                        this.obtenerUsuarios() // Recargar tabla
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para eliminar un usuario
        eliminarUsuario(id) {
            Swal.fire({
                title: "¿Estás seguro?",
                text: "¡La acción no se podrá revertir!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, eliminar!"
            }).then((result) => {
                if (result.isConfirmed) {
                    axios.delete(ruta + `/api/users/${id}`, this.config)
                        .then(response => {
                            if (response.data.code === 200) {
                                this.getAlert(response.data.data)
                                this.obtenerUsuarios() // Recargar tabla
                            }
                        })
                        .catch(error => console.log('Ha ocurrido un error: ' + error))
                }
            });
        }
    },
    created() {
        this.obtenerUsuarios()
    }
}
</script>

<style scoped>
.swal2-confirm {
    color: white !important;
}
</style>
