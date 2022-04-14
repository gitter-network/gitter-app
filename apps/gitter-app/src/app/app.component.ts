import { Component, Inject, OnInit } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { NeolineService } from './services/neoline.service';
import { GlobalState, GLOBAL_RX_STATE } from './state/global.state';

@Component({
  selector: 'gitter-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private neoline: NeolineService
  ) {
    this.globalState.connect('address', this.neoline.ACCOUNT_CHANGED_EVENT$);
  }

  ngOnInit(): void {
    this.neoline.init();
  }
}
