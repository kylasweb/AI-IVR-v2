export declare class JioSipTrunkService {
    private isInitialized;
    private trunks;
    constructor();
    private initialize;
    isEnabled(): boolean;
    getActiveTrunks(): Promise<any[]>;
    routeCall(callData: any): Promise<any>;
    disconnect(): Promise<void>;
}
export declare const jioSipTrunkService: JioSipTrunkService;
//# sourceMappingURL=jioSipTrunk.d.ts.map