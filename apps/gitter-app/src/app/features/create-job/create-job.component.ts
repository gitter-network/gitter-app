import { Component } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { RxState } from '@rx-angular/state';
import { NeonJSService } from '../../services/neonjs.service';
import {
  ContractMethodDefinition,
  ContractParameterDefinition,
  ContractParamType,
} from '@cityofzion/neon-core/lib/sc/';

type UpdatedMethodDef = ContractMethodDefinition & { displayName: string };
interface CreateJobState {
  contractAddress: string;
  isLoadingContractData: boolean;
  contractMethods: UpdatedMethodDef[];
  selectedMethod: UpdatedMethodDef;
}

@Component({
  selector: 'gitter-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss'],
})
export class CreateJobComponent extends RxState<CreateJobState> {
  readonly contractParamType = ContractParamType;
  readonly state$ = this.select();
  readonly onContractAddressChange$ = new Subject<string>();
  readonly loadMethods$ = this.onContractAddressChange$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.set({ isLoadingContractData: true })),
    switchMap((a) => this.neonJs.fetchMethods(a)),
    map((methods) => this.mapToMethodSignature(methods)),
    tap(() => this.set({ isLoadingContractData: false }))
  );

  constructor(private neonJs: NeonJSService) {
    super();
    this.set({
      isLoadingContractData: false,
      contractAddress: '',
    });
    this.connect('contractMethods', this.loadMethods$);
  }

  private mapToMethodSignature(cmd: ContractMethodDefinition[]): any[] {
    return cmd.map((method) => {
      return {
        ...method,
        displayName:
          method.name +
          '(<small>' +
          method.parameters.reduce(
            (prev: string, curr: ContractParameterDefinition, i: number) => {
              const isLast = i == method.parameters.length - 1;
              return (
                prev +
                '<span class="paramType">' +
                ContractParamType[curr.type] +
                '</span> ' +
                curr.name +
                (isLast ? '' : ', ')
              );
            },
            ''
          ) +
          '</small>)',
      };
    });
  }
}
