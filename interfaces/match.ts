export interface Match {
    id: string;
    starts_at: Date;
    status: "finished" | "live" | "scheduled" | "postponed";
    home: {
        id: string;
        name: string;
        city: string;
    };
    away: Match['home']; 
    score: {
        home: number;
        away: number;
    };
}