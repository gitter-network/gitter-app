import { Component, Inject } from '@angular/core';
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
import { SelectItem } from 'primeng/api';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { TreasuryService } from '../../services/treasury.service';
import { GitterService } from '../../services/gitter.service';
import { NeoTypedValue, NeoType } from '../../services/models/n3';

type UpdatedMethodDef = ContractMethodDefinition & { displayName: string };
interface CreateJobState {
  targetContractHash: string;
  isLoadingContractData: boolean;
  contractMethods: UpdatedMethodDef[];
  selectedMethod: UpdatedMethodDef;
  inputOptions: SelectItem[];
  inputOption: string;
  timeOptions: SelectItem[];
  selectedTimeOption: string;
  balance: number;
  depositAmount: number;
  jobName: string;
  parameters: any[];
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
  readonly loadBalance$ = this.globalState.select('address').pipe(
    switchMap((a) => this.treasury.getBalance(a)),
    map((balance) => balance / Math.pow(10, 8))
  );
  readonly loadMethods$ = this.onContractAddressChange$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.set({ isLoadingContractData: true })),
    switchMap((a) => this.neonJs.fetchMethods(a)),
    map((methods) => this.mapToMethodSignature(methods)),
    tap(() => this.set({ isLoadingContractData: false }))
  );

  constructor(
    private neonJs: NeonJSService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private treasury: TreasuryService,
    private gitter: GitterService
  ) {
    super();

    this.connect('balance', this.loadBalance$);
    this.set({
      isLoadingContractData: false,
      targetContractHash: '',
      timeOptions: [
        { value: 'time', label: 'Time', disabled: true },
        { value: 'everyBlock', label: 'Every block' },
      ],
      selectedTimeOption: 'everyBlock',
      inputOptions: [
        { value: 'static', label: 'Static Inputs' },
        {
          value: 'dynamic',
          label: 'Dynamic Inputs via Resolver',
          disabled: true,
        },
      ],
      inputOption: 'static',
      parameters: Array(20).fill(undefined),
    });
    this.connect('contractMethods', this.loadMethods$);
  }

  createTimedJob(): void {
    this.gitter
      .createTimedJob(
        15 * 1000,
        0,
        this.get('targetContractHash'),
        this.get('selectedMethod').name,
        this.mapToTypedParams(),
        this.globalState.get('address'),
        this.get('jobName')
      )
      .subscribe((res) => console.log(res));
  }

  createJob(): void {
    this.gitter
      .createJob(
        this.get('targetContractHash'),
        this.get('selectedMethod').name,
        this.mapToTypedParams(),
        this.globalState.get('address'),
        this.get('jobName')
      )
      .subscribe((res) => console.log(res));
  }

  private mapToTypedParams(): NeoTypedValue[] {
    return this.get('selectedMethod').parameters.map((param, i) => {
      return {
        type: ContractParamType[param.type] as NeoType,
        value: this.get('parameters')[i],
      };
    });
  }

  deposit(amount: number): void {
    amount = amount * Math.pow(10, 8);
    this.treasury
      .addToBalance(this.globalState.get('address'), amount)
      .subscribe((res) => console.log(res));
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
