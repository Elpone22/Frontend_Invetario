<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Reporte Detallado de Movimientos por Producto</span>
            <div>
              <v-btn color="primary" @click="exportarPDF" :loading="exportando" class="mr-2">
                <v-icon left>mdi-file-pdf</v-icon>
                Exportar PDF
              </v-btn>
              <v-btn color="secondary" @click="regresar">
                <v-icon left>mdi-arrow-left</v-icon>
                Regresar
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-text>
            <!-- Filtros -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="productoSeleccionado"
                  :items="productos"
                  item-title="nombre"
                  item-value="id"
                  label="Selecciona un producto"
                  clearable
                  density="compact"
                  return-object
                  @update:model-value="filtrarDatos"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3">
                <v-menu
                  v-model="menuFechaInicio"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="fechaInicio"
                      label="Fecha Inicio"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      hide-details
                      clearable
                      @click:clear="fechaInicio = ''; filtrarDatos()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="fechaInicio"
                    @update:modelValue="onFechaInicioSelected"
                    :max="fechaFin || null"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3">
                <v-menu
                  v-model="menuFechaFin"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="fechaFin"
                      label="Fecha Fin"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      hide-details
                      clearable
                      @click:clear="fechaFin = ''; filtrarDatos()"
                      :min="fechaInicio || null"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="fechaFin"
                    @update:modelValue="onFechaFinSelected"
                    :min="fechaInicio || null"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <!-- Tabla de datos -->
            <v-data-table
              :headers="headers"
              :items="datosFiltrados"
              :loading="cargando"
              class="elevation-1"
              :items-per-page="10"
              :items-per-page-options="[10, 20, 50, 100]"
              :loading-text="'Cargando datos...'"
              no-data-text="No hay datos disponibles"
              :server-items-length="datosFiltrados.length"
            >
              <template v-slot:item="{ item }">
                <tr>
                  <td>{{ formatearFecha(item.fecha) }}</td>
                  <td>{{ item.producto || item.nombre || 'N/A' }}</td>
                  <td>
                    <v-chip :color="item.tipoMov === 'entrada' ? 'green' : 'red'" dark small>
                      {{ item.tipoMov === 'entrada' ? 'Entrada' : 'Salida' }}
                    </v-chip>
                  </td>
                  <td>
                    <span :class="{'text-green': item.tipoMov === 'entrada', 'text-red': item.tipoMov === 'salida'}">
                      {{ item.tipoMov === 'entrada' ? '+' : '-' }}{{ item.cantidad || 0 }}
                    </span>
                  </td>
                  <td>{{ item.usuario || item.user?.name || 'Sistema' }}</td>
                </tr>
              </template>
              
              <template v-slot:no-data>
                <v-alert type="info" class="my-4">
                  No hay datos disponibles para mostrar.
                </v-alert>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

// Manejar errores de ResizeObserver
const resizeObserverErr = window.onerror || (() => {});
window.onerror = (err, ...args) => {
  if (err.includes('ResizeObserver')) {
    return false; // Suprime el error de ResizeObserver
  }
  return resizeObserverErr(err, ...args);
};

// Configuración de la URL de la API
const ruta = 'http://127.0.0.1:8000';

