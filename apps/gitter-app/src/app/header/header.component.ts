import { Component, Inject } from '@angular/core';
import { map, Subject, switchMap, tap } from 'rxjs';
import { NeolineService } from '../services/neoline.service';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';
import { RxState } from '@rx-angular/state';
import { TreasuryService } from '../services/treasury.service';

interface HeaderState {
  isLoading: boolean;
  address: string;
  balance: number;
  displayFundsModal: boolean;
  depositAmount: number;
  withdrawAmount: number;
}

@Component({
  selector: 'gitter-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends RxState<HeaderState> {
  readonly connectWalletBtnClick$ = new Subject<void>();
  readonly state$ = this.select();
  readonly loadBalance$ = this.globalState.select('address').pipe(
    switchMap((a) => this.treasury.getBalance(a)),
    map((balance) => balance / Math.pow(10, 8))
  );

  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private neoline: NeolineService,
    private treasury: TreasuryService
  ) {
    super();
    this.set({ isLoading: false, balance: 0 });
    this.connect('address', this.globalState.select('address'));
    this.connect('balance', this.loadBalance$);
  }

  displayFundsModal(): void {
    this.set({ displayFundsModal: true });
  }

  connectWallet(): void {
    this.globalState.connect(
      'address',
      this.neoline.getAccount().pipe(map((v) => v.address))
    );
  }

  deposit(amount: number): void {
    amount = amount * Math.pow(10, 8);
    this.treasury
      .addToBalance(this.get('address'), amount)
      .subscribe((res) => console.log(res));
  }

  withdraw(amount: number): void {}
}
