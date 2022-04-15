import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { GlobalState, GLOBAL_RX_STATE } from './state/global.state';
import { RxState } from '@rx-angular/state';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
    DialogModule,
  ],
  providers: [
    {
      provide: GLOBAL_RX_STATE,
      useFactory: () => new RxState<GlobalState>(),
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
