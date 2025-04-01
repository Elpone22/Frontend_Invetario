<template>
    <v-container fluid>
        <h1>Productos</h1>
        <v-row>
            <v-col cols="12" xs="12" sm="12" md="12" lg="12" xl="12" xxl="12">
                <v-btn color="primary" @click="dialogProducto = true">Agregar Producto</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12">
                <v-text-field
                    label="Buscar por nombre"
                    v-model="filtroNombre"
                    clearable
                    prepend-icon="mdi-magnify"
                ></v-text-field>
            </v-col>
        </v-row>
        <!-- Tabla para mostrar productos -->
        <v-col cols="12" xs="12" sm="12" md="12" lg="12" xl="12" xxl="12">
            <v-card>
                <v-card-text>
                    <v-table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Marca</th>
                                <th>Categoría</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(producto, i) in productosFiltrados" :key="i">
                                <th>{{ producto.id }}</th>
                                <td>
                                    <v-img
                                        v-if="producto.imagen"
                                        :src="producto.imagen"
                                        width="50"
                                        height="50"
                                    ></v-img>
                                </td>
                                <th>{{ producto.nombre }}</th>
                                <th>{{ producto.cantidad }}</th>
                                <th>{{ producto.descripcion }}</th>
                                <th>{{ producto.precio }}</th>
                                <th>{{ producto.marca }}</th>
                                <th>{{ producto.categoria }}</th>
                                <th>
                                    <v-btn-group>
                                        <v-btn
                                            icon="mdi-eye"
                                            color="indigo"
                                            @click="obtenerProducto(producto.id, 1)"
                                        ></v-btn>
                                        <v-btn
                                            icon="mdi-pencil"
                                            color="green"
                                            @click="obtenerProducto(producto.id, 2)"
                                        ></v-btn>
                                        <v-btn
                                            icon="mdi-delete"
                                            color="red"
                                            @click="eliminarProducto(producto.id)"
                                        ></v-btn>
                                    </v-btn-group>
                                </th>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-col>
        <!-- Modal para agregar producto -->
        <v-dialog v-model="dialogProducto" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Agregar Producto</span>
                </v-card-title>
                <v-card-text>
                    <!-- Formulario para agregar producto -->
                    <v-form>
                        <v-row>
                            <v-col cols="12" sm="6">
                                <v-file-input
                                    label="Imagen del producto"
                                    accept="image/*"
                                    color="indigo"
                                    clearable
                                    v-model="producto.imagen"
                                    @change="onFileChange"
                                    prepend-icon="mdi-camera"
                                ></v-file-input>
                                <v-img
                                    v-if="imagePreview"
                                    :src="imagePreview"
                                    max-height="150"
                                    max-width="100%"
                                    contain
                                    class="mb-4 mt-2"
                                ></v-img>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    label="Nombre"
                                    maxlength="50"
                                    counter
                                    color="indigo"
                                    clearable
                                    placeholder="Nombre del producto"
                                    v-model="producto.nombre"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    label="Cantidad"
                                    color="indigo"
                                    clearable
                                    placeholder="Cantidad del producto"
                                    v-model="producto.cantidad"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    label="Precio"
                                    type="number"
                                    color="indigo"
                                    clearable
                                    placeholder="Precio del producto"
                                    v-model="producto.precio"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    label="Descripción"
                                    color="indigo"
                                    clearable
                                    placeholder="Descripción del producto"
                                    v-model="producto.descripcion"
                                ></v-text-field>
                            </v-col>
                            <!-- Selector de Marca y Botón Agregar Marca -->
                            <v-col cols="12" sm="6">
                                <v-select
                                    color="indigo"
                                    label="Marca"
                                    :items="marcas"
                                    item-value="id"
                                    item-title="nombre"
                                    v-model="producto.fk_marca"
                                ></v-select>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-btn
                                    prepend-icon="mdi-factory"
                                    color="indigo"
                                    block
                                    @click="dialogMarca = true"
                                >
                                    Agregar Marca
                                </v-btn>
                            </v-col>
                            <!-- Selector de Categoría y Botón Agregar Categoría -->
                            <v-col cols="12" sm="6">
                                <v-select
                                    color="indigo"
                                    label="Categoría"
                                    :items="categorias"
                                    item-value="id"
                                    item-title="nombre"
                                    v-model="producto.fk_categoria"
                                ></v-select>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-btn
                                    prepend-icon="mdi-tag-plus"
                                    color="indigo"
                                    block
                                    @click="dialogCategoria = true"
                                >
                                    Agregar Categoría
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialogProducto = false">Cancelar</v-btn>
                    <v-btn color="blue darken-1" text @click="agregarProducto">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- Modal para agregar categoría -->
        <v-dialog
            v-model="dialogCategoria"
            transition="dialog-top-transition"
            width="500"
        >
            <v-card title="Agregar Categoría" subtitle="Ingrese los datos de la nueva categoría">
                <v-card-text>
                    <v-text-field
                        label="Nombre de la categoría"
                        maxlength="50"
                        counter
                        color="indigo"
                        clearable
                        placeholder="Nombre de la categoría"
                        v-model="nuevaCategoria.nombre"
                    ></v-text-field>
                    <v-btn
                        prepend-icon="mdi-check"
                        color="indigo"
                        block
                        @click="agregarCategoria"
                    >
                        Guardar
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- Modal para agregar marca -->
        <v-dialog
            v-model="dialogMarca"
            transition="dialog-top-transition"
            width="500"
        >
            <v-card title="Agregar Marca" subtitle="Ingrese los datos de la nueva marca">
                <v-card-text>
                    <v-text-field
                        label="Nombre de la marca"
                        maxlength="50"
                        counter
                        color="indigo"
                        clearable
                        placeholder="Nombre de la marca"
                        v-model="nuevaMarca.nombre"
                    ></v-text-field>
                    <v-btn
                        prepend-icon="mdi-check"
                        color="indigo"
                        block
                        @click="agregarMarca"
                    >
                        Guardar
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- Modal para ver producto -->
        <v-dialog
            v-model="dialogOne"
            transition="dialog-top-transition"
            width="500"
        >
            <v-card title="Ver Producto" subtitle="Datos del producto">
                <v-card-text>
                    <v-img
                        v-if="datos.imagen"
                        :src="datos.imagen"
                        max-height="150"
                        contain
                        class="mb-4 rounded"
                    ></v-img>
                    <v-list>
                        <v-list-item
                            prepend-icon="mdi-package-variant"
                            :title="datos.nombre"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-numeric"
                            :title="datos.cantidad"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-label"
                            :title="datos.descripcion"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-currency-usd"
                            :title="datos.precio"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-factory"
                            :title="datos.marca"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-tag"
                            :title="datos.categoria"
                        ></v-list-item>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="red" @click="dialogOne = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- Modal para editar producto -->
        <v-dialog
            v-model="dialogTwo"
            transition="dialog-top-transition"
            width="500"
        >
            <v-card title="Editar" subtitle="Datos del producto">
                <v-card-text>
                    <v-img
                        v-if="datos.imagen"
                        :src="datos.imagen"
                        max-height="150"
                        contain
                        class="mb-4 rounded"
                    ></v-img>
                    <v-text-field
                        label="Nombre"
                        maxlength="50"
                        counter
                        color="indigo"
                        clearable
                        placeholder="Nombre del producto"
                        v-model="datos.nombre"
                    ></v-text-field>
                    <v-text-field
                        label="Cantidad"
                        maxlength="50"
                        counter
                        color="indigo"
                        clearable
                        placeholder="Cantidad del producto"
                        v-model="datos.cantidad"
                    ></v-text-field>
                    <v-text-field
                        label="Descripción"
                        maxlength="50"
                        counter
                        color="indigo"
                        clearable
                        placeholder="Descripción del producto"
                        v-model="datos.descripcion"
                    ></v-text-field>
                    <v-text-field
                        label="Precio"
                        type="number"
                        color="indigo"
                        clearable
                        placeholder="Precio del producto"
                        v-model="datos.precio"
                    ></v-text-field>
                    <v-select
                        color="indigo"
                        label="Marca"
                        :items="marcas"
                        item-value="id"
                        item-title="nombre"
                        v-model="datos.fk_marca"
                    ></v-select>
                    <v-select
                        color="indigo"
                        label="Categoría"
                        :items="categorias"
                        item-value="id"
                        item-title="nombre"
                        v-model="datos.fk_categoria"
                    ></v-select>
                    <v-btn
                        prepend-icon="mdi-check"
                        color="indigo"
                        block
                        @click="modificarProducto(datos.id)"
                    >
                        Guardar
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script>
import axios from 'axios';
import Swal from 'sweetalert2';

