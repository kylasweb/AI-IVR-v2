export declare class OperationsHubService {
    private isInitialized;
    private operations;
    constructor();
    private initialize;
    isEnabled(): boolean;
    getOperations(): Promise<any[]>;
    createOperation(operationData: any): Promise<any>;
    shutdown(): Promise<void>;
}
export declare const operationsHubService: OperationsHubService;
//# sourceMappingURL=operationsHub.d.ts.map