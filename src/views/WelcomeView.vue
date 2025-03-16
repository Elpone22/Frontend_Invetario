<template>
    <v-container fluid>
        <v-card title="Sistema de Inventario" :subtitle="`Bienvenid@ ${this.$store.getters.getUsuario}`">
            <v-img src="https://www.g4s.com/es-gt/-/media/g4s/guatemala/images/imagenes-generales/fel-100.ashx"></v-img>
        </v-card>
    </v-container>
</template>
    
<script>
export default {
    name: 'WelcomeView'
}
</script>