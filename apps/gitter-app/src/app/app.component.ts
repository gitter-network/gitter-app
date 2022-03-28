import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { forkJoin, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { GitterJob, GitterService } from './services/gitter.service';
import { NeolineService } from './services/neoline.service';
import { TreasuryService } from './services/treasury.service';

interface AccountData {
  jobs: GitterJob[];
  balance: number;
}
@Component({
  selector: 'gitter-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  accountData: AccountData = { balance: 0, jobs: [] };
  address = '';
  isLoading = false;
  selectBtnOption = 'myjobs';
  selectBtnOptions = [
    {
      label: 'My Jobs',
      value: 'myjobs',
    },
    {
      label: 'Leaderboard',
      value: 'leaderboard',
    },
  ];

  constructor(
    private treasury: TreasuryService,
    private neoline: NeolineService,
    private gitter: GitterService
  ) {}

  ngOnInit(): void {
    this.neoline.init();
  }

  connectWallet(): void {
    this.neoline
      .getAccount()
      .pipe(
        tap((res) => (this.address = res.address)),
        switchMap((res) => this.getAccountData(res.address))
      )
      .subscribe((res) => (this.accountData = res));
  }

  private getAccountData(address: string): Observable<AccountData> {
    return forkJoin({
      jobs: this.gitter.jobsOf(address),
      balance: this.treasury.getBalance(address),
    }).pipe(map((r) => ({ jobs: r.jobs, balance: r.balance })));
  }

  myJobs(): void {
    this.gitter.jobsOf(this.address).subscribe((res) => console.log(res));
  }

  createJob(): void {
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
  }
}
