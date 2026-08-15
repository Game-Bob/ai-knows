export type SocialPlatform = 'twitter' | 'reddit';

export interface SocialPost {
    id: string;
    platform: SocialPlatform;
    author: string;
    title: string;
    content: string;
    url: string;
    createdAt: string;
    engagement: {
        score: number;
        comments: number;
    };
}

export interface MatchedTool {
    title: string;
    slug: string;
    url: string;
    category: string;
}

export interface SocialOpportunity {
    post: SocialPost;
    matchedTool?: MatchedTool;
    suggestedReply?: string;
    isNewToolIdea: boolean;
}
