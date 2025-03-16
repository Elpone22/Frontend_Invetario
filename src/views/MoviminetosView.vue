<template>
    <v-container fluid>
        <h1>Movimientos de Inventario</h1>
        <v-row>
            <!-- Formulario para agregar movimiento -->
            <v-col xs="12" sm="3" md="3" lg="3" xl="3" xxl="3">
                <!-- Selector de Producto -->
                <v-select color="indigo" label="Producto" 
                    :items="productos" item-value="id" item-title="nombre" 
                    v-model="movimiento.fk_productos">
                </v-select>

                <v-text-field label="Cantidad" type="number"
                    color="indigo" clearable placeholder="Cantidad" 
                    v-model="movimiento.cantidad">
                </v-text-field>

                <!-- Selector de Tipo de Movimiento -->
                <v-select label="Tipo de Movimiento" :items="['Entrada', 'Salida']"
                    color="indigo" v-model="movimiento.tipoMov">
                </v-select>

                <!-- Campo de Fecha -->
                <v-text-field label="Fecha" type="date"
                    color="indigo" v-model="movimiento.fecha">
                </v-text-field>

                <v-btn prepend-icon="mdi-check" color="indigo" block 
                    @click="agregarMovimiento">Agregar</v-btn>
            </v-col>
            
            <!-- Tabla para mostrar movimientos -->
            <v-col cols="9" xs="12" sm="9" md="9" lg="9" xl="9" xxl="9">
                <v-card>
                    <v-card-text>
                         <!-- Filtros -->
        <v-row>
            <v-col cols="12" md="3">
                <v-select
                    label="Filtrar por Producto"
                    :items="productos"
                    item-value="id"
                    item-title="nombre"
                    v-model="filtroProducto"
                    clearable
                ></v-select>
            </v-col>

            <v-col cols="12" md="3">
                <v-text-field
                    label="Filtrar por Fecha"
                    type="date"
                    v-model="filtroFecha"
                    clearable
                ></v-text-field>
            </v-col>

            <v-col cols="12" md="2">
                <v-btn color="indigo" @click="limpiarFiltros">Limpiar Filtros</v-btn>
            </v-col>
        </v-row>

                        <v-table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Tipo</th>
                                    <th>Fecha</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(movimiento, i) in movimientosFiltrados " :key="i">

                                    <th>{{ movimiento.id }}</th>
                                    <th>{{ movimiento.producto }}</th>
                                    <th>{{ movimiento.cantidad }}</th>
                                    <th>{{ movimiento.tipoMov }}</th>
                                    <th>{{ movimiento.fecha }}</th>
                                    <th>
                                        <v-btn-group>
                                            <v-btn icon="mdi-eye" color="indigo" @click="obtenerMovimiento(movimiento.id, 1)"></v-btn>
                                            <v-btn icon="mdi-pencil" color="green" @click="obtenerMovimiento(movimiento.id, 2)"></v-btn>
                                            <v-btn icon="mdi-delete" color="red" @click="eliminarMovimiento(movimiento.id)"></v-btn>
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
        <v-card title="Ver" subtitle="Datos del movimiento">
            <v-card-text>
                <v-list>
                    <v-list-item prepend-icon="mdi-package-variant" :title="datos.producto"></v-list-item>
                    <v-list-item prepend-icon="mdi-numeric" :title="datos.cantidad"></v-list-item>
                    <v-list-item prepend-icon="mdi-swap-horizontal" :title="datos.tipoMov"></v-list-item>
                    <v-list-item prepend-icon="mdi-calendar" :title="datos.fecha"></v-list-item>
                </v-list> 
            </v-card-text>
        </v-card>
    </v-dialog> 

    <!-- Cuadro de diálogo para editar registro -->
    <v-dialog v-model="dialogTwo" transition="dialog-top-transition" width="500">
        <v-card title="Editar" subtitle="Datos del movimiento">
            <v-card-text>
                <v-select color="indigo" label="Producto"  item-value="id"
                    :items="productos"  item-title="nombre" 
                    v-model="datos.fk_productos">
                </v-select>

                <v-text-field label="Cantidad" type="number"
                    color="indigo" clearable placeholder="Cantidad" 
                    v-model="datos.cantidad">
                </v-text-field>

                <v-select label="Tipo de Movimiento" :items="['Entrada', 'Salida']"
                    color="indigo" v-model="datos.tipoMov">
                </v-select>

                <v-text-field label="Fecha" type="date"
                    color="indigo" v-model="datos.fecha">
                </v-text-field>

                <v-btn prepend-icon="mdi-check" color="indigo" block
                    @click="modificarMovimiento(datos.id)">Guardar</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog> 
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

