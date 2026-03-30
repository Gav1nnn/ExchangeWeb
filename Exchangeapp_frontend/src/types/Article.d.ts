export interface Article {
    ID: number;
    Title: string;
    Preview: string;
    Content: string;
    AuthorUsername: string;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface Like{
    likes: number
}
