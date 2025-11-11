export declare class ProductionDeploymentService {
    private isInitialized;
    private deployments;
    constructor();
    private initialize;
    isEnabled(): boolean;
    deployToProduction(deploymentData: any): Promise<any>;
    getDeployments(): Promise<any[]>;
    rollbackDeployment(deploymentId: string): Promise<any>;
    shutdown(): Promise<void>;
}
export declare const productionDeploymentService: ProductionDeploymentService;
//# sourceMappingURL=productionDeployment.d.ts.map