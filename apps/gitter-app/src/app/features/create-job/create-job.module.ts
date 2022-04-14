import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CreateJobRoutingModule } from './create-job-routing.module';
import { CreateJobComponent } from './create-job.component';

@NgModule({
  declarations: [CreateJobComponent],
  imports: [SharedModule, CreateJobRoutingModule],
})
export class CreateJobModule {}
