import { Component, Inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { GitterJob, GitterService } from '../../services/gitter.service';
import { RxState } from '@rx-angular/state';
import { SelectItem } from 'primeng/api';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { Router } from '@angular/router';
import { u } from '@cityofzion/neon-js';

interface HomeState {
  jobs: GitterJob[];
  isLoading: boolean;
  address: string;
  selectBtnOption: string;
  selectBtnOptions: SelectItem[];
}

const DEFAULT_STATE: HomeState = {
  jobs: [],
  isLoading: false,
  address: '',
  selectBtnOption: 'myjobs',
  selectBtnOptions: [
    {
      label: 'My Jobs',
      value: 'myjobs',
    },
    {
      label: 'All Jobs',
      value: 'alljobs',
      disabled: true,
    },
  ],
};

@Component({
  selector: 'gitter-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends RxState<HomeState> {
  readonly state$ = this.select();
  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private gitter: GitterService,
    private router: Router
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect('address', this.globalState.select('address'));
    this.connect(
      'jobs',
      this.globalState
        .select('address')
        .pipe(switchMap((a) => this.gitter.jobsOf(a)))
    );
  }

  gotoJob(id: string): void {
    this.router.navigate(['/job/' + u.base642hex(id)]);
  }
}
