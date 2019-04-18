import { SimpleUser } from './response.interface';
import { AutoCompleteTag } from './interface';

export interface Project {
    title: string;
    ownerId: string;
    ownerName: string;
    keyCode: string;
    type: string;
    projectId?: string;
    createdDate?: string;
    members?: {
        userId: string,
        firstName: string,
        lastName: string,
        readOnly?: boolean
    }[];
}

export interface Issue {
    issueId?: string;
    title: string;
    description: string;
    priority: string;
    attachment?: File;
    status?: string;
    createdDate?: string;
    lastModifiedOn?: string;
    completionDate?: string;
    imageUrl?: string; // will come from server response
    project: {
        projectId: string,
        title: string
    };
    assignee: SimpleUser;
    formAssignee?: AutoCompleteTag[];
    reporter: SimpleUser;
    formReporter?: AutoCompleteTag;
    watchers?: SimpleUser[];
    formWatchers?: AutoCompleteTag[]; // when rendering watchers in form, it is required
    labels?: string[];
    activity?: {
        summary: string,
        dateLog: Date,
        readableDate?: string
    }[];
}

export interface Notification {
    _id?: string; // notification id present in response
    message: string;
    type: string; // issue or project or other
    status: string; // unread or read or later
    priority?: string; // low or high
    issue?: {
        title: string,
        id: string
    }; // incase of type == issue
    project?: {
        title: string,
        id: string
    }; // incase of type == project
    sender: SimpleUser;
    receivers?: SimpleUser[];
    createdDate?: string;
}

export interface Comment {
    issueId: string;
    summary: string;
    userName: string;
    userId: string;
    createdDate?: string;
}

export interface Feedback {
    userName: string;
    query: string;
    description: string;
}
