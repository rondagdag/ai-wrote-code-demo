export interface VoteRequest {
  direction: 'up' | 'down';
}

export interface VoteResponseData {
  songId: string;
  votes: number;
  userVote: 'up' | 'down' | null;
}
