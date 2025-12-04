import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['matricula', 'nombre','apellidos','email', 'fecha_nacimiento', 'curp', 'rfc', 'edad', 'telefono',"ocupacion", 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno []);

   @ViewChild(MatPaginator) paginator: MatPaginator;
   @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener alumnos
    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }

  // Consumimos el servicio para obtener los alumnos
    //Obtener alumnos
    public obtenerAlumnos() {
      this.alumnosService.obtenerListaAlumnos().subscribe(
        (response) => {
          this.lista_alumnos = response;
          console.log("Lista users: ", this.lista_alumnos);
          if (this.lista_alumnos.length > 0) {
            //Agregar datos del nombre e email
            this.lista_alumnos.forEach(usuario => {
              usuario.first_name = usuario.user.first_name;
              usuario.last_name = usuario.user.last_name;
              usuario.email = usuario.user.email;
            });
            console.log("Alumnos: ", this.lista_alumnos);

            this.dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            
            //Configurar filtro para buscar por nombre
            this.dataSource.filterPredicate = (data: DatosAlumno, filter: string) => {
              const searchStr = filter.toLowerCase();
              const nombreCompleto = `${data.first_name} ${data.last_name}`.toLowerCase();
              return nombreCompleto.includes(searchStr);
            };
          }
        }, (error) => {
          console.error("Error al obtener la lista de maestros: ", error);
          alert("No se pudo obtener la lista de maestros");
        }
      );
    }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Volver a la primera página cuando se filtra
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumno/"+idUser]);
  }

  public delete(idUser: number) {
         // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
        const userIdSession = Number(this.facadeService.getUserId());
        // --------- Pero el parametro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
        // Administrador puede eliminar su propio registro
        if (this.rol === 'administrador') {
          //Si es administrador, es decir, cumple la condición, se puede eliminar
          const dialogRef = this.dialog.open(EliminarUserModalComponent,{
            data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
            height: '288px',
            width: '328px',
          });
    
        dialogRef.afterClosed().subscribe(result => {
          if(result.isDelete){
            console.log("Alumno eliminado");
            alert("Alumno eliminado correctamente.");
            //Recargar página
            window.location.reload();
          }else{
            alert("Alumno no se ha podido eliminar.");
            console.log("No se eliminó el alumno");
          }
        });
        }else{
          alert("No tienes permisos para eliminar este alumno.");
        }
      }
}

export interface DatosAlumno {
  id: number;
  id_alumno: number;
  first_name: string;
  last_name: string;
  email: string;
  matricula: string;
  fecha_nacimiento: Date;
  telefono: string;
  rfc: string;
  curp: string;
  edad: number;
  ocupacion: string;

}
