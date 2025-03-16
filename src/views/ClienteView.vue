<template>
    <v-container fluid>
        <h1>Clientes</h1>
        <v-row>
            <!-- Formulario para agregar cliente -->
            <v-col xs="12" sm="3" md="3" lg="3" xl="3" xxl="3">
                <v-text-field label="Nombre" maxlength="50" counter
                color="indigo" clearable placeholder="Nombre del cliente" 
                v-model="cliente.nombre"
                ></v-text-field>
                <v-text-field label="Teléfono" maxlength="9" counter
                color="indigo" clearable placeholder="Teléfono del cliente" 
                v-model="cliente.telefono"
                ></v-text-field>
                <v-select color="indigo" label="País" 
                :items="paises" item-value="id" item-title="nombre" 
                v-model="cliente.fk_pais"
                ></v-select>
                <v-btn prepend-icon="mdi-check" color="indigo" block 
                @click="agregarCliente">Agregar</v-btn>
            </v-col>
            <!-- Tabla para mostrar clientes -->
            <v-col cols="9" xs="12" sm="9" md="9" lg="9" xl="9" xxl="9">
                <v-card>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>País</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(cliente, i) in clientes" :key="i">
                                    <th>{{ cliente.id }}</th>
                                    <th>{{ cliente.nombre }}</th>
                                    <th>{{ cliente.fk_pais }}</th>
                                    <th>
                                        <v-btn-group>
                                            <v-btn icon="mdi-eye" color="indigo" @click="obtenerCliente(cliente.id, 1)"></v-btn>
                                            <v-btn icon="mdi-pencil" color="green" @click="obtenerCliente(cliente.id, 2)"></v-btn>
                                            <v-btn icon="mdi-delete" color="red" @click="eliminarCliente(cliente.id)"></v-btn>
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
    <v-card title="Ver" subtitle="Datos del cliente">
        <v-card-text>
            <v-list>
                <v-list-item prepend-icon="mdi-account" :title="datos.nombre"></v-list-item>
                <v-list-item prepend-icon="mdi-phone" :title="datos.telefono"></v-list-item>
                <v-list-item prepend-icon="mdi-earth" :title="datos.pais"></v-list-item>
            </v-list> 
        </v-card-text>
    </v-card>
</v-dialog> 
<!-- Cuadro de diálogo para editar registro -->
<v-dialog v-model="dialogTwo" transition="dialog-top-transition" width="500">
    <v-card title="Editar" subtitle="Datos del cliente">
        <v-card-text>
            <v-text-field label="Nombre" maxlength="50" counter
            color="indigo" clearable placeholder="Nombre del cliente"
            v-model="datos.nombre"
            ></v-text-field>
            <v-text-field label="Teléfono" maxlength="9" counter
            color="indigo" clearable placeholder="Teléfono del cliente"
            v-model="datos.telefono"
            ></v-text-field>
            <v-select color="indigo" label="País" :items="paises"
            item-value="id" item-title="nombre" v-model="datos.fk_pais"
            ></v-select>
            <v-btn prepend-icon="mdi-check" color="indigo" block
            @click="modificarCliente(datos.id)">Guardar</v-btn>
        </v-card-text>
    </v-card>
</v-dialog> 
</template>    
<script>
import axios from 'axios'
import Swal from 'sweetalert2'//importar la bibliteca
const ruta ='http://127.0.0.1:8000'
export default {
    name: 'ClienteView',
    data(){
        return {
            paises: [],//almacenar los paises obtenidos del endpoint
            cliente: {},//para almacenar el cliente a registrar
            clientes: [],//para almacenar los clientes ontebidos del endpoint
            datos: {},//almacenar los datos del cliente obtenidos del endpoint
            dialogOne: false,//controlar el modal
            dialogTwo: false,//controlar modal de editar
            config: { headers: {'Authorization': 'Bearer '+this.$store.getters.getToken 
        } 
    }
        }
    },
    methods:{
        //MOSTRAR ALERTA
        getAlert(message){//mostar un mensaje elegante
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: message,
                showConfirmButton: false,
                timer: 1500
            });
        },
        //peticion para obtener paises
        obtenerPaises(){//peticion para obtener paises
            axios.get(ruta+'/api/pais/select', this.config)
            .then(response => {
                if(response.data.code == 200){
                    let res = response.data
                    this.paises = res.data
                }
            })
            .catch(error => console.log('Ha oxurrido un error '+error))
        },
        agregarCliente(){//peticion para registar clientes
            axios.post(ruta+'/api/cliente/store', this.cliente, this.config)
            .then(response => {
                if(response.data.code == 200){
                    //mostrar mensaje elegante
                    this.getAlert(response.data.data)
                    //limpiar el formulario
                    this.cliente = {}
                    this.obtenerClientes()//RECARGAR TABLA
                }
            })
            .catch(error => console.log('Ha ocurrido un error '+error))
        },
        obtenerClientes(){//peticion para obtener todos los clientes
            this.clientes = []
            axios.get(ruta+'/api/cliente/select', this.config)
            .then(response => {
                if(response.data.code == 200){
                    let res = response.data
                    this.clientes = res.data
                }
            })
            .catch(error => console.log('Ha ocurrido un error: '+error))
        },
        obtenerCliente(id, accion){//peticion para consultar los datos de un cliente
            if(accion == 1){//cambiar visivilidad del moda ver/editar
                this.dialogOne = true
            }else{
                //this.datos = {}
                this.dialogTwo = true
            }
            axios.get(ruta+`/api/cliente/find/${id}`, this.config)
            .then(response => {
                if(response.data.code == 200){
                    let res = response.data
                    this.datos = res.data
                }
            })
            .catch(error => console.log('Ha ocurrido un error: '+error))
        },
        modificarCliente(id){//peticion para actualizar cliente
            axios.put(ruta+`/api/cliente/update/${id}`, this.datos, this.config)
            .then(response => {
                if(response.data.code == 200){
                    //mostar mensaje elegante
                    this.getAlert(response.data.data)
                    this.dialogTwo = false//ocultar modal
                    this.obtenerClientes()//recargar tabla
                }
            })
            .catch(error => console.log('Ha ocurrido un error: '+error))
        },
        eliminarCliente(id){
            //preguntar antes de eliminar
            Swal.fire({
                title: "Estas seguro?",
                text: "La acción ya no podra revertirse!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si, eliminar!"
                }).then((result) => {
                if (result.isConfirmed) {
                    axios.delete(ruta+`/api/cliente/delete/${id}`, this.config)
                    .then(response => {
                        if(response.data.code == 200){
                            //mostar mensaje elegante
                            this.getAlert(response.data.data)
                            this.obtenerClientes()//recargar tabla
                        }
                    })
                    .catch(error => console.log('Ha ocurrido un error: '+error))
                }
                });
            
        }
    },
    created(){
        this.obtenerPaises()
        this.obtenerClientes()
    }
 }
</script>
<style scoped>
.swal2-confirm{
    color: white !important;
}
</style>