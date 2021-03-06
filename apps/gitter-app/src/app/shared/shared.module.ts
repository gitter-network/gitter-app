import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TruncateAddressPipe } from './pipes/truncateAddress.pipe';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [TruncateAddressPipe],
  imports: [
    SelectButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
    InputTextModule,
    InputNumberModule,
    ProgressSpinnerModule,
  ],
  exports: [
    SelectButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
    TruncateAddressPipe,
    InputTextModule,
    InputNumberModule,
    ProgressSpinnerModule,
  ],
})
export class SharedModule {}
