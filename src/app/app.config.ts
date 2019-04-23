export const config = {
    filtersForm: {
        userGroup: [
            {display: 'All', value: 'all'}
        ],
        issueGroup: [
            {name: 'All', value: null},
            {name: 'Backlog', value: 'backlog'},
            {name: 'In Progress', value: 'progress'},
            {name: 'In QA', value: 'qa'},
            {name: 'Completed', value: 'done'}
        ],
        priorityGroup: [
            {name: 'All', value: null},
            {name: 'High', value: 'high'},
            {name: 'Medium', value: 'medium'},
            {name: 'Low', value: 'low'}
        ],
        projectGroup: [
            {display: 'All', value: null}
        ],
        labelGroup: [
            {name: '--None--', value: null}
        ]
    },
    contactUsForm: {
        queryGroup: [
            {name: 'Suggestion', value: 'suggestion'},
            {name: 'Problem with application', value: 'problem'},
            {name: 'Want to know something?', value: 'query'}
        ]
    },
    greetings: ['morning', 'afternoon', 'evening'],
    projectTypes: ['Software Development', 'Website Development', 'QA', 'Deployment', 'None'],
    customPagination: {
        itemsPerPage: 5,
        currentPage: 1,
        itemsPerPageOptions: [2, 3, 5, 8, 10]
    },
    issueTableColumns: [
        {key: 'title', value: 'Title'},
        {key: 'issueId', value: 'Key'},
        {key: 'reporter', value: 'Reporter', subKey: 'firstName'},
        {key: 'assignee', value: 'Assignee', subKey: 'firstName'},
        {key: 'createdDate', value: 'Created On'}
    ]
};
