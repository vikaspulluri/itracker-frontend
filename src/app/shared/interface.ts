// common interface for all ngx-chips library values
export interface AutoCompleteTag {
    value: any;
    display: string;
    readonly?: boolean;
}

// common response for all requests which can be extended
export interface Response {
    message: string;
    error: boolean;
    errorType?: string;
    errorCode?: string;
}
