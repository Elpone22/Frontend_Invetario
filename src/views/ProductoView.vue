<!-- eslint-disable no-undef -->
<template>
    <v-container fluid>
        <h1>Productos</h1>
        <v-row>
            <!-- Formulario para agregar producto -->
            <v-col xs="12" sm="3" md="3" lg="3" xl="3" xxl="3">
                <!-- Selector de imagen con vista previa -->
                <v-file-input
                    label="Imagen del producto"
                    accept="image/*"
                    color="indigo"
                    clearable
                    v-model="producto.imagen"
                    @change="onFileChange"
                    prepend-icon="mdi-camera"
                ></v-file-input>

                <!-- Vista previa de la imagen -->
                <v-img
                    v-if="imagePreview"
                    :src="imagePreview"
                    max-height="150"
                    contain
                    class="mb-4"
                ></v-img>

                <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre del producto" 
                v-model="producto.nombre"
                ></v-text-field>

                <v-text-field label="Cantidad"  color="indigo"
                clearable placeholder="cantidad del producto" 
                v-model="producto.cantidad"
                ></v-text-field>

                <v-text-field label="Descripcion"  color="indigo"
                clearable placeholder="descripcion del producto" 
                v-model="producto.descripcion"
                ></v-text-field>

                <v-text-field label="Precio" type="number" color="indigo"
                clearable placeholder="Precio del producto" 
                v-model="producto.precio"
                ></v-text-field>
                
                <!-- Selector de Marca -->
                <v-select color="indigo" label="Marca" 
                :items="marcas" item-value="id" item-title="nombre" 
                v-model="producto.fk_marca"
                ></v-select>

                <!-- Selector de Categoría -->
                <v-select color="indigo" label="Categoría" 
                :items="categorias" item-value="id" item-title="nombre" 
                v-model="producto.fk_categoria"
                ></v-select>
                
                <v-btn prepend-icon="mdi-check" color="indigo" block 
                @click="agregarProducto">Agregar</v-btn>
            </v-col>
            
            <!-- Tabla para mostrar productos -->
            <v-col cols="9" xs="12" sm="9" md="9" lg="9" xl="9" xxl="9">
                <v-card>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Cantidad</th>
                                    <th>Descripcion</th>
                                    <th>Precio</th>
                                    <th>Marca</th>
                                    <th>Categoría</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(producto, i) in productos" :key="i">
                                    <th>{{ producto.id }}</th>
                                    <td>
                                        <v-img v-if="producto.imagen" :src="producto.imagen" 
                                        width="50" height="50"></v-img>
                                    </td>
                                    
                                    <th>{{ producto.nombre }}</th>
                                    <th>{{ producto.cantidad }}</th>
                                    <th>{{ producto.descripcion }}</th>
                                    <th>{{ producto.precio }}</th>
                                    <th>{{ producto.marca }}</th>
                                    <th>{{ producto.categoria }}</th>
                                    <th>
                                        <v-btn-group>
                                            <v-btn icon="mdi-eye" color="indigo" @click="obtenerProducto(producto.id, 1)"></v-btn>
                                            <v-btn icon="mdi-pencil" color="green" @click="obtenerProducto(producto.id, 2)"></v-btn>
                                            <v-btn icon="mdi-delete" color="red" @click="eliminarProducto(producto.id)"></v-btn>
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
    <v-card title="Ver Producto" subtitle="Datos del producto">
        <v-card-text>
            <!-- Mostrar imagen si existe -->
            <v-img
                v-if="datos.imagen"
                :src="datos.imagen"
                max-height="150"
                contain
                class="mb-4 rounded"
            ></v-img>

            <v-list>
                <v-list-item prepend-icon="mdi-package-variant" :title="datos.nombre"></v-list-item>
                <v-list-item prepend-icon="mdi-numeric" :title="datos.cantidad"></v-list-item>
                <v-list-item prepend-icon="mdi-label" :title="datos.descripcion"></v-list-item>
                <v-list-item prepend-icon="mdi-currency-usd" :title="datos.precio"></v-list-item>
                <v-list-item prepend-icon="mdi-factory" :title="datos.marca"></v-list-item>
                <v-list-item prepend-icon="mdi-tag" :title="datos.categoria"></v-list-item>
            </v-list>
        </v-card-text>
        <v-card-actions>
            <v-btn color="red" @click="dialogOne = false">Cerrar</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>

   <!-- Cuadro de diálogo para editar registro -->