export default {
  name: 'ReporteMovimientosDetallado',
  setup() {
    const router = useRouter();
    const cargando = ref(false);
    const exportando = ref(false);
    const datosReporte = ref([]);
    const productos = ref([]);
    const productoSeleccionado = ref(null);
    const menuFechaInicio = ref(false);
    const menuFechaFin = ref(false);
    const fechaInicio = ref('');
    const fechaFin = ref('');

    // Cargar datos cuando el componente se monta
    onMounted(() => {
      // Establecer fechas por defecto (últimos 30 días)
      const fechaFinObj = new Date();
      const fechaInicioObj = new Date();
      fechaInicioObj.setDate(fechaInicioObj.getDate() - 30);
      
      fechaInicio.value = fechaInicioObj.toISOString().split('T')[0];
      fechaFin.value = fechaFinObj.toISOString().split('T')[0];
      
      obtenerDatosReporte();
    });

    const headers = [
      { title: 'Fecha', key: 'fecha', sortable: true, value: 'fecha' },
      { title: 'Producto', key: 'producto', sortable: true, value: 'producto' },
      { title: 'Tipo de Movimiento', key: 'tipoMov', sortable: true, value: 'tipoMov' },
      { title: 'Cantidad', key: 'cantidad', sortable: true, align: 'center', value: 'cantidad' },
      { title: 'Usuario', key: 'usuario', sortable: true, value: 'usuario' },
    ];

    const obtenerDatosReporte = async () => {
      try {
        cargando.value = true;
        datosReporte.value = [];
        productos.value = [];
        
        const params = {};
        
        if (fechaInicio.value) {
          const fechaInicioObj = new Date(fechaInicio.value);
          params.fecha_inicio = fechaInicioObj.toISOString().split('T')[0];
        }
        
        if (fechaFin.value) {
          const fechaFinObj = new Date(fechaFin.value);
          fechaFinObj.setDate(fechaFinObj.getDate() + 1);
          params.fecha_fin = fechaFinObj.toISOString().split('T')[0];
        }
        
        const [movimientosResponse, productosResponse] = await Promise.all([
          axios.get(`${ruta}/api/reportes/movimientos-por-producto-detallado`, { params }),
          axios.get(`${ruta}/api/productos`).catch(() => ({ data: [] }))
        ]);
        
        // Procesar productos
        if (productosResponse?.data) {
          const productosData = Array.isArray(productosResponse.data) 
            ? productosResponse.data 
            : (productosResponse.data?.data || []);
            
          productos.value = productosData.map(p => ({
            id: p.id,
            nombre: p.nombre || p.name || 'Producto sin nombre',
            ...p
          }));
        }
        
        // Procesar movimientos
        if (movimientosResponse?.data) {
          let datos = [];
          
          if (Array.isArray(movimientosResponse.data)) {
            datos = movimientosResponse.data;
          } else if (movimientosResponse.data.code === 200 && Array.isArray(movimientosResponse.data.data)) {
            datos = movimientosResponse.data.data;
          } else if (Array.isArray(movimientosResponse.data.data)) {
            datos = movimientosResponse.data.data;
          } else if (movimientosResponse.data.data) {
            datos = [movimientosResponse.data.data];
          }
          
          datosReporte.value = datos.map(item => {
            const movimiento = {
              id: item.id || Math.random().toString(36).substr(2, 9),
              fecha: item.fecha || new Date().toISOString(),
              producto: item.producto || item.nombre || 'Producto desconocido',
              tipoMov: (item.tipoMov || '').toLowerCase(),
              cantidad: parseFloat(item.cantidad) || 0,
              usuario: item.usuario || item.user?.name || 'Sistema',
              ...item,
              producto_id: item.producto_id || item.fk_productos,
              fk_productos: item.fk_productos || item.producto_id
            };
            
            if (movimiento.tipoMov !== 'entrada' && movimiento.tipoMov !== 'salida') {
              if (movimiento.cantidad < 0) {
                movimiento.tipoMov = 'entrada';
                movimiento.cantidad = Math.abs(movimiento.cantidad);
              } else if (movimiento.cantidad > 0) {
                movimiento.tipoMov = 'salida';
              } else {
                movimiento.tipoMov = 'entrada';
              }
            } else if (movimiento.tipoMov === 'entrada' && movimiento.cantidad < 0) {
              movimiento.cantidad = Math.abs(movimiento.cantidad);
            }
            
            return movimiento;
          });
        }
      } catch (error) {
        console.error('Error al obtener datos del reporte:', error);
        mostrarError('Error al cargar los datos del reporte');
      } finally {
        cargando.value = false;
      }
    };

    const formatearFecha = (fecha) => {
      if (!fecha) return '';
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(fecha).toLocaleDateString('es-MX', options);
    };

    const onFechaInicioSelected = () => {
      menuFechaInicio.value = false;
      filtrarDatos();
    };

    const onFechaFinSelected = () => {
      menuFechaFin.value = false;
      filtrarDatos();
    };

    const filtrarDatos = async () => {
      try {
        cargando.value = true;
        const params = {};
        
        if (productoSeleccionado.value) {
          params.producto_id = typeof productoSeleccionado.value === 'object' 
            ? productoSeleccionado.value.id 
            : productoSeleccionado.value;
        }
        
        if (fechaInicio.value) {
          const fechaInicioObj = new Date(fechaInicio.value);
          params.fecha_inicio = fechaInicioObj.toISOString().split('T')[0];
        }
        
        if (fechaFin.value) {
          const fechaFinObj = new Date(fechaFin.value);
          fechaFinObj.setDate(fechaFinObj.getDate() + 1);
          params.fecha_fin = fechaFinObj.toISOString().split('T')[0];
        }
        
        const response = await axios.get(`${ruta}/api/reportes/movimientos-por-producto-detallado`, { params });
        datosReporte.value = response.data?.data || [];
      } catch (error) {
        console.error('Error al filtrar datos:', error);
        mostrarError('Error al filtrar los datos');
      } finally {
        cargando.value = false;
      }
    };

    const datosFiltrados = computed(() => {
      if (!Array.isArray(datosReporte.value) || datosReporte.value.length === 0) {
        return [];
      }
      
      let filtrados = [...datosReporte.value];
      
      if (productoSeleccionado.value) {
        const productoId = productoSeleccionado.value.id || productoSeleccionado.value;
        filtrados = filtrados.filter(item => {
          const itemProductoId = item.producto_id || item.fk_productos || 
                               (item.producto && (item.producto.id || item.producto)) ||
                               (item.raw && (item.raw.producto_id || item.raw.fk_productos));
          
          return itemProductoId?.toString() === productoId.toString();
        });
      }
      
      if (fechaInicio.value) {
        const fechaInicioObj = new Date(fechaInicio.value);
        fechaInicioObj.setHours(0, 0, 0, 0);
        filtrados = filtrados.filter(item => {
          if (!item.fecha) return false;
          return new Date(item.fecha) >= fechaInicioObj;
        });
      }
      
      if (fechaFin.value) {
        const fechaFinObj = new Date(fechaFin.value);
        fechaFinObj.setHours(23, 59, 59, 999);
        filtrados = filtrados.filter(item => {
          if (!item.fecha) return false;
          return new Date(item.fecha) <= fechaFinObj;
        });
      }
      
      return filtrados;
    });

    const exportarPDF = async () => {
  try {
    exportando.value = true;
    
    // Crear documento PDF en orientación horizontal
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    
    // Título del reporte
    doc.setFontSize(18);
    doc.text('Reporte Detallado de Movimientos de Inventario', 14, 20);
    
    // Filtros aplicados
    doc.setFontSize(10);
    let filtros = [];
    
    if (productoSeleccionado.value) {
      const nombreProducto = typeof productoSeleccionado.value === 'object' 
        ? productoSeleccionado.value.nombre 
        : 'Producto seleccionado';
      filtros.push(`Producto: ${nombreProducto}`);
    }
    
    if (fechaInicio.value) {
      filtros.push(`Desde: ${formatearFecha(fechaInicio.value)}`);
    }
    
    if (fechaFin.value) {
      filtros.push(`Hasta: ${formatearFecha(fechaFin.value)}`);
    }
    
    if (filtros.length > 0) {
      doc.text(`Filtros: ${filtros.join(' | ')}`, 14, 30);
    }
    
    // Preparar datos para la tabla
    
    const datosTabla = datosFiltrados.value.map(item => {
      const tipo = (item.tipoMov === 'entrada' || item.cantidad < 0) ? 'Entrada' : 'Salida';
      const cantidad = parseFloat(item.cantidad) || 0;
      const cantidadFormateada = (tipo === 'Entrada' ? '+' : '-') + ' ' + Math.abs(cantidad).toFixed(2);
      
      return [
        formatearFecha(item.fecha),
        item.producto || item.nombre || 'N/A',
        tipo,
        cantidadFormateada,
        item.usuario || item.user?.name || 'N/A'
      ];
    });
    
    // Usar autoTable directamente
    autoTable(doc, {
      head: [['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario']],
      body: datosTabla,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [41, 98, 255],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 25 },  // Fecha
        1: { cellWidth: 'auto' }, // Producto
        2: { cellWidth: 20 },  // Tipo
        3: { cellWidth: 20, halign: 'right' }, // Cantidad
        4: { cellWidth: 40 }   // Usuario
      },
      didParseCell: function(data) {
        if (data.section === 'body') {
          if (data.column.index === 2) { // Columna de tipo
            data.cell.styles.textColor = data.cell.text[0] === 'Entrada' ? [0, 150, 0] : [255, 0, 0];
          }
          if (data.column.index === 3) { // Columna de cantidad
            data.cell.styles.textColor = data.cell.text[0] === '+' ? [0, 150, 0] : [255, 0, 0];
          }
        }
      }
    });
    
    // Guardar el PDF
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reporte_Movimientos_${fechaActual}.pdf`;
    doc.save(nombreArchivo);
    
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    mostrarError('Error al generar el archivo PDF: ' + (error.message || 'Error desconocido'));
  } finally {
    exportando.value = false;
  }
};
    const mostrarError = (mensaje) => {
      console.error(mensaje);
      alert(`Error: ${mensaje}`);
    };

    const regresar = () => {
      router.push('/reportes/movimientos');
    };

    return {
      cargando,
      exportando,
      datosReporte,
      headers,
      productos,
      productoSeleccionado,
      menuFechaInicio,
      menuFechaFin,
      fechaInicio,
      fechaFin,
      datosFiltrados,
      obtenerDatosReporte,
      formatearFecha,
      filtrarDatos,
      exportarPDF,
      regresar,
      onFechaInicioSelected,
      onFechaFinSelected
    };
  }
};
</script>

<style scoped>
.text-green {
  color: #4CAF50;
  font-weight: bold;
}

.text-red {
  color: #F44336;
  font-weight: bold;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>