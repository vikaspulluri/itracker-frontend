import { Response } from './interface';
import { Project, Issue, Comment } from './models';

export interface SimpleUser {
    userId: string;
    firstName: string;
    lastName: string;
}
export interface UsersResponse extends Response {
    data: SimpleUser[];
}

export interface ProjectResponse extends Response {
    data: Project;
}

export interface ProjectsResponse extends Response {
    data: Project[];
}

export interface ContribProjects extends Response {
    data: {
        userId: string,
        firstName: string,
        lastName: string,
        projectDetails: {
            title: string,
            projectId: string
        }[]
    };
}

export interface IssueDetailsResponse extends Response {
    data: Issue;
}

export interface FilteredIssuesResponse extends Response {
    data: Issue[];
}

export interface IssueStatsResponse extends Response {
    data: {
        totalIssues: number,
        issues: {
            backlog?: number,
            // tslint:disable-next-line:no-unused-expression
            qa?: number,
            done?: number,
            progress?: number
        }
    };
}

export interface CommentsResponse extends Response {
    data: Comment[];
}
