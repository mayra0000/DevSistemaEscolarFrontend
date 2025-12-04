import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';

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
  lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data:[89, 34, 43, 54, 28, 74, 93],
        label: 'Registro de materias',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data:[34, 43, 54, 28, 74],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#e8a45cff',
          '#ffe944ff',
          '#5098bcff',
          '#b45fb0ff',
          '#5bb56cff'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
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
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
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

}