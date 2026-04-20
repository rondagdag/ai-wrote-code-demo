export interface VoteResponse {
  songId: string;
  votes: number;
  userVote: 'up' | 'down' | null;
}
