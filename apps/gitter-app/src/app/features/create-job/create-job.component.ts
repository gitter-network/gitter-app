import { Component } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { RxState } from '@rx-angular/state';
import { NeonJSService } from '../../services/neonjs.service';
import {
  ContractMethodDefinition,
  ContractParameterDefinition,
} from '@cityofzion/neon-core/lib/sc/';

interface CreateJobState {
  contractAddress: string;
  isLoadingContractData: boolean;
  contractMethods: any[];
  selectedMethod: any;
}

@Component({
  selector: 'gitter-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss'],
})
export class CreateJobComponent extends RxState<CreateJobState> {
  readonly state$ = this.select();
  readonly onContractAddressChange$ = new Subject<string>();
  readonly loadMethods$ = this.onContractAddressChange$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.set({ isLoadingContractData: true })),
    switchMap((a) => this.neonJs.fetchMethods(a)),
    tap(() => this.set({ isLoadingContractData: false }))
  );

  constructor(private neonJs: NeonJSService) {
    super();
    this.set({
      isLoadingContractData: false,
      contractAddress: '',
      contractMethods: [],
    });
    this.connect('contractMethods', this.loadMethods$);
  }

  /* private mapToMethodSignature(cmd: ContractMethodDefinition[]): any[] {
    const displayName = cmd.parameters.reduce((prev, curr) => {
      return prev + ', ' + curr.name + curr.type;
    }, '');
    return { displayName: displayName, ...cmd };
  } */
}
