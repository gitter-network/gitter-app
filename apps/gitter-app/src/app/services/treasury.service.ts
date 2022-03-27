import { Injectable } from '@angular/core';
import { sc, wallet } from '@cityofzion/neon-js';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NeoInvokeWriteResponse } from './models/n3';
import { NeolineService } from './neoline.service';
import { NeonJSService } from './neonjs.service';

@Injectable({ providedIn: 'root' })
export class TreasuryService {
  constructor(private neonjs: NeonJSService, private neoline: NeolineService) {}

  public getBalance(address: string): Observable<number> {
    return this.neonjs.rpcRequest(
      'getBalance',
      [sc.ContractParam.hash160(address)],
      environment.testnet.contracts.treasury
    );
  }

  public addToBalance(
    address: string,
    amount: number
  ): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.testnet.tokens.gas,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.contracts.treasury),
          NeolineService.int(amount),
          NeolineService.any(null),
        ],
      },
    ];

    return this.neoline.invokeMultiple({
      signers: [{ account: new wallet.Account(address).scriptHash, scopes: 1 }],
      invokeArgs: [...args],
    });
  }
}
