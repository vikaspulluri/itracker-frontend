import { Injectable } from '@angular/core';
import { AuthService } from '../auth/shared/auth.service';
import { SocketService } from './socket.service';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from './util.service';

@Injectable()
export class SubscriptionService {
    constructor(private authService: AuthService,
                private socketService: SocketService,
                private toastrService: ToastrService,
                private utilService: UtilService) {
    }
    private isRecommendationsPresent = this.authService.getLoginCount() > 1 ? false : true;

    clearRecommendations() {
        this.isRecommendationsPresent = false;
    }

    getIsRecommendationsPresent() {
        return this.isRecommendationsPresent;
    }

    receiveNotification() {
        this.socketService.onReceivedNotification().subscribe(data => {
            let message = data.message;
            let username = data.sender.firstName + ' ' + data.sender.lastName;
            let type = 'issue';
            if (data.type === 'project') {
                type = 'project';
            }
            message = this.utilService.updateDefaultMsg(message, username, data[type].title);
            this.toastrService.info(message);
        });
    }
}
