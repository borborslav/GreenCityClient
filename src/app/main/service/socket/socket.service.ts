import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { Stomp, StompSubscription } from '@stomp/stompjs';
import { SocketClientState } from './socket-state.enum';
import { filter, first, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private state: BehaviorSubject<SocketClientState>;
  private webSocket: any;

  constructor() {
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);
    this.webSocket = Stomp.over(() => new SockJS(environment.socket));
    this.webSocket.connect({}, () => {
      this.state.next(SocketClientState.CONNECTED);
    });
  }

  private connect(): Observable<any> {
    return new Observable((observer) => {
      this.state.pipe(filter((state) => state === SocketClientState.CONNECTED)).subscribe(() => {
        observer.next(this.webSocket);
      });
    });
  }

  public onMessage(topic: string): Observable<any> {
    return this.connect().pipe(
      first(),
      switchMap((client) => {
        return new Observable<any>((observer) => {
          const subscription: StompSubscription = client.subscribe(topic, (message) => {
            observer.next(JSON.parse(message.body));
          });
          return () => client.unsubscribe(subscription.id);
        });
      })
    );
  }

  public send(topic: string, payload: any): void {
    this.connect()
      .pipe(first())
      .subscribe((client) => client.send(topic, {}, JSON.stringify(payload)));
  }

  ngOnDestroy() {
    this.connect()
      .pipe(first())
      .subscribe((client) => client.disconnect(null));
  }
}
