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
  paidFees: number[];
  name: string;
  executions: number[];
  createdAt: number;
  interval: number;
  nextExec: number;
  totalFees: number;
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
      .pipe(
        map((res) =>
          this.mapToGitterJobs(res).sort((a, b) => b.createdAt - a.createdAt)
        )
      );
  }

  public getJob(jobId: string): Observable<any> {
    return this.neonjs
      .rpcRequest(
        'getJob',
        [sc.ContractParam.byteArray(jobId)],
        environment.testnet.contracts.core
      )
      .pipe(map((res) => this.mapToGitterJob(res)));
  }

  public getFeesForJob(job: string): Observable<number> {
    return this.neonjs.rpcRequest(
      'getPaidFeesForJob',
      [sc.ContractParam.byteArray(job)],
      environment.testnet.contracts.core
    );
  }

  public createTimedJob(
    interval: number,
    startTime: number,
    contractHash: string,
    method: string,
    calldataArgs: NeoTypedValue[],
    creator: string,
    name: string
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
          NeolineService.string(name),
        ],
      },
    ];

    return this.neoline.invokeMultiple({
      signers: [{ account: new wallet.Account(creator).scriptHash, scopes: 1 }],
      invokeArgs: [...args],
    });
  }

  public createJob(
    contractHash: string,
    method: string,
    calldataArgs: NeoTypedValue[],
    creator: string,
    name: string
  ): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.testnet.contracts.core,
        operation: 'createJob',
        args: [
          NeolineService.hash160(contractHash),
          NeolineService.string(method),
          NeolineService.array(calldataArgs),
          NeolineService.hash160(creator),
          NeolineService.string(name),
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
        name: atob(jobValues[4] ?? ''), //TODO: remove ?? "". Just a temporary fix because old contract version had no name property
        paidFees: jobValues[5].map((v: any) => v.value),
        executions: jobValues[6].map((v: any) => v.value),
        createdAt: jobValues[7],
        interval: jobValues[8],
        nextExec: jobValues[9],
        totalFees: jobValues[5]
          .map((v: any) => v.value)
          .reduce((p: any, c: any) => Number(p) + Number(c), 0),
      };
      jobs.push(job);
    });

    return jobs;
  }

  private mapToGitterJob(res: { type: string; value: any }[]): GitterJob {
    console.log(res[5].value.map((v: any) => v.value));
    return {
      id: '',
      contract: '0x' + this.processBase64Hash160(res[0].value),
      method: atob(res[1].value),
      creator: wallet.getAddressFromScriptHash(
        this.processBase64Hash160(res[2].value)
      ),
      args: res[3].value,
      name: atob(res[4].value), //TODO: remove ?? "". Just a temporary fix because old contract version had no name property
      paidFees: res[5].value.map((v: any) => v.value),
      executions: res[6].value.map((v: any) => v.value),
      createdAt: res[7].value,
      interval: res[8].value,
      nextExec: res[9].value,
      totalFees: (res[5].value.map((v: any) => v.value) as number[]).reduce(
        (p, c) => Number(p) + Number(c),
        0
      ),
    };
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
