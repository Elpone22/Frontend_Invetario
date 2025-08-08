<template>
    <v-container fluid>
        <h1>Empleados</h1>
        <v-row>
            <!-- Formulario para agregar empleado -->
            <v-col xs="12" sm="3" md="3" lg="3" xl="3" xxl="3">
                <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre del empleado" 
                v-model="empleado.nombre"
                ></v-text-field>
                <v-text-field label="Apellido" maxlength="50" counter
                color="indigo" clearable placeholder="Apellido del empleado" 
                v-model="empleado.apellido"
                ></v-text-field>
                <v-text-field label="Cargo" maxlength="50" counter
                color="indigo" clearable placeholder="Cargo del empleado" 
                v-model="empleado.cargo"
                ></v-text-field>
                <v-text-field label="Disponibilidad" maxlength="50" counter
                color="indigo" clearable placeholder="Disponibilidad" 
                v-model="empleado.disponibilidad"
                ></v-text-field>
                <v-btn prepend-icon="mdi-check" color="indigo" block 
                @click="agregarEmpleado">Agregar</v-btn>
            </v-col>

            <!-- Tabla para mostrar empleados -->
            <v-col cols="9" xs="12" sm="9" md="9" lg="9" xl="9" xxl="9">
                <v-card>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Cargo</th>
                                    <th>Disponibilidad</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(empleado, i) in empleados" :key="i">
                                    <th>{{ empleado.id_empleado}}</th>
                                    <th>{{ empleado.nombre }} {{ empleado.apellido }}</th>
                                    <th>{{ empleado.cargo }}</th>
                                    <th>{{ empleado.disponibilidad }}</th>
                                    <th>
                                        <v-btn-group>
                                            <v-btn icon="mdi-eye" color="indigo" @click="obtenerEmpleado(empleado.id_empleado, 1)"></v-btn>
                                            <v-btn icon="mdi-pencil" color="green" @click="obtenerEmpleado(empleado.id_empleado, 2)"></v-btn>
                                            <v-btn icon="mdi-delete" color="red" @click="eliminarEmpleado(empleado.id_empleado)"></v-btn>
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
        <v-card title="Ver" subtitle="Datos del empleado">
            <v-card-text>
                <v-list>
                    <v-list-item prepend-icon="mdi-account" :title="datos.nombre"></v-list-item>
                    <v-list-item prepend-icon="mdi-account" :title="datos.apellido"></v-list-item>
                    <v-list-item prepend-icon="mdi-briefcase" :title="datos.cargo"></v-list-item>
                    <v-list-item prepend-icon="mdi-calendar-clock" :title="datos.disponibilidad"></v-list-item>
                </v-list> 
            </v-card-text>
        </v-card>
    </v-dialog> 

    <!-- Cuadro de diálogo para editar registro -->
    <v-dialog v-model="dialogTwo" transition="dialog-top-transition" width="500">
        <v-card title="Editar" subtitle="Datos del empleado">
            <v-card-text>
                <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre del empleado"
                v-model="datos.nombre"
                ></v-text-field>
                <v-text-field label="Apellido" maxlength="50" counter
                color="indigo" clearable placeholder="Apellido del empleado"
                v-model="datos.apellido"
                ></v-text-field>
                <v-text-field label="Cargo" maxlength="50" counter
                color="indigo" clearable placeholder="Cargo del empleado"
                v-model="datos.cargo"
                ></v-text-field>
                <v-text-field label="Disponibilidad" maxlength="50" counter
                color="indigo" clearable placeholder="Disponibilidad"
                v-model="datos.disponibilidad"
                ></v-text-field>
                <v-btn prepend-icon="mdi-check" color="indigo" block
                @click="modificarEmpleado(datos.id_empleado)">Guardar</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog> 
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

const ruta = 'http://18.188.139.146'

export default {
    name: 'EmpleadoView',
    data() {
        return {
            empleado: {},      // Para almacenar el nuevo empleado
            empleados: [],     // Para almacenar los empleados obtenidos del backend
            datos: {},         // Para almacenar los datos del empleado seleccionado
            dialogOne: false,  // Control del modal de ver
            dialogTwo: false,  // Control del modal de editar
            config: { headers: { 'Authorization': 'Bearer ' + this.$store.getters.getToken } }
        }
    },
    methods: {
        // Función para mostrar alertas
        getAlert(message) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: message,
                showConfirmButton: false,
                timer: 1500
            });
        },

        // Agregar un nuevo empleado
        agregarEmpleado() {
            axios.post(ruta + '/api/empleados', this.empleado, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data)
                        this.empleado = {} // Limpiar el formulario
                        this.obtenerEmpleados() // Recargar la tabla de empleados
                    }
                })
                .catch(error => console.log('Error al agregar empleado: ' + error))
        },

        // Obtener todos los empleados
        obtenerEmpleados() {
            this.empleados = []
            axios.get(ruta + '/api/empleados', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        let res = response.data
                        this.empleados = res.data
                    }
                })
                .catch(error => console.log('Error al obtener empleados: ' + error))
        },

        // Obtener un empleado por ID para ver o editar
        obtenerEmpleado(id, accion) {
            if (accion === 1) {
                this.dialogOne = true; // Mostrar vista
            } else {
                this.dialogTwo = true; // Mostrar edición
            }
            axios.get(ruta + `/api/empleados/${id}`, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.datos = response.data.data;
                        console.log('Datos del empleado:', this.datos); // Verifica los datos en la consola
                    }
                })
                .catch(error => console.log('Error al obtener empleado: ' + error));
        },

        // Modificar los datos de un empleado
        modificarEmpleado(id) {
            axios.put(ruta + `/api/empleados/${id}`, this.datos)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data)
                        this.dialogTwo = false // Cerrar modal
                        this.obtenerEmpleados() // Recargar la lista de empleados
                    }
                })
                .catch(error => console.log('Error al modificar empleado: ' + error))
        },

        // Eliminar un empleado
        eliminarEmpleado(id) {
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
                    axios.delete(ruta + `/api/empleados/${id}`, this.config)
                        .then(response => {
                            if (response.data.code === 200) {
                                this.getAlert(response.data.data)
                                this.obtenerEmpleados() // Recargar la lista
                            }
                        })
                        .catch(error => console.log('Error al eliminar empleado: ' + error))
                }
            })
        }
    },
    created() {
        this.obtenerEmpleados() // Cargar empleados cuando el componente se crea
    }
}
</script>

<style scoped>
.swal2-confirm {
    color: white !important;
}
</style>
