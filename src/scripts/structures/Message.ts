export class Message {
    private role: string;

    private content: string;

    constructor({ role, content }: { role: string; content: string }) {
        this.role = role;
        this.content = content;
    }

    public getRole(): string {
        return this.role;
    }

    public getContent(): string {
        return this.content;
    }
}
