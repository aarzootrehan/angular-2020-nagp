import { AfterViewChecked, AfterViewInit, Component, ViewChild, OnInit, DoCheck, OnChanges } from '@angular/core';

import { LoggerService }  from './logger.service';

//////////////////
@Component({
  selector: 'app-child-view',
  template: '<input [(ngModel)]="hero">'
})
export class ChildViewComponent {
  hero = 'Magneta';
}

//////////////////////
@Component({
  selector: 'after-view',
  template: `
    <div>-- child view begins --</div>
      <app-child-view></app-child-view>
    <div>-- child view ends --</div>`
   + `
    <p *ngIf="comment" class="comment">
      {{comment}}
    </p>
  `
})
export class AfterViewComponent implements  AfterViewChecked, AfterViewInit, DoCheck, OnChanges {
  private prevHero = '';

  // Query for a VIEW child of type `ChildViewComponent`
  @ViewChild(ChildViewComponent) viewChild: ChildViewComponent;

  constructor(private logger: LoggerService) {
    this.logIt('AfterView constructor');
  }

  ngOnChanges() {
    console.log("ngOnChanges")
    console.log(this.viewChild);
  }

  ngDoCheck() {
    console.log("ngDoCheck")
    console.log(this.viewChild);
  }
  ngAfterViewInit() {
    // viewChild is set after the view has been initialized
    this.logIt('AfterViewInit');
    console.log("Äfter view")
    console.log(this.viewChild)
    this.doSomething();
  }

  ngAfterViewChecked() {
    // viewChild is updated after the view has been checked
    if (this.prevHero === this.viewChild.hero) {
      this.logIt('AfterViewChecked (no change)');
    } else {
      this.prevHero = this.viewChild.hero;
      this.logIt('AfterViewChecked');
      this.doSomething();
    }
  }

  comment = '';

  // This surrogate for real business logic sets the `comment`
  private doSomething() {
    let c = this.viewChild.hero.length > 10 ? `That's a long name` : '';
    if (c !== this.comment) {
      // Wait a tick because the component's view has already been checked
      this.logger.tick_then(() => this.comment = c);
    }
  }

  private logIt(method: string) {
    let child = this.viewChild;
    let message = `${method}: ${child ? child.hero : 'no'} child view`;
    this.logger.log(message);
  }
  // ...
}

//////////////
@Component({
  selector: 'after-view-parent',
  template: `
  <div class="parent">
    <h2>AfterView</h2>

    <after-view  *ngIf="show"></after-view>

    <h4>-- AfterView Logs --</h4>
    <p><button (click)="reset()">Reset</button></p>
    <div *ngFor="let msg of logger.logs">{{msg}}</div>
  </div>
  `,
  styles: ['.parent {background: burlywood}'],
  providers: [LoggerService]
})
export class AfterViewParentComponent {
  show = true;

  constructor(public logger: LoggerService) {
  }

  reset() {
    this.logger.clear();
    // quickly remove and reload AfterViewComponent which recreates it
    this.show = false;
    this.logger.tick_then(() => this.show = true);
  }
}
