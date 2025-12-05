import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EventosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  //Agregar chartjs-plugin-datalabels
  //Variables

  public total_user: any = {};

  //Histograma
  // --- Gráfica Lineal: Eventos por Mes ---
  lineChartData: any = {
    labels: [], // Se llenará dinámicamente
    datasets: [
      {
        data: [], // Se llenará dinámicamente
        label: 'Eventos por Mes',
        backgroundColor: '#f8060662'
      }
    ]
  };
  lineChartOption = { responsive: false };
  lineChartPlugins = [ DatalabelsPlugin ];

  // --- Gráfica de Barras: Eventos por Tipo ---
  barChartData: any = {
    labels: [], // Se llenará dinámicamente
    datasets: [
      {
        data: [],
        label: 'Eventos por Tipo',
        backgroundColor: [
          '#e8a45cff',
          '#ffe944ff',
          '#5098bcff',
          '#b45fb0ff',
          '#5bb56cff'
        ]
      }
    ]
  };
  barChartOption = { responsive: false };
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[89, 34, 43],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#ffe344ff',
          '#c58ec6ff',
          '#97bc75ff'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[89, 34, 43],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#ee9f4bff',
          '#6a97d0ff',
          '#78cfcfff'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerDatosEventos();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Lógica de actualización de gráficas 
        const newData = [
          this.total_user.admins,
          this.total_user.maestros,
          this.total_user.alumnos
        ];

        this.pieChartData = { ...this.pieChartData, datasets: [{ ...this.pieChartData.datasets[0], data: newData }] };
        this.doughnutChartData = { ...this.doughnutChartData, datasets: [{ ...this.doughnutChartData.datasets[0], data: newData }] };

      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);

        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

  public obtenerDatosEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (eventos: any[]) => {
        console.log("Eventos obtenidos:", eventos);
        this.procesarGraficasEventos(eventos);
      },
      (error) => {
        console.error("Error al obtener eventos:", error);
      }
    );
  }

  public procesarGraficasEventos(eventos: any[]) {
    // 1. Procesar para Gráfica de BARRAS (Por Tipo de Evento)
    const conteoTipos: any = {};
    
    eventos.forEach(evento => {
      const tipo = evento.tipo_evento || 'Sin Tipo';
      conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
    });

    const labelsBarras = Object.keys(conteoTipos);
    const dataBarras = Object.values(conteoTipos);

    this.barChartData = {
      labels: labelsBarras,
      datasets: [{
        ...this.barChartData.datasets[0],
        data: dataBarras,
        label: 'Cantidad por Tipo'
      }]
    };

    // 2. Procesar para Gráfica LINEAL (Por Mes)
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const conteoMeses = new Array(12).fill(0);

    eventos.forEach(evento => {
      // Asumiendo que evento.fecha viene en formato ISO o fecha válida (YYYY-MM-DD)
      const fecha = new Date(evento.fecha);
      const mesIndex = fecha.getMonth(); // 0 = Enero, 11 = Diciembre
      
      // Validamos que sea una fecha válida
      if (!isNaN(mesIndex)) {
        conteoMeses[mesIndex]++;
      }
    });

    this.lineChartData = {
      labels: meses,
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: conteoMeses,
        label: 'Eventos por Mes'
      }]
    };
  }

}