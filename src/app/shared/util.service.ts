import { Injectable, ModuleWithComponentFactories } from '@angular/core';
import { config } from '../app.config';
import { AutoCompleteTag } from './interface';
import { UsersResponse, ProjectsResponse, SimpleUser } from './response.interface';
import { AuthService } from '../auth/shared/auth.service';
import * as moment from 'moment';
import { Notification } from './models';
import { SocketService } from './socket.service';
import { AppHttpService } from './app-http.service';
@Injectable()

// provided in AppComponent
export class UtilService {

    public config = config;
    private currentUserId = this.authService.getUserId();
    constructor(private authService: AuthService,
                private socketService: SocketService,
                private appHttpService: AppHttpService) {}

    /**
     * getShortName(title, length)
     * Function that shortens the given string to the provided length
     * @param title string
     * @param length optional number
     * @returns string
     */
    public getShortName(title: string, length?: number) {
        if (title === '' || typeof title === 'undefined' || title === null) {
            return;
        }
        if (typeof length === 'undefined') {
            length = 2;
        }
        let subTitles = title.split(' ');
        let maxLength = subTitles.length;

        if (length <= maxLength) {
            return subTitles.reduce((acc, current) => acc + current.charAt(0), '');
        } else if (maxLength === 1) {
            return title.substring(0, 2);
        }
    }

    /**
     * getGreeting()
     * Function that returns 'morning', 'afternoon', 'evening' based on current time
     * @returns string
     */
    public getGreeting() {
        let currentDate = this.getCurrentDate();
        let hours = currentDate.getHours();
        if (hours < 12) {
            return this.config.greetings[0];
        } else if (hours < 18) {
            return this.config.greetings[1];
        } else {
            return this.config.greetings[2];
        }
    }

    /**
     * getCurrentDate()
     * Function that returns new Date Object
     * @returns Date object
     */
    public getCurrentDate() {
        return new Date();
    }

    /**
     * mapUserDataToForm()
     * Function that maps the users data to AutoCompleteTag format
     * @param Object of UsersResponse.data
     * @returns Array
     */
    public mapUserDataToForm(users: UsersResponse['data']) {
        let formData: AutoCompleteTag[] = users.map(user => {
            let obj: AutoCompleteTag = {
                value: user.userId,
                display: user.firstName + ' ' + user.lastName
            };
            return obj;
        });
        return formData;
    }

    /**
     * mapProjectDataToForm()
     * Function that maps projects data to AutoCompleteTag format
     * @param projects Array
     * @returns Array
     */
    public mapProjectDataToForm(projects: ProjectsResponse['data']) {
        let formData: AutoCompleteTag[] = projects.map(project => {
            let obj: AutoCompleteTag = {
                value: project.projectId,
                display: project.title
            };
            return obj;
        });
        return formData;
    }

    /**
     * formatToSimpleUser()
     * Function that maps the data in the form of AutoCompleteTag format to SimpleUser format
     * @param data Array
     * @returns Array
     */
    public formatToSimpleUser(data: AutoCompleteTag[]) {
        const users = data.map(user => {
            let username = user.display.split(' ');
            let obj: SimpleUser = {
                userId: user.value,
                firstName: username[0],
                lastName: username[1]
            };
            return obj;
        });
        return users;
    }

    /**
     * excludeCurrentUserFromInputTag()
     * Function that excludes current user details from populating in the form
     * @param Array of AutoCompleteTag
     * @returns AutoCompleteTag[]
     */
    public excludeCurrentUserFromInputTag(users: AutoCompleteTag[]) {
        return users.filter(user => user.value !== this.authService.getUserId());
    }

    /**
     * unmapUserDataFromForm()
     * Function that maps the form data to user data
     * @param users AutoCompleteTag[]
     */
    public unmapUserDataFromForm(users: AutoCompleteTag[]) {
        if (!users) { return; }
        let data = users.map(user => {
            let name = user.display.split(' ');
            let obj = {
                userId: user.value,
                firstName: name[0],
                lastName: name[1]
            };
            return obj;
        });
        return data;
    }

