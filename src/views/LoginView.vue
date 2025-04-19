<template> 
    <v-container fluid> 
        <v-row justify="center"> 
            <v-col xs="12" sm="4" md="4" lg="4" xl="4" xxl="4"> 
                <v-card> 
                    <v-img                
                    height="150"  
                    cover 
                    src="https://www.salesforce.com/content/dam/web/es_mx/blog/seguimiento-de-ventas-como-hacer.jpg"> 
                    </v-img> 
                    <v-card-text> 
                        <h2 class="text-blue-grey-darken-2">Sistema de Ventas</h2> 
                        <p class="text-blue-grey-darken-2">Login</p> 
                        <br> 
                        <v-form> 
                            <v-text-field 
                            label="Correo" 
                            placeholder="correo@ventaxperto.com" 
                            counter 
                            maxlength="70" 
                            color="indigo"                         
                            clearable 
                            prepend-inner-icon="mdi-email" 
                            v-model="usuario.email" 
                            ></v-text-field> 
                            <v-text-field 
                            label="Contraseña" 
                            placeholder="*********" 
                            counter 
                            maxlength="15" 
                            color="indigo" 
                            clearable 
                            type="password" 
                            prepend-inner-icon="mdi-key" 
                            v-model="usuario.password" 
                            ></v-text-field> 
                            <v-btn  
                            color="indigo" 
                            block 
                            @click="login" 
                            >Iniciar sesión</v-btn> 
                        </v-form>                         
                    </v-card-text> 
                </v-card> 
            </v-col> 
        </v-row> 
        <!-- Alerta --> 
        <v-snackbar 
        :timeout="1500" 
        color="red-darken-4" 
        v-model="alertaEstado" 
        > 
        {{ alertaMensaje }} 
        </v-snackbar> 
    </v-container> 
</template> 
 
<script> 
// Importar axios 
const ruta = 'http://127.0.0.1:8000';
import axios from 'axios' 
 
export default { 
    name: 'LoginView', 
    data(){ 
        return { 
            // Variable de formulario 
            usuario: { 
                email: '', 
                password: '' 
            }, 
            // Variables para controlar la alerta 
            alertaEstado: false, 
            alertaMensaje: '' 
        } 
    }, 
    methods: { 
        // Petición para realizar login 
        login(){ 
            axios.post(ruta+'/api/user/login', this.usuario) 
            .then(response => {
            // Verificar estructura de respuesta
            if (!response || !response.data) {
            throw new Error('Respuesta inválida del servidor');
            }

            const responseData = response.data;
            
            // Validar estructura mínima esperada
            if (!responseData.token || !responseData.data?.id) {
            console.error('Estructura de respuesta inesperada:', responseData);
            throw new Error('Datos de usuario incompletos en la respuesta');
            }

            // Guardar en store
            this.$store.dispatch('login', responseData)
            .then(() => {
                this.$router.push('/welcome');
            })
            .catch(error => {
                console.error('Error al guardar sesión:', error);
                this.error = 'Error al iniciar sesión. Intente nuevamente.';
            });
        })
        .catch(error => {
            // Manejo mejorado de errores
            let errorMessage = 'Error al iniciar sesión';
            
            if (error.response) {
            // Error de servidor (4xx, 5xx)
            errorMessage = error.response.data?.message || 
                            `Error ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
            // No se recibió respuesta
            errorMessage = 'No se recibió respuesta del servidor';
            } else {
            // Error en la configuración de la petición
            errorMessage = error.message || 'Error al configurar la petición';
            }

            console.error('Error completo:', error);
            this.error = errorMessage;
        });
        } 
    } 
} 
</script>