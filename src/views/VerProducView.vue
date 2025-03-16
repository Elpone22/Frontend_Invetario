<template>
    <v-container>
        <h1>Lista de Productos</h1>
        <v-row>
            <v-col v-for="producto in productos" :key="producto.id" cols="12" sm="6" md="4" lg="3">
                <v-card @click="verMovimientos(producto.id)" class="cursor-pointer">
                    <v-img v-if="producto.imagen" :src="producto.imagen" height="200px" contain></v-img>
                    <v-card-title>{{ producto.nombre }}</v-card-title>
                    <v-card-subtitle>Categoría: {{ producto.categoria }}</v-card-subtitle>
                    <v-card-text>
                        <p><strong>Descripción:</strong> {{ producto.descripcion }}</p>
                        <p><strong>Marca:</strong> {{ producto.marca }}</p>
                        <p><strong>Cantidad:</strong> {{ producto.cantidad }}</p>
                        <p><strong>Precio:</strong> ${{ producto.precio }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

const ruta = 'http://127.0.0.1:8000';

export default {
    name: 'VerProducView',
    data() {
        return {
            productos: [],
            config: { headers: { 'Authorization': 'Bearer ' + this.$store.getters.getToken } }
        };
    },
    methods: {
        obtenerProductos() {
            axios.get(ruta + '/api/productos', this.config)
                .then(response => {
                    if (response.data.code === 200) {
                        this.productos = response.data.data;
                    }
                })
                .catch(error => console.log(error));
        },
        verMovimientos(id) {
            this.$router.push({ name: 'Movimientos', params: { id } });
        }
    },
    created() {
        this.obtenerProductos();
        setInterval(this.obtenerProductos, 5000); // Actualiza la lista cada 5 segundos
    }
};
</script>

<style scoped>
.v-card {
    margin-bottom: 16px;
    transition: transform 0.2s;
    cursor: pointer;
}
.v-card:hover {
    transform: scale(1.05);
}
</style>
