import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  // Esquema del evento académico
  public esquemaEvento() {
    return {
      nombre_evento: '',
      tipo_evento: '',
      fecha: '',
      hora_inicio: '',
      hora_final: '',
      lugar: '',
      publico_objetivo: [], // Array para checkboxes
      programa_educativo: '',
      responsable: '', // ID del responsable
      descripcion: '',
      cupo_maximo: null
    }
  }

  // Validación del evento
  public validarEvento(data: any, editar: boolean) {
    let errors: any = {};

    // Nombre del evento
    if (!data.nombre_evento) {
      errors.nombre_evento = 'El nombre del evento es requerido';
    } else {
      // Solo letras, números y espacios
      const regex = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/;
      if (!regex.test(data.nombre_evento)) {
        errors.nombre_evento = 'El nombre solo puede contener letras, números y espacios';
      }
    }

    // Tipo de evento
    if (!data.tipo_evento) {
      errors.tipo_evento = 'El tipo de evento es requerido';
    }

    // Fecha de realización
    if (!data.fecha) {
      errors.fecha = 'La fecha de realización es requerida';
    } else {
      // Validar que no sea una fecha pasada
      const fechaSeleccionada = new Date(data.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaSeleccionada < hoy) {
        errors.fecha = 'No se pueden seleccionar fechas anteriores al día actual';
      }
    }

    // Validar que hora final sea mayor que hora inicio
    if (data.hora_inicio && data.hora_final) {
      // Convertir formato "HH:MM AM/PM" a minutos para comparar
      const convertirAMinutos = (hora: string) => {
        if (!hora) return 0;
        
        // Si viene en formato "HH:MM AM/PM"
        const match = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let horas = parseInt(match[1]);
          const minutos = parseInt(match[2]);
          const periodo = match[3].toUpperCase();
          
          if (periodo === 'PM' && horas !== 12) horas += 12;
          if (periodo === 'AM' && horas === 12) horas = 0;
          
          return horas * 60 + minutos;
        }
        
        // Si viene en formato "HH:MM" (24 horas)
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
      };
      
      const minutosInicio = convertirAMinutos(data.hora_inicio);
      const minutosFinal = convertirAMinutos(data.hora_final);
      
      if (minutosFinal <= minutosInicio) {
        errors.hora_final = 'La hora final debe ser mayor que la hora de inicio';
      }
    }

    // Lugar
    if (!data.lugar) {
      errors.lugar = 'El lugar es requerido';
    } else {
      // Solo alfanuméricos y espacios
      const regex = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/;
      if (!regex.test(data.lugar)) {
        errors.lugar = 'El lugar solo puede contener caracteres alfanuméricos y espacios';
      }
    }

    // Público objetivo
    if (!data.publico_objetivo || data.publico_objetivo.length === 0) {
      errors.publico_objetivo = 'Debe seleccionar al menos un público objetivo';
    }

    // Programa educativo (solo si público objetivo incluye "Estudiantes")
    if (data.publico_objetivo && data.publico_objetivo.includes('Estudiantes')) {
      if (!data.programa_educativo) {
        errors.programa_educativo = 'El programa educativo es requerido cuando el público objetivo incluye estudiantes';
      }
    }

    // Responsable del evento
    if (!data.responsable) {
      errors.responsable = 'El responsable del evento es requerido';
    }

    // Descripción breve
    if (!data.descripcion) {
      errors.descripcion = 'La descripción es requerida';
    } else {
      if (data.descripcion.length > 300) {
        errors.descripcion = 'La descripción no puede exceder 300 caracteres';
      }
      // Solo letras, números y signos de puntuación básicos
      const regex = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,;:¿?¡!()"-]+$/;
      if (!regex.test(data.descripcion)) {
        errors.descripcion = 'La descripción solo puede contener letras, números y signos de puntuación básicos';
      }
    }

    // Cupo máximo
    if (!data.cupo_maximo) {
      errors.cupo_maximo = 'El cupo máximo es requerido';
    } else {
      // Solo números enteros positivos, máximo 3 dígitos
      const regex = /^[1-9]\d{0,2}$/;
      if (!regex.test(data.cupo_maximo.toString())) {
        errors.cupo_maximo = 'El cupo máximo debe ser un número entero positivo de máximo 3 dígitos';
      }
    }

    return errors;
  }

  // Registrar evento
  public registrarEvento(data: any): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/eventos-academicos/`,data, { headers });
  }

  // Obtener evento por ID
  public getEventoByID(idEvento: Number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/eventos-academicos/?id=${idEvento}`, { headers });
  }

  // Actualizar evento
  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.put<any>(`${environment.url_api}/eventos-academicos/`, data, { headers });
  }

  // Eliminar evento
  public eliminarEvento(idEvento: Number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.delete<any>(`${environment.url_api}/eventos-academicos/?id=${idEvento}`, { headers });
  }

  // Obtener lista de eventos
  public obtenerListaEventos(): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers });
  }
}