import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { u } from '@cityofzion/neon-js';
import { RxState } from '@rx-angular/state';
import { map, switchMap, tap } from 'rxjs';
import { GitterJob, GitterService } from '../../services/gitter.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

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
    tap((v) => console.log(u.hex2base64(v))),
    map((v) => u.hex2base64(v)),
    switchMap((id) => this.gitter.getJob(id))
  );

  constructor(
    private route: ActivatedRoute,
    private gitter: GitterService,
    @Inject(GLOBAL_RX_STATE) public globalState: RxState<GlobalState>
  ) {
    super();
    this.connect('job', this.loadJobDetails$);
  }
}
