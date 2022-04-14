import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TruncateAddressPipe } from './pipes/truncateAddress.pipe';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [TruncateAddressPipe],
  imports: [
    SelectButtonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
  ],
  exports: [
    SelectButtonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
    TruncateAddressPipe,
  ],
})
export class SharedModule {}
