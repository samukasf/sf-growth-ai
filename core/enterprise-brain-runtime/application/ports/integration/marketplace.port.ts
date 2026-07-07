export interface MarketplacePort {
  isAvailable(): boolean;
  getInstalledModules?(): Promise<string[]>;
}
