import { Component, Inject } from '@angular/core';
import { map, Subject, switchMap } from 'rxjs';
import { NeolineService } from '../services/neoline.service';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';
import { RxState } from '@rx-angular/state';

interface HeaderState {
  isLoading: boolean;
  address: string;
  balance: number;
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
    switchMap(() => this.neoline.getBalance()),
    map((balances) => {
      const gas: number =
        Number(
          balances[this.globalState.get('address')].filter(
            (v) => v.symbol === 'GAS'
          )[0]?.amount
        ) ?? 0;
      return gas;
    })
  );

  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private neoline: NeolineService
  ) {
    super();
    this.set({ isLoading: false });
    this.connect('address', this.globalState.select('address'));
    this.connect('balance', this.loadBalance$);
  }

  connectWallet(): void {
    this.globalState.connect(
      'address',
      this.neoline.getAccount().pipe(map((v) => v.address))
    );
  }
}