    /**
     * setUserPrevilieges()
     * Function that updates user privilieges. Mostly seen in issue details page
     * @param ownerId String
     * @param users Array of AutoCompleteTag
     * @returns Array
     */
    public setUserPrivilieges(ownerId: string, users: AutoCompleteTag[]): AutoCompleteTag[] {
        let priviliegedUsers = users.map(user => {
            let obj = {
                value: user.value,
                display: user.display,
                readonly: this.currentUserId === ownerId ? false : true
            };
            return obj;
        });
        return priviliegedUsers;
    }

    /**
     * formatDate()
     * Functioin that formats the date string to user readable form
     * @param isoDate Date String in ISO format
     * @returns String - 27th Mar 19, 10:57 pm
     */
    public formatDate(isoDate: string, format?: string) {
        let date = new Date(isoDate);
        let dateFormat = 'Do MMM YY, h:mm a';
        if (format && format === 'dateOnly') {
            dateFormat = 'Do MMM YY';
        } else if (format && format === 'timeOnly') {
            dateFormat = 'h:mm a';
        }
        return moment(date).format(dateFormat);
    }

    /**
     * getDuration()
     * Function that takes two isoDate strings and returns duration between them
     * @param startDate String
     * @param endDate String
     * @returns String
     */
    public getDuration(startDate: string, endDate) {
        let end = endDate || new Date();
        let start = moment(new Date(startDate));
        end = moment(end);
        const duration = moment.duration(end.diff(start));
        const seconds = Math.floor(duration.asSeconds());
        const minutes = Math.floor(duration.asMinutes());
        const hours = Math.floor(duration.asHours());
        const days = Math.floor(duration.asDays());
        const months = Math.floor(duration.asMonths());
        const years = Math.floor(duration.asYears());
        if (years && years > 0) {
            return `${years} Years`;
        } if (months && months > 0) {
            return `${months} Months`;
        } if (days && days > 0) {
            return `${days} Days`;
        } if (hours && hours > 0) {
            return `${hours} Hours`;
        } if (minutes && minutes > 0) {
            return `${minutes} Minutes`;
        } if (seconds && seconds > 0) {
            return `${seconds} Seconds`;
        }
        return null;
    }

    public sendNotification(message: string, type: string, data: {id: string, title: string}, receivers: SimpleUser[], priority?: string) {
        const notification: Notification = {
            message: message,
            type: type,
            status: 'unread',
            priority: priority || 'low',
            sender: {
                firstName: this.authService.getUserFirstName(),
                userId: this.authService.getUserId(),
                lastName: this.authService.getUsername().split(' ')[1]
            }
        };
        notification[type] = {
            id: data.id,
            title: data.title
        };
        notification.receivers = receivers;
        this.socketService.sendNotification(notification);
        this.appHttpService.addNotifications(notification).subscribe(response => {
            console.log('notification done');
        });
    }

    public updateActivity(issueId: string, summary: string) {
        this.appHttpService.updateIssueActivity(issueId, summary).subscribe(response => {
            console.log('Activity updated successfully!!!');
        });
    }

    public updateDefaultMsg(msg: string, username: string, typeName: string) {
        let message = msg.replace('***', username);
        message = message.replace('###', typeName);
        return message;
    }

    public sortArrayByKey(arr: any[], key: string, order: boolean, subProperty?: string) {
        let dupArr = arr.slice();
        dupArr.sort((obj1, obj2) => {
            let a = subProperty ? obj1[key][subProperty] : obj1[key];
            let b = subProperty ? obj2[key][subProperty] : obj2[key];
            return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * (order ? -1 : 1);
        });
        return dupArr;
    }

    /**
     * mapReadableStatusName()
     * Function that will return readable title for provided value, used in issues component
     * @param value string
     * @returns string
     */
    public mapReadableStatusName(value: string) {
        let group = config.filtersForm.issueGroup.slice();
        let object = group.filter(obj => obj.value === value);
        return object[0].name || value;
    }

    /**
     * removeCharsFromString()
     * Function that removes given substring and returns remaining part
     * @param mainString string
     * @param searchString string
     */
    public removeCharsFromString(mainString: string, searchString: string) {
        let index = mainString.indexOf(searchString);
        if (index > -1) {
            return mainString.replace(mainString.slice(index), '');
        }
        return mainString;
    }
}
