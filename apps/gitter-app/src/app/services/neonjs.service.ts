import { Injectable } from '@angular/core';
import { from, Observable, of, throwError, catchError } from 'rxjs';
import { rpc, sc } from '@cityofzion/neon-js';
import { ContractMethodDefinition } from '@cityofzion/neon-core/lib/sc/';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NeonJSService {
  public rpcRequest(
    method: string,
    params: any[],
    scriptHash: string
  ): Observable<any> {
    const rpcClient = new rpc.RPCClient(environment.testnet.nodeUrl);
    return from(rpcClient.invokeFunction(scriptHash, method, params)).pipe(
      mergeMap((res) => {
        if (res.state === 'FAULT') {
          console.error(res);
          return throwError(res.exception);
        } else return of(res);
      }),
      map((res) => res.stack[0]?.value)
    );
  }

  public fetchMethods(hash: string): Observable<ContractMethodDefinition[]> {
    return from(
      new rpc.RPCClient(environment.testnet.nodeUrl).getContractState(hash)
    )
      .pipe(
        map((res) => sc.ContractManifest.fromJson(res.manifest).abi.methods)
      )
      .pipe(
        catchError(() => {
          return of([]);
        })
      );
  }
}