<v-dialog v-model="dialogTwo" transition="dialog-top-transition" width="500">
    <v-card title="Editar" subtitle="Datos del producto">
        <v-card-text>
            <!-- Mostrar la imagen actual -->
            <v-img
                v-if="datos.imagen"
                :src="datos.imagen"
                max-height="150"
                contain
                class="mb-4 rounded"
            ></v-img>

            <!-- Campo para seleccionar una nueva imagen  -->
            <!-- <v-file-input
                label="Imagen del producto"
                accept="image/*"
                color="indigo"
                clearable
                v-model="producto.imagen"
                @change="onFileChange"
                prepend-icon="mdi-camera"
            ></v-file-input> -->

            <!-- Vista previa de la nueva imagen seleccionada -->
            <!-- <v-img
                v-if="imagePreview"
                :src="imagePreview"
                max-height="50"
                contain
                class="mb-4"
            ></v-img> -->

            <!-- Campos del formulario -->
            <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre del producto"
                v-model="datos.nombre"
            ></v-text-field>
            <v-text-field label="Cantidad" maxlength="50" counter
                color="indigo" clearable placeholder="cantidad del producto"
                v-model="datos.cantidad"
            ></v-text-field>
            <v-text-field label="Descripcion" maxlength="50" counter
                color="indigo" clearable placeholder="descripcion del producto"
                v-model="datos.descripcion"
            ></v-text-field>
            <v-text-field label="Precio" type="number" color="indigo"
                clearable placeholder="Precio del producto"
                v-model="datos.precio"
            ></v-text-field>
            <v-select color="indigo" label="Marca" :items="marcas"
                item-value="id" item-title="nombre" v-model="datos.fk_marca"
            ></v-select>
            <v-select color="indigo" label="Categoría" :items="categorias"
                item-value="id" item-title="nombre" v-model="datos.fk_categoria"
            ></v-select>

            <!-- Botón para guardar cambios -->
            <v-btn prepend-icon="mdi-check" color="indigo" block
                @click="modificarProducto(datos.id)">
                Guardar
            </v-btn>
        </v-card-text>
    </v-card>
</v-dialog> 
    
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

const ruta = 'http://127.0.0.1:8000'

export default {
    name: 'ProductoView',
    data() {
        return {
            marcas: [],          // Almacena las marcas obtenidas del endpoint
            categorias: [],      // Almacena las categorías obtenidas del endpoint
            producto: {},        // Almacena el producto a registrar
            productos: [],       // Almacena los productos obtenidos del endpoint
            datos: {},           // Almacena los datos del producto seleccionado
            dialogOne: false,    // Controlar modal de vista
            dialogTwo: false,    // Controlar modal de edición
            imagePreview: null, // Vista previa de la imagen
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
        // Obtener marcas
        obtenerMarcas() {
            axios.get(ruta + '/api/marcas', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.marcas = response.data.data
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Obtener categorías
        obtenerCategorias() {
            axios.get(ruta + '/api/categorias', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.categorias = response.data.data
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Agregar producto
        agregarProducto() {
            let formData = new FormData();
            formData.append("nombre", this.producto.nombre);
            formData.append("cantidad", this.producto.cantidad);
            formData.append("descripcion", this.producto.descripcion);
            formData.append("precio", this.producto.precio);
            formData.append("fk_marca", this.producto.fk_marca);
            formData.append("fk_categoria", this.producto.fk_categoria);
            
            // Si hay una imagen seleccionada
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
                    this.producto = {}; // Limpiar el formulario
                    this.imagePreview = null; // Limpiar la vista previa
                    this.obtenerProductos(); // Recargar tabla
                }
            })
            .catch(error => {
                console.log("Ha ocurrido un error: " + error);
                this.getAlert("Error al agregar el producto");
            });
        },

        // Obtener todos los productos
        obtenerProductos() {
            axios.get(ruta + '/api/productos', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.productos = response.data.data
                    }
                })
                .catch(error => console.log('Ha ocurrido un error: ' + error))
        },
        // Obtener un producto
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
                        // Generar la URL completa de la imagen
                        if (this.datos.imagen) {
                            this.datos.imagen = ruta +'/storage/' + this.datos.imagen;
                        }
                    }
                })
                .catch(error => {
                    console.log('Ha ocurrido un error: ' + error);
                    this.getAlert("Error al obtener el producto");
                });
        },
        // Modificar producto
        modificarProducto(id) {
        // Crear un objeto FormData para enviar la imagen
        let formData = new FormData();
        formData.append("nombre", this.datos.nombre);
        formData.append("cantidad", this.datos.cantidad);
        formData.append("descripcion", this.datos.descripcion);
        formData.append("precio", this.datos.precio);
        formData.append("fk_marca", this.datos.fk_marca);
        formData.append("fk_categoria", this.datos.fk_categoria);

        // Si hay una nueva imagen seleccionada
        if (this.datos.imagen && this.datos.imagen instanceof File) {
            formData.append("storage", this.datos.imagen);
        }

        // Enviar la solicitud PUT con FormData
        axios.post(ruta + `/api/productos/${id}`, formData, {
            headers: {
                "Authorization": "Bearer " + this.$store.getters.getToken,
                "Content-Type": "multipart/form-data",
            },
        })
        .then(response => {
            if (response.data.code === 200) {
                this.getAlert(response.data.data);
                this.dialogTwo = false; // Ocultar modal
                this.obtenerProductos(); // Recargar tabla
            }
        })
        .catch(error => {
            console.log('Ha ocurrido un error: ' + error);
            this.getAlert("Error al actualizar el producto");
        });
    },
        // Eliminar producto
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
                            this.obtenerProductos(); // Recargar tabla
                        }
                    })
                    .catch(error => {
                        console.log('Ha ocurrido un error: ' + error);
                        this.getAlert("Error al eliminar el producto");
                    });
            }
        });
    },
        // Manejar cambio de archivo
        onFileChange(event) {
                const file = event.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.producto.imagen = file;
                    this.imagePreview = URL.createObjectURL(file); // Crear una URL para la vista previa
                } else {
                    this.getAlert("Por favor, selecciona un archivo de imagen válido.");
                    this.producto.imagen = null;
                    this.imagePreview = null;
                }
            }
        },
    created() {
        this.obtenerProductos()
        this.obtenerMarcas()
        this.obtenerCategorias()
    }
}
</script>

<style scoped>
.swal2-confirm {
    color: white !important;
}
</style>