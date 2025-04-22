<template>
    <v-container fluid>
        <h1>Categorías</h1>
        <v-row>
            <!-- Formulario para agregar categoría -->
            <v-col xs="12" sm="3" md="3" lg="3" xl="3" xxl="3">
                <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre de la categoría" 
                v-model="categoria.nombre"
                ></v-text-field>
                <v-btn prepend-icon="mdi-check" color="indigo" block 
                @click="agregarCategoria">Agregar</v-btn>
            </v-col>
            <!-- Tabla para mostrar categorías -->
            <v-col cols="9" xs="12" sm="9" md="9" lg="9" xl="9" xxl="9">
                <v-card>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(categoria, i) in categorias" :key="i">
                                    <th>{{ categoria.id }}</th>
                                    <th>{{ categoria.nombre }}</th>
                                    <th>
                                        <v-btn-group>
                                            <v-btn icon="mdi-eye" color="indigo" @click="obtenerCategoria(categoria.id, 1)"></v-btn>
                                            <v-btn icon="mdi-pencil" color="green" @click="obtenerCategoria(categoria.id, 2)"></v-btn>
                                            <v-btn icon="mdi-delete" color="red" @click="eliminarCategoria(categoria.id)"></v-btn>
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
        <v-card title="Ver" subtitle="Datos de la categoría">
            <v-card-text>
                <v-list>
                    <v-list-item prepend-icon="mdi-label" :title="datos.nombre"></v-list-item>
                </v-list> 
            </v-card-text>
        </v-card>
    </v-dialog> 

    <!-- Cuadro de diálogo para editar registro -->
    <v-dialog v-model="dialogTwo" transition="dialog-top-transition" width="500">
        <v-card title="Editar" subtitle="Datos de la categoría">
            <v-card-text>
                <v-select color="indigo" label="Nombre" :items="categorias"
                item-value="id" item-title="nombre" v-model="datos.nombre"
                ></v-select>
                <v-btn prepend-icon="mdi-check" color="indigo" block
                @click="modificarCategoria(datos.id)">Guardar</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog> 
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

const ruta = 'https://backendinventario-production-0b0f.up.railway.app'

export default {
    name: 'CategoriaView',
    data() {
        return {
            categoria: {},       // para almacenar la categoría a registrar
            categorias: [],      // para almacenar las categorías obtenidas del endpoint
            datos: {},           // para almacenar los datos de la categoría seleccionada
            dialogOne: false,    // controlar el modal de vista
            dialogTwo: false,    // controlar el modal de edición
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
                timer: 1500
            });
        },
        // Petición para agregar categoría
        agregarCategoria() {
            axios.post(ruta + '/api/categorias', this.categoria, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data)
                        this.categoria = {}
                        this.obtenerCategorias() // Recargar tabla
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para obtener todas las categorías
        obtenerCategorias() {
            this.categorias = []
            axios.get(ruta + '/api/categorias', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        let res = response.data
                        this.categorias = res.data
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para consultar los datos de una categoría
        obtenerCategoria(id, accion) {
            if (accion === 1) {
                this.dialogOne = true
            } else {
                this.dialogTwo = true
            }
            axios.get(ruta + `/api/categorias/${id}`, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.datos = response.data.data
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para modificar una categoría
        modificarCategoria(id) {
            axios.put(ruta + `/api/categorias/${id}`, this.datos, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data)
                        this.dialogTwo = false // Ocultar modal
                        this.obtenerCategorias() // Recargar tabla
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Petición para eliminar una categoría
        eliminarCategoria(id) {
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
                    axios.delete(ruta + `/api/categorias/${id}`, this.config)
                        .then(response => {
                            if (response.data.code === 200) {
                                this.getAlert(response.data.data)
                                this.obtenerCategorias() // Recargar tabla
                            }
                        })
                        .catch(error => console.log('Ha ocurrido un error: ' + error))
                }
            });
        }
    },
    created() {
        this.obtenerCategorias()
    }
}
</script>

<style scoped>
.swal2-confirm {
    color: white !important;
}
</style>