const ruta = 'http://127.0.0.1:8000';

export default {
    name: 'ProductoView',
    data() {
        return {
            marcas: [],
            categorias: [],
            producto: {},
            productos: [],
            datos: {},
            dialogOne: false,
            dialogTwo: false,
            dialogCategoria: false,
            dialogMarca: false,
            dialogProducto: false,
            nuevaCategoria: { nombre: '' },
            nuevaMarca: { nombre: '' },
            imagePreview: null,
            filtroNombre: '',
            config: { headers: { 'Authorization': 'Bearer ' + this.$store.getters.getToken } }
        };
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
        obtenerMarcas() {
            axios.get(ruta + '/api/marcas', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.marcas = response.data.data;
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error));
        },
        obtenerCategorias() {
            axios.get(ruta + '/api/categorias', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.categorias = response.data.data;
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error));
        },
        agregarProducto() {
            let formData = new FormData();
            formData.append("nombre", this.producto.nombre);
            formData.append("cantidad", this.producto.cantidad);
            formData.append("descripcion", this.producto.descripcion);
            formData.append("precio", this.producto.precio);
            formData.append("fk_marca", this.producto.fk_marca);
            formData.append("fk_categoria", this.producto.fk_categoria);
            if (this.producto.imagen) {
                formData.append("imagen", this.producto.imagen);
            }
            axios.post(ruta + "/api/productos", formData, {
                headers: {
                    "Authorization": "Bearer " + this.$store.getters.getToken,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then(response => {
                if (response.data.code === 200) {
                    this.getAlert(response.data.data);
                    this.producto = {};
                    this.imagePreview = null;
                    this.obtenerProductos();
                    this.dialogProducto = false;
                }
            })
            .catch(error => {
                console.log("Ha ocurrido un error: " + error);
                this.getAlert("Error al agregar el producto");
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
        obtenerProducto(id, accion) {
            if (accion === 1) {
                this.dialogOne = true;
            } else {
                this.dialogTwo = true;
            }
            axios.get(ruta + `/api/productos/${id}`, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.datos = response.data.data;
                        if (this.datos.imagen) {
                            this.datos.imagen = ruta + '/storage/' + this.datos.imagen;
                        }
                    }
                })
                .catch(error => {
                    console.log('Ha ocurrido un error: ' + error);
                    this.getAlert("Error al obtener el producto");
                });
        },
        modificarProducto(id) {
            axios.put(ruta + `/api/productos/${id}`, this.datos, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data);
                        this.dialogTwo = false;
                        this.obtenerProductos();
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error));
        },
        eliminarProducto(id) {
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
                    axios.delete(ruta + `/api/productos/${id}`, this.config)
                        .then(response => {
                            if (response.data.code === 200) {
                                this.getAlert(response.data.data);
                                this.obtenerProductos();
                            }
                        })
                        .catch(error => {
                            console.log('Ha ocurrido un error: ' + error);
                            this.getAlert("Error al eliminar el producto");
                        });
                }
            });
        },
        onFileChange(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.producto.imagen = file;
                this.imagePreview = URL.createObjectURL(file);
            } else {
                this.getAlert("Por favor, selecciona un archivo de imagen válido.");
                this.producto.imagen = null;
                this.imagePreview = null;
            }
        },
        agregarCategoria() {
            axios.post(ruta + "/api/categorias", this.nuevaCategoria, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data);
                        this.nuevaCategoria = { nombre: '' };
                        this.dialogCategoria = false;
                        this.obtenerCategorias();
                    }
                })
                .catch(error => {
                    console.log("Ha ocurrido un error: " + error);
                    this.getAlert("Error al agregar la categoría");
                });
        },
        agregarMarca() {
            axios.post(ruta + "/api/marcas", this.nuevaMarca, this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.getAlert(response.data.data);
                        this.nuevaMarca = { nombre: '' };
                        this.dialogMarca = false;
                        this.obtenerMarcas();
                    }
                })
                .catch(error => {
                    console.log("Ha ocurrido un error: " + error);
                    this.getAlert("Error al agregar la marca");
                });
        }
    },
    computed: {
        productosFiltrados() {
            return this.productos.filter(producto => {
                return (
                    producto.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()) &&
                    (this.filtroCategoria === null || producto.fk_categoria === this.filtroCategoria) &&
                    (this.filtroMarca === null || producto.fk_marca === this.filtroMarca)
                );
            });
        }
    },
    created() {
        this.obtenerProductos();
        this.obtenerMarcas();
        this.obtenerCategorias();
    }
};
</script>

<style scoped>
.swal2-confirm {
    color: white !important;
}
</style>