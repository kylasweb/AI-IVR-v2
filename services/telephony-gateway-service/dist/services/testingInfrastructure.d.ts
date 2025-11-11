export declare class TestingInfrastructureService {
    private isInitialized;
    private testSuites;
    constructor();
    private initialize;
    isEnabled(): boolean;
    runTests(testSuiteId?: string): Promise<any>;
    getTestSuites(): Promise<any[]>;
    shutdown(): Promise<void>;
}
export declare const testingInfrastructureService: TestingInfrastructureService;
//# sourceMappingURL=testingInfrastructure.d.ts.map