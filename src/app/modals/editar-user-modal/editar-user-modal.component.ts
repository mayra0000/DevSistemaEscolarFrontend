import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-user-modal',
  templateUrl: './editar-user-modal.component.html',
  styleUrls: ['./editar-user-modal.component.scss']
})
export class EditarUserModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private dialogRef: MatDialogRef<EditarUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol || 'usuario';
  }

  public cerrar_modal(){
    this.dialogRef.close({ isEdit: false });
  }

  public editarUser(){
    // Solo retornamos TRUE para decirle al padre que proceda
    this.dialogRef.close({ isEdit: true });
  }
}