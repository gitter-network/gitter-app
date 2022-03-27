import { Component, Input } from '@angular/core';
import { GitterJob } from '../../services/gitter.service';

const EMPTY_JOB: GitterJob = {
  args: [],
  contract: '',
  creator: '',
  id: '',
  method: '',
};
@Component({
  selector: 'gitter-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent {
  @Input() job: GitterJob = EMPTY_JOB;
}
