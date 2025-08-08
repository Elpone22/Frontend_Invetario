<template>
  <v-container>
    <div v-if="!cargando && datosReporte.length === 0" class="text-center py-12">
      <v-icon size="64" color="grey lighten-1">mdi-database-remove</v-icon>
      <h3 class="text-h6 mt-4">No hay datos disponibles</h3>
      <p class="text-body-2 text--secondary">No se encontraron movimientos para mostrar</p>
      <v-btn color="primary" class="mt-4" @click="obtenerDatosReporte" :loading="cargando">
        <v-icon left>mdi-refresh</v-icon>
        Reintentar
      </v-btn>
    </div>
    
    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Reporte de Movimientos por Producto</span>
            <div>
              <v-btn color="primary" @click="exportarPDF" :loading="exportando" class="mr-2">
                <v-icon left>mdi-file-pdf</v-icon>
                Exportar PDF
              </v-btn>
              <v-btn color="secondary" @click="verDetallado">
                <v-icon left>mdi-chart-box-outline</v-icon>
                Ver Detallado
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <div class="chart-container">
                  <canvas ref="graficaBarras"></canvas>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="chart-container">
                  <canvas ref="graficaTorta"></canvas>
                </div>
              </v-col>
            </v-row>
            
            <v-data-table
              :headers="headers"
              :items="datosReporte"
              :loading="cargando"
              class="elevation-1 mt-4"
            >
              <template v-slot:item="{ item }">
                <tr>
                  <td>{{ item.producto }}</td>
                  <td class="text-center">
                    <v-chip color="green" dark>
                      {{ item.entradas }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip color="red" dark>
                      {{ item.salidas }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip color="primary">
                      {{ item.total_movimientos }}
                    </v-chip>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

// Configuración base de Axios
const  Url = 'http://127.0.0.1:8000';

export default {
  name: 'ReporteMovimientos',
  setup() {
    const router = useRouter();
    const cargando = ref(false);
    const exportando = ref(false);
    const datosReporte = ref([]);
    const graficaBarras = ref(null);
    const graficaTorta = ref(null);
    let chartBarras = null;
    let chartTorta = null;
    
    const mostrarError = (mensaje) => {
      console.error(mensaje);
      alert(`Error: ${mensaje}`);
      
      // Si estás usando Vuetify 3 con el plugin de notificaciones, descomenta esto:
      /*
      const { $toast } = useNuxtApp() || {};
      if ($toast) {
        $toast.error(mensaje, {
          position: 'top-right',
          timeout: 5000
        });
      } else {
        alert(`Error: ${mensaje}`);
      }
      */
      
    };

    const headers = [
      { title: 'Producto', value: 'producto' },
      { title: 'Entradas', value: 'entradas', align: 'center' },
      { title: 'Salidas', value: 'salidas', align: 'center' },
      { title: 'Total Movimientos', value: 'total_movimientos', align: 'center' },
    ];

    const colores = [
      '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
      '#5a5c69', '#858796', '#dddfeb', '#f8f9fc', '#5a5c69'
    ];

    const store = useStore();

    const obtenerDatosReporte = async () => {
      try {
        console.log('=== INICIANDO OBTENCIÓN DE DATOS ===');
        cargando.value = true;
        
        // Obtener el token del store de Vuex
        const token = store.getters.getToken;
        console.log('Token obtenido del store:', token ? '✅' : '❌ No encontrado');
        
        if (!token) {
          throw new Error('No se encontró el token de autenticación en el store');
        }
        
        // Agregar el token al header de autorización
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Realizando petición GET a: /api/reportes/movimientos-por-producto-detallado');
        
        try {
          const response = await axios.get(`${Url}/api/reportes/movimientos-por-producto-detallado`);
          console.log('Respuesta recibida - Estado:', response.status);
          console.log('Datos de respuesta:', response.data);
          
          if (response.data && (response.data.code === 200 || response.status === 200)) {
            const data = response.data.data || response.data;
            console.log('Datos procesados:', data);
            
            if (Array.isArray(data) && data.length > 0) {
              console.log(`Se recibieron ${data.length} registros`);
              datosReporte.value = data;
              console.log('Datos asignados a datosReporte:', datosReporte.value);
              actualizarGraficas();
            } else {
              console.warn('La respuesta no contiene datos o está vacía');
              mostrarError('No hay datos para mostrar');
            }
          } else {
            console.error('Respuesta inesperada del servidor:', response);
            mostrarError('Formato de respuesta inesperado del servidor');
          }
        } catch (error) {
          console.error('Error en la petición:', error);
          if (error.response) {
            // La petición fue hecha y el servidor respondió con un status code
            // que esta fuera del rango 2xx
            console.error('Datos de la respuesta de error:', error.response.data);
            console.error('Status de la respuesta:', error.response.status);
            console.error('Headers de la respuesta:', error.response.headers);
            mostrarError(`Error ${error.response.status}: ${error.response.data?.message || 'Error en el servidor'}`);
          } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('No se recibió respuesta del servidor:', error.request);
            mostrarError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
          } else {
            // Algo ocurrió en la configuración de la petición que generó un error
            console.error('Error al configurar la petición:', error.message);
            mostrarError(`Error: ${error.message}`);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del reporte:', error);
        if (error.response) {
          console.error('Respuesta del error:', error.response.data);
          console.error('Status del error:', error.response.status);
          mostrarError(`Error ${error.response.status}: ${error.response.data.message || 'Error en el servidor'}`);
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor');
          mostrarError('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
          console.error('Error al configurar la petición:', error.message);
          mostrarError('Error al procesar la solicitud');
        }
      } finally {
        cargando.value = false;
      }
    };

    const actualizarGraficas = () => {
      try {
        // Destruir gráficas existentes
        if (chartBarras) {
          chartBarras.destroy();
          chartBarras = null;
        }
        if (chartTorta) {
          chartTorta.destroy();
          chartTorta = null;
        }

        // Verificar que hay datos para mostrar
        if (!datosReporte.value || datosReporte.value.length === 0) {
          console.warn('No hay datos para mostrar en las gráficas');
          return;
        }

        // Preparar datos para las gráficas
        const etiquetas = datosReporte.value.map(item => item.producto);
        const entradas = datosReporte.value.map(item => parseInt(item.entradas) || 0);
        const salidas = datosReporte.value.map(item => parseInt(item.salidas) || 0);
        const totales = datosReporte.value.map(item => parseInt(item.total_movimientos) || 0);

        // Gráfica de barras
        if (graficaBarras.value) {
          const ctxBarras = graficaBarras.value.getContext('2d');
          if (ctxBarras) {
            chartBarras = new Chart(ctxBarras, {
              type: 'bar',
              data: {
                labels: etiquetas,
                datasets: [
                  {
                    label: 'Entradas',
                    data: entradas,
                    backgroundColor: '#1cc88a',
                    borderColor: '#1cc88a',
                    borderWidth: 1
                  },
                  {
                    label: 'Salidas',
                    data: salidas,
                    backgroundColor: '#e74a3b',
                    borderColor: '#e74a3b',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                },
                plugins: {
                  title: {
                    display: true,
                    text: 'Movimientos por Producto',
                    font: {
                      size: 16
                    }
                  },
                  legend: {
                    position: 'top',
                  }
                }
              }
            });
          }
        }

        // Gráfica de torta
        if (graficaTorta.value) {
          const ctxTorta = graficaTorta.value.getContext('2d');
          if (ctxTorta) {
            chartTorta = new Chart(ctxTorta, {
              type: 'doughnut',
              data: {
                labels: etiquetas,
                datasets: [{
                  data: totales,
                  backgroundColor: colores.slice(0, etiquetas.length),
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Distribución de Movimientos',
                    font: {
                      size: 16
                    }
                  },
                  legend: {
                    position: 'right',
                  }
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error al actualizar las gráficas:', error);
        mostrarError('Error al generar las gráficas');
      }
    };

    const verDetallado = () => {
      router.push('/reportes/movimientos-detallado');
    };

    const exportarPDF = async () => {
      exportando.value = true;
      
      try {
        // Obtener el token del store de Vuex
        const token = store.getters.getToken;
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        // Obtener el ID del primer producto para la generación del PDF
        if (!datosReporte.value || datosReporte.value.length === 0) {
          throw new Error('No hay datos de productos disponibles para generar el PDF');
        }
        
        const productoId = datosReporte.value[0]?.id;
        if (!productoId) {
          throw new Error('El producto seleccionado no tiene un ID válido');
        }
        
        console.log('Iniciando generación de PDF para producto ID:', productoId);
        
        // Configurar la URL con el parámetro producto_id
        const url = `${Url}/api/reportes/movimientos-por-producto?producto_id=${productoId}`;
        console.log('URL de la API:', url);
        
        // Realizar la petición con axios
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
            'X-Requested-With': 'XMLHttpRequest'
          },
          responseType: 'blob'  // Importante para manejar la respuesta como archivo binario
        });
        
        console.log('Respuesta recibida, tipo:', response.headers['content-type']);
        
        if (!response.data) {
          throw new Error('No se recibieron datos del servidor');
        }
        
        // Crear un enlace temporal para descargar el archivo
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.setAttribute('download', `reporte_movimientos_${productoId}_${new Date().toISOString().split('T')[0]}.pdf`);
        
        // Simular clic en el enlace para iniciar la descarga
        document.body.appendChild(link);
        link.click();
        
        // Limpiar después de la descarga
        setTimeout(() => {
          window.URL.revokeObjectURL(urlBlob);
          document.body.removeChild(link);
        }, 100);
        
        console.log('PDF generado y descarga iniciada');
        
      } catch (error) {
        console.error('Error al exportar PDF:', error);
        
        // Mostrar mensaje de error detallado
        let mensajeError = 'Error al generar el PDF';
        
        if (error.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          console.error('Error en la respuesta del servidor:', error.response.status, error.response.data);
          
          // Intentar leer el mensaje de error si es un blob
          if (error.response.data instanceof Blob) {
            const errorText = await error.response.data.text();
            console.error('Contenido del error (blob):', errorText);
            try {
              const errorJson = JSON.parse(errorText);
              mensajeError = errorJson.message || mensajeError;
            } catch (e) {
              mensajeError = errorText || mensajeError;
            }
          } else if (typeof error.response.data === 'string') {
            mensajeError = error.response.data;
          }
          
          mensajeError = `Error ${error.response.status}: ${mensajeError}`;
          
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error('No se recibió respuesta del servidor:', error.request);
          mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else {
          // Error al configurar la petición
          console.error('Error en la configuración de la petición:', error.message);
          mensajeError = `Error: ${error.message}`;
        }
        
        mostrarError(mensajeError);
      } finally {
        exportando.value = false;
      }
    };

    onMounted(async () => {
      console.log('Componente montado, registrando Chart.js...');
      try {
        // Registrar componentes de Chart.js
        Chart.register(...registerables);
        console.log('Chart.js registrado correctamente');
        
        // Obtener datos
        console.log('Solicitando datos...');
        await obtenerDatosReporte();
      } catch (error) {
        console.error('Error en onMounted:', error);
        mostrarError('Error al inicializar el componente');
      }
    });

    onBeforeUnmount(() => {
      // Limpiar gráficas al desmontar el componente
      if (chartBarras) chartBarras.destroy();
      if (chartTorta) chartTorta.destroy();
    });

    return {
      cargando,
      exportando,
      datosReporte,
      headers,
      graficaBarras,
      graficaTorta,
      verDetallado,
      exportarPDF
    };
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>
