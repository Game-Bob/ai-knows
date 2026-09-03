export type RouteMapEntry = { baseUrl: string; pathPrefixes: string[] };
export type Manifest = { version?: number; generatedAt?: string; pages?: Record<string, { hash: string; route?: string }>; urls?: string[] };

export function collectHtmlFiles(directory: string): Promise<string[]>;
export function filePathToRoute(relativePath: string): string | null;
export function normalizeRouteMap(routeMap: RouteMapEntry[]): RouteMapEntry[];
export function resolvePageUrl(route: string, routeMap: RouteMapEntry[]): string | null;
export function createManifest(options: { dist: string; routeMap: RouteMapEntry[] }): Promise<Manifest>;
export function diffManifests(previous: Manifest | null, current: Manifest, forceAll?: boolean): { changedUrls: string[]; deletedUrls: string[]; urls: string[] };
