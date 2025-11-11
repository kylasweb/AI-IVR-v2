export declare class FreeSWITCHESLService {
    private connection;
    private isConnected;
    constructor();
    private initialize;
    isEnabled(): boolean;
    getCallStatus(callId: string): Promise<any>;
    disconnect(): Promise<void>;
}
export declare const freeswitchEslService: FreeSWITCHESLService;
//# sourceMappingURL=freeswitchEsl.d.ts.map