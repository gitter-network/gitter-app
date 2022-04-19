import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'new',
    canActivate: [],
    loadChildren: () =>
      import('./features/create-job/create-job.module').then(
        (m) => m.CreateJobModule
      ),
  },
  {
    path: 'job/:jobId',
    canActivate: [],
    loadChildren: () =>
      import('./features/job-details/job-details.module').then(
        (m) => m.JobDetailsModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
