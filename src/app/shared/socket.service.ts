import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as config } from '../../environments/environment';
import { Notification } from './models';
import { AppHttpService } from './app-http.service';

@Injectable()
export class SocketService {
  private url = config.apiUrl;
  private socket;
  public isDisconnected = false;
  constructor(private appHttpService: AppHttpService) {
    this.socket = io.connect(this.url, {'forceNew': false, transports: ['websocket'], upgrade: false});
  }

  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', data => {
        observer.next(data);
      }); // end socket
    }); // end observable.create
  } // end verifyUser

  public setUser = (data) => {
    this.socket.emit('setUser', data);
  } // end setUser

  public getOnlineUserlist = () => {
    this.socket.emit('getOnlineUsers', '');
  }
  public onlineUserList = () => {
    return Observable.create(observer => {
      this.socket.on('onlineUserList', userList => {
        observer.next(userList);
      });
    });
  } // end onlineUserList

  public notificationAlert = () => {
    return Observable.create(observer => {
      this.socket.on('notificationAlert', data => {
        observer.next(data);
      });
    });
  }

  public setWatcher = () => {
    this.appHttpService.getWatchingIssueIds().subscribe((response: {error: boolean, data: string[]}) => {
      this.socket.emit('setWatchingIssues', response.data);
    });
  }

  public sendNotification = (data: Notification) => {
    this.socket.emit('sendNotification', data);
  }

  public onReceivedNotification = () => {
    return Observable.create(observer => {
      this.socket.on('receivedNotification', (data: Notification) => {
        observer.next(data);
      });
    });
  }

  public disconnectSocket = (data) => {
    this.socket.emit('disconnect', data);
  }

}
