import { Injectable } from '@angular/core';
import { sc, wallet } from '@cityofzion/neon-js';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NeoInvokeWriteResponse, NeoTypedValue } from './models/n3';
import { NeolineService } from './neoline.service';
import { NeonJSService } from './neonjs.service';

export interface GitterJob {
  id: string;
  contract: string;
  method: string;
  creator: string;
  args: { type: string; value: string }[];
}

@Injectable({ providedIn: 'root' })
export class GitterService {
  constructor(private neonjs: NeonJSService, private neoline: NeolineService) {}

  public jobsOf(address: string): Observable<GitterJob[]> {
    return this.neonjs
      .rpcRequest(
        'jobsOf',
        [sc.ContractParam.hash160(address)],
        environment.testnet.contracts.core
      )
      .pipe(map((res) => this.mapToGitterJobs(res)));
  }

  public createTimedJob(
    interval: number,
    startTime: number,
    contractHash: string,
    method: string,
    calldataArgs: NeoTypedValue[],
    creator: string
  ): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.testnet.contracts.core,
        operation: 'createTimedJob',
        args: [
          NeolineService.int(interval),
          NeolineService.int(startTime),
          NeolineService.hash160(contractHash),
          NeolineService.string(method),
          NeolineService.array(calldataArgs),
          NeolineService.hash160(creator),
        ],
      },
    ];

    return this.neoline.invokeMultiple({
      signers: [{ account: new wallet.Account(creator).scriptHash, scopes: 1 }],
      invokeArgs: [...args],
    });
  }

  private mapToGitterJobs(res: any[]): GitterJob[] {
    if (!res.length) {
      return [];
    }
    const jobs: GitterJob[] = [];
    res.forEach((v) => {
      const value = v.value[0];
      const key = value.key.value;
      const jobValues = value.value.value.map((v: any) => v.value);
      const job: GitterJob = {
        id: key,
        contract: '0x' + this.processBase64Hash160(jobValues[0]),
        method: atob(jobValues[1]),
        creator: wallet.getAddressFromScriptHash(
          this.processBase64Hash160(jobValues[2])
        ),
        args: jobValues[3],
      };
      jobs.push(job);
    });

    return jobs;
  }

  private processBase64Hash160(base64: string): string {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[len - 1 - i] = binaryString.charCodeAt(i);
    }
    return Array.from(bytes)
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
  }
}
