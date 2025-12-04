import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { EventosService } from 'src/app/services/eventos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarUserModalComponent } from 'src/app/modals/editar-user-modal/editar-user-modal.component';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit{
  @Input() datos_evento: any = {};

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idEvento: Number = 0;

  // Para el select de tipo de evento
  public tipos_evento: any[] = [
    { value: 'Conferencia', viewValue: 'Conferencia' },
    { value: 'Taller', viewValue: 'Taller' },
    { value: 'Seminario', viewValue: 'Seminario' },
    { value: 'Concurso', viewValue: 'Concurso' }
  ];

  // Para los checkboxes de público objetivo
  public publicos_objetivo: any[] = [
    { value: 'Estudiantes', nombre: 'Estudiantes' },
    { value: 'Profesores', nombre: 'Profesores' },
    { value: 'Público general', nombre: 'Público general' }
  ];

  // Para el select de programas educativos
  public programas_educativos: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  // Lista de responsables (maestros y administradores)
  public responsables: any[] = [];

  // Fecha mínima (hoy)
  public minDate: Date = new Date();

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private eventosService: EventosService,
    private maestrosService: MaestrosService,
    private administradoresService: AdministradoresService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Verificar si es edición o registro nuevo
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);
      //Al iniciar la vista asignamos los datos del evento
      this.evento = this.datos_evento;

      // En lugar de asignar datos_evento (que está vacío), llamamos al servicio:
      
      this.eventosService.getEventoByID(this.idEvento).subscribe(
        (response) => {
          this.evento = response;

          // Convertir de formato 24h a 12h con AM/PM para los inputs de edición
          if (this.evento.hora_inicio) {
            this.evento.hora_inicio = this.convertirHoraA12H(this.evento.hora_inicio);
          }
          
          if (this.evento.hora_final) {
            this.evento.hora_final = this.convertirHoraA12H(this.evento.hora_final);
          }

          console.log("Datos del evento cargados: ", this.evento);
        },
        (error) => {
          console.error("Error al obtener el evento:", error);
          alert("No se pudieron cargar los datos del evento.");
        }
      );


    } else {
      // Va a registrar un nuevo evento
      this.evento = this.eventosService.esquemaEvento();
      this.token = this.facadeService.getSessionToken();
    }

    // Cargar lista de responsables (maestros y administradores)
    this.cargarResponsables();

    //Imprimir datos en consola
    console.log("Evento: ", this.evento);
  }

  // Cargar responsables del evento
  public cargarResponsables() {
    // Obtener maestros
    this.maestrosService.obtenerListaMaestros().subscribe(
      (maestros) => {
        // Obtener administradores
        this.administradoresService.obtenerListaAdmins().subscribe(
          (admins) => {
            // Combinar ambas listas
            this.responsables = [
              ...maestros.map((m: any) => ({ 
                id: m.user ? m.user.id : m.id, 
                name: m.user ? `${m.user.first_name} ${m.user.last_name}` : 'Nombre no disponible', 
                tipo: 'Maestro'
              })),
              ...admins.map((a: any) => ({ 
                id: a.user ? a.user.id : a.id, 
                name: a.user ? `${a.user.first_name} ${a.user.last_name}` : 'Nombre no disponible', 
                tipo: 'Administrador'
              }))
            ];
            console.log("Responsables: ", this.responsables);
          },
          (error) => {
            console.error("Error al cargar administradores: ", error);
          }
        );
      },
      (error) => {
        console.error("Error al cargar maestros: ", error);
      }
    );
  }

  // Función auxiliar para convertir horas a formato 24h
  public convertirHora(hora12: string): string {
      if (!hora12) return '';
      // Si ya viene en formato 24 hrs
      if (!hora12.includes('AM') && !hora12.includes('PM')) {
        return hora12;
      }
      const [time, modifier] = hora12.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      return `${hours}:${minutes}`;
  }

  // Función para convertir horas a formato 12h con AM/PM
  public convertirHoraA12H(hora24: string): string {
    if (!hora24) return '';

    // Dividimos la hora
    const [hora, minutos] = hora24.split(':');
    let h = parseInt(hora, 10);
    const m = minutos;
    // Determinamos AM o PM
    const ampm = h >= 12 ? 'PM' : 'AM';
    // Convertimos la hora 
    h = h % 12;
    h = h ? h : 12; // Si h es 0, se vuelve 12
    return `${h}:${m} ${ampm}`;
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    // Validar el formulario
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }
    console.log("Datos a enviar:", this.evento);

    // Copia para manipular antes de enviar
    const eventoAEnviar = { ...this.evento };

    // Convertir horas a formato 24h
    eventoAEnviar.hora_inicio = this.convertirHora(this.evento.hora_inicio);
    eventoAEnviar.hora_final = this.convertirHora(this.evento.hora_final);

    console.log("Datos a enviar formateados:", eventoAEnviar);

    // Registrar el evento
    this.eventosService.registrarEvento(eventoAEnviar).subscribe(
      (response) => {
        alert("Evento registrado exitosamente");
        console.log("Evento registrado: ", response);
        this.router.navigate(["eventos-academicos"]);
      },
      (error) => {
        alert("Error al registrar evento");
        console.error("Error al registrar evento: ", error);
      }
    );
  }

  public actualizar() {
    // Validar el formulario
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }


    const dialogRef = this.dialog.open(EditarUserModalComponent, {
    data: { rol: 'evento' }, // Pasamos el rol para que el texto diga "Editar evento"
    height: '288px',
    width: '328px',
  });

  // 3. Esperar la respuesta del usuario
  dialogRef.afterClosed().subscribe(result => {
    // Si el usuario dio click en "Editar" (isEdit es true)
    if (result && result.isEdit) {
      console.log("Usuario confirmó edición. Procediendo a guardar...");

      // Preparación de datos
      const eventoAEnviar = { ...this.evento };

      // Formatear HORA (Asegurar 24h con segundos HH:MM:00)
      eventoAEnviar.hora_inicio = this.convertirHora(this.evento.hora_inicio);
      eventoAEnviar.hora_final = this.convertirHora(this.evento.hora_final);

      console.log("Datos listos para actualizar:", eventoAEnviar);

      //Llamar al servicio de Actualizar
      this.eventosService.actualizarEvento(eventoAEnviar).subscribe(
        (response) => {
          alert("Evento actualizado exitosamente");
          console.log("Evento actualizado: ", response);
          this.router.navigate(["eventos-academicos"]);
        },
        (error) => {
          alert("Error al actualizar evento");
          console.error("Error al actualizar evento: ", error);
        }
      );

    } else {
      console.log("Edición cancelada por el usuario.");
    }
  });



    // Actualizar el evento
    //this.eventosService.actualizarEvento(this.evento).subscribe(
    //  (response) => {
    //    alert("Evento actualizado exitosamente");
    //    console.log("Evento actualizado: ", response);
    //    this.router.navigate(["eventos-academicos"]);
    //  },
    //  (error) => {
    //    alert("Error al actualizar evento");
    //    console.error("Error al actualizar evento: ", error);
    //  }
    //);
  }

  // Función para detectar el cambio de fecha
  public changeFecha(event: any) {
    console.log(event);
    this.evento.fecha = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.evento.fecha);
  }

  // Funciones para checkbox de público objetivo
  public checkboxChange(event: any) {
    console.log("Evento checkbox: ", event);
    if (event.checked) {
      this.evento.publico_objetivo.push(event.source.value);
    } else {
      this.evento.publico_objetivo = this.evento.publico_objetivo.filter(
        (p: string) => p !== event.source.value
      );
    }
    
    // Si se desmarca "Estudiantes", limpiar el programa educativo
    if (!this.evento.publico_objetivo.includes('Estudiantes')) {
      this.evento.programa_educativo = '';
    }
    
    console.log("Público objetivo: ", this.evento.publico_objetivo);
  }

  public revisarSeleccion(valor: string) {
    if (this.evento.publico_objetivo) {
      return this.evento.publico_objetivo.includes(valor);
    }
    return false;
  }

  // Verificar si se debe mostrar el campo de programa educativo
  public mostrarProgramaEducativo(): boolean {
    return this.evento.publico_objetivo && this.evento.publico_objetivo.includes('Estudiantes');
  }
}