const ruta = 'http://127.0.0.1:8000';

export default {
    name: 'MovimientosView',
    data() {
        return {
            productos: [],
            movimiento: { fk_productos: '', cantidad: 0, tipoMov: 'Entrada', fecha: '' }, // Inicializar el formulario
            movimientos: [],
            datos: {},
            filtroProducto: null,
            filtroFecha: null,
            dialogOne: false,
            dialogTwo: false,
            config: { headers: { 'Authorization': 'Bearer ' + this.$store.getters.getToken } }
        };
    },
    computed: {
        movimientosFiltrados() {
            return this.movimientos.filter(movimiento => {
                const coincideProducto = this.filtroProducto ? movimiento.fk_productos === this.filtroProducto : true;
                const coincideFecha = this.filtroFecha ? movimiento.fecha === this.filtroFecha : true;
                return coincideProducto && coincideFecha;
            });
        }
    },
    methods: {
        getAlert(message) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: message,
                showConfirmButton: false,
                timer: 1500
            });
        },

        obtenerProductos() {
            axios.get(ruta + '/api/productos', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.productos = response.data.data;
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error));
        },

        agregarMovimiento() {
            // Validar que todos los campos estén llenos
            if (!this.movimiento.fk_productos || !this.movimiento.cantidad || !this.movimiento.tipoMov || !this.movimiento.fecha) {
                this.getAlert("Todos los campos son obligatorios.");
                return;
            }

            axios.post(ruta + '/api/movimientos_inventarios', this.movimiento, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data);
                        this.movimiento = { fk_productos: '', cantidad: 0, tipoMov: 'Entrada', fecha: '' }; // Reiniciar formulario
                        this.obtenerMovimientos(); // Recargar tabla
                    }
                })
                .catch(error => {
                    console.log('Ha ocurrido un error: ', error);

                    // Mostrar el mensaje de error específico del backend
                    if (error.response && error.response.data && error.response.data.data) {
                        this.getAlert(error.response.data.data); // Mensaje específico del backend
                    } else {
                        this.getAlert("No hay suficiente cantidad"); // Mensaje genérico
                    }
                });
        },

        obtenerMovimientos() {
            axios.get(ruta + '/api/movimientos_inventarios', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.movimientos = response.data.data;
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error));
        },
        limpiarFiltros() {
            this.filtroProducto = null;
            this.filtroFecha = null;
        },

        obtenerMovimiento(id, accion) {
            if (accion === 1) {
                this.dialogOne = true;
            } else {
                this.dialogTwo = true;
            }
            axios.get(ruta + `/api/movimientos_inventarios/${id}`, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        console.log("Datos recibidos:", response.data.data); // Depuración
                        this.datos = response.data.data;
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error));
        },
        modificarMovimiento(id) {
                    axios.put(ruta + `/api/movimientos_inventarios/${id}`, this.datos, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data);
                        this.dialogTwo = false // Ocultar modal
                        this.obtenerMovimientos(); // Recargar tabla
                    }
                })
                .catch(error => {
                    console.log('Ha ocurrido un error: ' + error);
                    this.getAlert("Error al actualizar el movimiento.");
                });
        },


        eliminarMovimiento(id) {
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
                    axios.delete(ruta + `/api/movimientos_inventarios/${id}`, this.config)
                        .then(response => {
                            if (response.data.code === 200) {
                                this.getAlert(response.data.data);
                                this.obtenerMovimientos(); // Recargar tabla
                            }
                        })
                        .catch(error => {
                            console.log('Ha ocurrido un error: ' + error);
                            this.getAlert("Error al eliminar el movimiento.");
                        });
                }
            });
        },
       
    },
    created() {
        this.obtenerProductos();
        this.obtenerMovimientos();
    }
};
</script>

<style scoped>
.swal2-confirm {
    color: white !important;
}
</style>
