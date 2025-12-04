import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service'; // Asegúrate de tener este servicio

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss'] // Reutilizaremos estilos similares
})
export class EventosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];

  // Columnas a mostrar en la tabla de eventos
  //displayedColumns: string[] = ['id', 'nombre_evento', 'tipo_evento', 'fecha', 'horario', 'lugar', 'responsable', 'editar', 'eliminar'];
  displayedColumns: string[] = ['id', 'nombre_evento', 'tipo_evento', 'fecha', 'horario', 'lugar', 'responsable'];
  dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    public facadeService: FacadeService,
    public eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    
    // Validar inicio de sesión
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    if (this.isAdmin()) {
      this.displayedColumns.push('editar', 'eliminar');
    }

    // Obtener la lista de eventos
    this.obtenerEventos();
  }

  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        // Guardamos la lista completa de eventos
        let eventosFiltrados = response;
        console.log("Todos los eventos", eventosFiltrados);

        // Filtrar según el rol del usuario
        if (!this.isAdmin()) {
          eventosFiltrados = eventosFiltrados.filter((evento: any) => {
            let publicoStr = '';        
            if (Array.isArray(evento.publico_objetivo)) {
              publicoStr = evento.publico_objetivo.join(' ');
            } else {
              publicoStr = String(evento.publico_objetivo);
            }
            // Reglas
            if (this.isTeacher()) {
              // Maestros ven: Profesores o Público general
              return publicoStr.includes('Profesores') || (publicoStr.includes('Público general') && publicoStr.includes('Profesores'));
            }
            if (this.isStudent()) {
              // Alumnos ven: Estudiantes o Público general
              return publicoStr.includes('Estudiantes') || (publicoStr.includes('Público general') && publicoStr.includes('Estudiantes'));
            }
            return false;
          });
        }

        // Asignamos la lista filtrada
        this.lista_eventos = eventosFiltrados;
        console.log("Eventos visibles para este rol: ", this.lista_eventos);
        
        if (this.lista_eventos.length > 0) {

          this.dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
                      
          this.dataSource.filterPredicate = (data: DatosEvento, filter: string) => {
            const searchStr = filter.toLowerCase();
            const nombreEvento = data.nombre_evento.toLowerCase();
            const tipoEvento = data.tipo_evento.toLowerCase();
            return nombreEvento.includes(searchStr) || tipoEvento.includes(searchStr);
          };
        }
      }, (error) => {
        console.error("Error al obtener la lista de eventos: ", error);
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Navegar a la pantalla de edición 
  public goEditar(idEvento: number) {
    this.router.navigate(["registro-eventos/"+idEvento]); 
  }

  public delete(idEvento: number) {
    const userIdSession = Number(this.facadeService.getUserId());
    
    if (this.rol === 'administrador') {
      
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idEvento, rol: 'evento'}, height: '288px', width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          console.log("Evento eliminado");
          // Si el modal devuelve true, recargamos
          window.location.reload();
        } else{
        alert("Maestro no se ha podido eliminar.");
        console.log("No se eliminó el maestro");
        }
      });
    } else {
      alert("No tienes permisos para eliminar eventos.");
    }
  }

  //Funciones para roles
  public isAdmin(): boolean {
    return this.rol === 'administrador';
  }

  public isTeacher(): boolean {
    return this.rol === 'maestro';
  }

  public isStudent(): boolean {
    return this.rol === 'alumno';
  }
}

// Interfaz para tipado estricto de la tabla
export interface DatosEvento {
  id: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha: string;
  hora_inicio: string;
  hora_final: string;
  lugar: string;
  responsable: any;
  nombre_responsable: string;
  cupo_maximo: number;
}