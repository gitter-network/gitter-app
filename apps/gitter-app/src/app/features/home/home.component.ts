import { Component, Inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { GitterJob, GitterService } from '../../services/gitter.service';
import { NeolineService } from '../../services/neoline.service';
import { TreasuryService } from '../../services/treasury.service';
import { RxState } from '@rx-angular/state';
import { SelectItem } from 'primeng/api';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { Router } from '@angular/router';
import { sc, u } from '@cityofzion/neon-js';

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
      label: 'Leaderboard',
      value: 'leaderboard',
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
    this.router.navigate(['/jobs/' + u.base642hex(id)]);
  }

  /* private getAccountData(address: string): Observable<AccountDat> {
    return forkJoin({
      jobs: this.gitter.jobsOf(address),
      balance: this.treasury.getBalance(address),
    }).pipe(map((r) => ({ jobs: r.jobs, balance: r.balance })));
  } */

  /* createJob(): void {
    this.gitter
      .createTimedJob(
        1,
        1,
        environment.testnet.contracts.counterExample,
        'addCount',
        [NeolineService.int(2)],
        this.address
      )
      .subscribe((res) => console.log(res));
  } */
}
