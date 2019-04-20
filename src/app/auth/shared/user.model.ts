import { Response } from '../../shared/interface';

export interface User {
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    createdDate?: string;
    hasAdminPrevilieges?: boolean;
    notifications?: [{message: string, readStatus: string, arrived: Date}];
    loginCount?: number;
}

export interface AuthInfo {
    email: string;
    password: string;
}

// extends general response interface with different data
export interface LoginResponse extends Response {
    data: {
        expiryDuration: number,
        token: string,
        username: string,
        loginCount: string,
        userId: string,
        isSocialAuthUser?: boolean
    };
}

// extends general response interface with different data
export interface SignUpResponse extends Response {
    data: User;
}


