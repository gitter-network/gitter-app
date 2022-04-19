import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { u } from '@cityofzion/neon-js';
import { RxState } from '@rx-angular/state';
import { map, switchMap } from 'rxjs';
import { GitterJob, GitterService } from '../../services/gitter.service';

interface JobDetailsState {
  job: GitterJob;
}

@Component({
  selector: 'gitter-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
})
export class JobDetailsComponent extends RxState<JobDetailsState> {
  readonly state$ = this.select();
  readonly loadJobDetails$ = this.route.params.pipe(
    map((params) => params['jobId']),
    map((v) => u.hex2base64(v)),
    switchMap((id) => this.gitter.getJob(id))
  );

  constructor(private route: ActivatedRoute, private gitter: GitterService) {
    super();
    this.connect('job', this.loadJobDetails$);
  }
}
