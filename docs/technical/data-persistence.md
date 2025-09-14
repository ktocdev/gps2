# Data Persistence & State Management Guide

**Technical Documentation - Guinea Pig Simulation**

## Overview

This guide provides comprehensive strategies for implementing robust data persistence in the guinea pig simulation, covering storage technology selection, state management patterns, error handling, and graceful degradation strategies for web-based applications.

## Storage Technology Decision Matrix

### localStorage vs IndexedDB Analysis

Choose the appropriate storage technology based on data requirements and browser capabilities:

```typescript
// Storage capability detector and selector
class StorageCapabilityDetector {
  private capabilities = new Map<string, boolean>();
  private quotaInfo: StorageQuota | null = null;

  constructor() {
    this.detectCapabilities();
    this.detectStorageQuota();
  }

  private detectCapabilities(): void {
    // Test localStorage availability and functionality
    this.capabilities.set('localStorage', this.testLocalStorage());

    // Test IndexedDB availability and functionality
    this.capabilities.set('indexedDB', this.testIndexedDB());

    // Test SessionStorage for temporary data
    this.capabilities.set('sessionStorage', this.testSessionStorage());

    // Test WebSQL (deprecated but might be available)
    this.capabilities.set('webSQL', 'openDatabase' in window);

    // Test Cache API for offline capabilities
    this.capabilities.set('cacheAPI', 'caches' in window);
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private testIndexedDB(): boolean {
    try {
      return 'indexedDB' in window && indexedDB !== null;
    } catch (error) {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const testKey = '__sessionStorage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async detectStorageQuota(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.quotaInfo = {
          quota: estimate.quota || 0,
          usage: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        };
      }
    } catch (error) {
      console.warn('Storage quota detection failed:', error);
    }
  }

  hasCapability(storage: string): boolean {
    return this.capabilities.get(storage) ?? false;
  }

  getStorageQuota(): StorageQuota | null {
    return this.quotaInfo;
  }

  // Recommend optimal storage based on data size and requirements
  recommendStorage(dataSize: number, requirements: StorageRequirements): StorageRecommendation {
    const hasIndexedDB = this.hasCapability('indexedDB');
    const hasLocalStorage = this.hasCapability('localStorage');
    const quota = this.quotaInfo;

    // Large data or complex queries - prefer IndexedDB
    if (dataSize > 5 * 1024 * 1024 || requirements.complexQueries) { // 5MB+
      if (hasIndexedDB) {
        return {
          primary: 'indexedDB',
          fallback: hasLocalStorage ? 'localStorage' : 'memory',
          reasoning: 'Large data size or complex query requirements'
        };
      }
    }

    // Binary data or large objects - prefer IndexedDB
    if (requirements.binaryData || requirements.largeObjects) {
      if (hasIndexedDB) {
        return {
          primary: 'indexedDB',
          fallback: hasLocalStorage ? 'localStorage' : 'memory',
          reasoning: 'Binary data or large object support needed'
        };
      }
    }

    // Small data with simple access patterns - localStorage is fine
    if (dataSize < 1024 * 1024 && !requirements.complexQueries) { // < 1MB
      if (hasLocalStorage) {
        return {
          primary: 'localStorage',
          fallback: hasIndexedDB ? 'indexedDB' : 'memory',
          reasoning: 'Small data size with simple access patterns'
        };
      }
    }

    // Fallback to available storage
    if (hasIndexedDB) {
      return {
        primary: 'indexedDB',
        fallback: hasLocalStorage ? 'localStorage' : 'memory',
        reasoning: 'IndexedDB available as fallback'
      };
    }

    if (hasLocalStorage) {
      return {
        primary: 'localStorage',
        fallback: 'memory',
        reasoning: 'localStorage available as fallback'
      };
    }

    return {
      primary: 'memory',
      fallback: 'none',
      reasoning: 'No persistent storage available'
    };
  }

  // Check if storage is approaching quota limits
  isNearQuotaLimit(threshold: number = 0.8): boolean {
    if (!this.quotaInfo) return false;

    const usage = this.quotaInfo.usage / this.quotaInfo.quota;
    return usage > threshold;
  }

  // Estimate how much data can still be stored
  getAvailableSpace(): number {
    return this.quotaInfo?.available ?? 0;
  }
}

// Global storage capability detector
export const storageDetector = new StorageCapabilityDetector();

// Interface definitions
interface StorageQuota {
  quota: number;
  usage: number;
  available: number;
}

interface StorageRequirements {
  complexQueries: boolean;
  binaryData: boolean;
  largeObjects: boolean;
  transactions: boolean;
  indexing: boolean;
}

interface StorageRecommendation {
  primary: 'localStorage' | 'indexedDB' | 'memory';
  fallback: 'localStorage' | 'indexedDB' | 'memory' | 'none';
  reasoning: string;
}
```

### Unified Storage Interface

Implement a unified interface that abstracts storage implementation details:

```typescript
// Universal storage interface
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
  exists(key: string): Promise<boolean>;
}

// localStorage adapter
class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'gps_') {
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`LocalStorage get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // Quota exceeded
        await this.handleQuotaExceeded(key, value);
      } else {
        throw error;
      }
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.slice(this.prefix.length));
  }

  async size(): Promise<number> {
    let total = 0;
    const keys = await this.keys();
    for (const key of keys) {
      const value = localStorage.getItem(this.prefix + key);
      if (value) {
        total += value.length * 2; // Approximate bytes (UTF-16)
      }
    }
    return total;
  }

  async exists(key: string): Promise<boolean> {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  private async handleQuotaExceeded<T>(key: string, value: T): Promise<void> {
    console.warn('LocalStorage quota exceeded, attempting cleanup...');

    // Try to free up space by removing old data
    const keys = await this.keys();
    const keysWithTimestamps = keys
      .map(k => {
        const item = localStorage.getItem(this.prefix + k);
        try {
          const parsed = JSON.parse(item || '{}');
          return { key: k, timestamp: parsed.timestamp || 0 };
        } catch {
          return { key: k, timestamp: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 25% of items
    const toRemove = keysWithTimestamps.slice(0, Math.floor(keysWithTimestamps.length * 0.25));
    for (const item of toRemove) {
      await this.remove(item.key);
    }

    // Try saving again
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      throw new Error('Storage quota exceeded and cleanup failed');
    }
  }
}

// IndexedDB adapter
class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'GuineaPigSimDB', storeName: string = 'gameData', version: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };
      });
    } catch (error) {
      console.error(`IndexedDB get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const data = {
        key,
        value,
        timestamp: Date.now()
      };

      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async keys(): Promise<string[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }

  async size(): Promise<number> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  // IndexedDB-specific method for complex queries
  async getByTimestamp(fromTime: number, toTime: number): Promise<Array<{ key: string; value: any }>> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(fromTime, toTime);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.map(item => ({
          key: item.key,
          value: item.value
        }));
        resolve(results);
      };
    });
  }
}

// In-memory adapter for fallback
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async size(): Promise<number> {
    // Rough estimate of memory usage
    let size = 0;
    for (const [key, value] of this.storage) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(value).length * 2;
    }
    return size;
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
}
```

## State Persistence Strategies

### Game State Serialization

Implement efficient state serialization with versioning:

```typescript
// Game state serializer with versioning
class GameStateSerializer {
  private version = 1;
  private migrations = new Map<number, (data: any) => any>();

  constructor() {
    this.setupMigrations();
  }

  private setupMigrations(): void {
    // Migration from version 0 to 1
    this.migrations.set(1, (data: any) => {
      // Add version field if missing
      if (!data.version) {
        data.version = 1;
      }
      return data;
    });

    // Future migrations can be added here
    // this.migrations.set(2, (data: any) => { ... });
  }

  serialize(gameState: GameState): SerializedState {
    try {
      const serialized: SerializedState = {
        version: this.version,
        timestamp: Date.now(),
        checksum: '',
        data: {
          gameController: this.serializeGameController(gameState.gameController),
          guineaPig: this.serializeGuineaPig(gameState.guineaPig),
          needs: this.serializeNeeds(gameState.needs),
          habitat: this.serializeHabitat(gameState.habitat),
          inventory: this.serializeInventory(gameState.inventory),
          settings: this.serializeSettings(gameState.settings)
        }
      };

      // Calculate checksum for integrity verification
      serialized.checksum = this.calculateChecksum(serialized.data);

      return serialized;
    } catch (error) {
      throw new Error(`Serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  deserialize(serialized: SerializedState): GameState {
    try {
      // Verify checksum
      const calculatedChecksum = this.calculateChecksum(serialized.data);
      if (calculatedChecksum !== serialized.checksum) {
        throw new Error('Checksum verification failed - data may be corrupted');
      }

      // Apply migrations if needed
      let data = serialized.data;
      const currentVersion = serialized.version || 0;

      for (let version = currentVersion + 1; version <= this.version; version++) {
        const migration = this.migrations.get(version);
        if (migration) {
          data = migration(data);
        }
      }

      return {
        gameController: this.deserializeGameController(data.gameController),
        guineaPig: this.deserializeGuineaPig(data.guineaPig),
        needs: this.deserializeNeeds(data.needs),
        habitat: this.deserializeHabitat(data.habitat),
        inventory: this.deserializeInventory(data.inventory),
        settings: this.deserializeSettings(data.settings)
      };
    } catch (error) {
      throw new Error(`Deserialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private serializeGameController(state: any): any {
    return {
      currentState: state.currentState,
      hasGuineaPig: state.hasGuineaPig,
      lastSaveTimestamp: state.lastSaveTimestamp,
      totalPlayTime: state.totalPlayTime,
      sessionStartTime: state.sessionStartTime
    };
  }

  private deserializeGameController(data: any): any {
    return {
      currentState: data.currentState || 'intro',
      hasGuineaPig: data.hasGuineaPig || false,
      lastSaveTimestamp: data.lastSaveTimestamp || 0,
      totalPlayTime: data.totalPlayTime || 0,
      sessionStartTime: Date.now() // Always reset session start time
    };
  }

  private serializeGuineaPig(state: any): any {
    if (!state) return null;

    return {
      id: state.id,
      name: state.name,
      gender: state.gender,
      coatType: state.coatType,
      birthDate: state.birthDate,
      friendship: state.friendship,
      preferences: state.preferences,
      currentPosition: state.currentPosition
    };
  }

  private deserializeGuineaPig(data: any): any {
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      gender: data.gender,
      coatType: data.coatType,
      birthDate: new Date(data.birthDate),
      friendship: data.friendship || 50,
      preferences: data.preferences || {},
      currentPosition: data.currentPosition || { x: 4, y: 4 }
    };
  }

  private serializeNeeds(state: any): any {
    const needs: Record<string, any> = {};
    for (const [id, need] of state.needs) {
      needs[id] = {
        currentValue: need.currentValue,
        lastDecayTime: need.lastDecayTime,
        decayRate: need.decayRate
      };
    }

    return {
      needs,
      wellnessRating: state.wellnessRating,
      lastWellnessUpdate: state.lastWellnessUpdate
    };
  }

  private deserializeNeeds(data: any): any {
    const needs = new Map();

    for (const [id, needData] of Object.entries(data.needs || {})) {
      needs.set(id, {
        id,
        currentValue: (needData as any).currentValue || 100,
        lastDecayTime: (needData as any).lastDecayTime || Date.now(),
        decayRate: (needData as any).decayRate || 1
      });
    }

    return {
      needs,
      wellnessRating: data.wellnessRating || 100,
      lastWellnessUpdate: data.lastWellnessUpdate || Date.now()
    };
  }

  private serializeHabitat(state: any): any {
    return {
      cleanliness: state.cleanliness,
      beddingFreshness: state.beddingFreshness,
      waterLevel: state.waterLevel,
      items: Array.from(state.items.entries()),
      poopLocations: state.poopLocations
    };
  }

  private deserializeHabitat(data: any): any {
    return {
      cleanliness: data.cleanliness || 100,
      beddingFreshness: data.beddingFreshness || 100,
      waterLevel: data.waterLevel || 100,
      items: new Map(data.items || []),
      poopLocations: data.poopLocations || []
    };
  }

  private serializeInventory(state: any): any {
    return {
      currency: state.currency,
      bedding: state.bedding,
      items: Array.from(state.items.entries())
    };
  }

  private deserializeInventory(data: any): any {
    return {
      currency: data.currency || 100,
      bedding: data.bedding || 10,
      items: new Map(data.items || [])
    };
  }

  private serializeSettings(state: any): any {
    return {
      autoSaveEnabled: state.autoSaveEnabled,
      saveFrequency: state.saveFrequency,
      tutorialMode: state.tutorialMode,
      audioEnabled: state.audioEnabled,
      performanceMode: state.performanceMode
    };
  }

  private deserializeSettings(data: any): any {
    return {
      autoSaveEnabled: data.autoSaveEnabled !== false,
      saveFrequency: data.saveFrequency || 60000,
      tutorialMode: data.tutorialMode || 'auto',
      audioEnabled: data.audioEnabled !== false,
      performanceMode: data.performanceMode || 'standard'
    };
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation (in production, use a proper hash function)
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  getCurrentVersion(): number {
    return this.version;
  }

  // Validate serialized data structure
  validateSerializedData(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.version) {
      errors.push('Missing version field');
    }

    if (!data.timestamp) {
      errors.push('Missing timestamp field');
    }

    if (!data.checksum) {
      errors.push('Missing checksum field');
    }

    if (!data.data) {
      errors.push('Missing data field');
    } else {
      // Validate required data sections
      const requiredSections = ['gameController', 'settings'];
      for (const section of requiredSections) {
        if (!data.data[section]) {
          errors.push(`Missing required section: ${section}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      timestamp: Date.now()
    };
  }
}

// Global game state serializer
export const gameStateSerializer = new GameStateSerializer();

// Interface definitions
interface SerializedState {
  version: number;
  timestamp: number;
  checksum: string;
  data: {
    gameController: any;
    guineaPig: any;
    needs: any;
    habitat: any;
    inventory: any;
    settings: any;
  };
}

interface GameState {
  gameController: any;
  guineaPig: any;
  needs: any;
  habitat: any;
  inventory: any;
  settings: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  timestamp: number;
}
```

### Auto-Save System

Implement intelligent auto-save with conflict resolution:

```typescript
// Auto-save manager with intelligent timing
class AutoSaveManager {
  private storage: StorageAdapter;
  private saveInterval: number | null = null;
  private pendingSave: Promise<void> | null = null;
  private saveFrequency = 60000; // 1 minute default
  private maxSaveDelay = 300000; // 5 minutes maximum
  private lastSaveTime = 0;
  private saveQueue = new Set<string>();
  private isEnabled = true;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    this.setupAutoSave();
    this.setupVisibilityHandling();
    this.setupBeforeUnloadHandling();
  }

  private setupAutoSave(): void {
    this.saveInterval = setInterval(() => {
      if (this.isEnabled && this.shouldAutoSave()) {
        this.performAutoSave();
      }
    }, 30000); // Check every 30 seconds
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden - save immediately
        this.performImmediateSave();
      }
    });
  }

  private setupBeforeUnloadHandling(): void {
    window.addEventListener('beforeunload', (event) => {
      if (this.hasPendingChanges()) {
        // Attempt synchronous save
        this.performSynchronousSave();

        // Show confirmation dialog
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    });
  }

  private shouldAutoSave(): boolean {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;

    // Save if frequency time has passed and there are changes
    if (timeSinceLastSave >= this.saveFrequency && this.hasPendingChanges()) {
      return true;
    }

    // Force save if maximum delay has been reached
    if (timeSinceLastSave >= this.maxSaveDelay) {
      return true;
    }

    return false;
  }

  private hasPendingChanges(): boolean {
    // Check if any stores have unsaved changes
    const gameController = useGameControllerStore();
    const guineaPig = useGuineaPigStore();
    const needs = useNeedsStore();

    return gameController.hasUnsavedChanges() ||
           guineaPig.hasUnsavedChanges() ||
           needs.hasUnsavedChanges();
  }

  async performAutoSave(): Promise<void> {
    if (this.pendingSave) {
      return this.pendingSave;
    }

    this.pendingSave = this.saveGameState();

    try {
      await this.pendingSave;
      this.lastSaveTime = Date.now();
      this.notifySaveSuccess();
    } catch (error) {
      this.handleSaveError(error);
    } finally {
      this.pendingSave = null;
    }
  }

  async performImmediateSave(): Promise<void> {
    // Cancel any pending saves and save immediately
    if (this.pendingSave) {
      await this.pendingSave;
    }

    return this.performAutoSave();
  }

  private performSynchronousSave(): void {
    try {
      // Synchronous save for beforeunload (limited options)
      const gameState = this.collectGameState();
      const serialized = gameStateSerializer.serialize(gameState);

      // Use localStorage for synchronous save
      localStorage.setItem('gps_emergency_save', JSON.stringify(serialized));
    } catch (error) {
      console.error('Emergency save failed:', error);
    }
  }

  private async saveGameState(): Promise<void> {
    try {
      // Collect current game state from all stores
      const gameState = this.collectGameState();

      // Serialize the game state
      const serialized = gameStateSerializer.serialize(gameState);

      // Save to primary storage
      await this.storage.set('gameState', serialized);

      // Also save to backup location
      await this.storage.set('gameState_backup', serialized);

      // Clear emergency save if it exists
      localStorage.removeItem('gps_emergency_save');

      console.log('Game saved successfully');
    } catch (error) {
      // If primary save fails, try emergency localStorage save
      await this.emergencySave();
      throw error;
    }
  }

  private collectGameState(): GameState {
    const gameController = useGameControllerStore();
    const guineaPig = useGuineaPigStore();
    const needs = useNeedsStore();
    const habitat = useHabitatStore();
    const inventory = useInventoryStore();
    const settings = useSettingsStore();

    return {
      gameController: gameController.getSerializableState(),
      guineaPig: guineaPig.getSerializableState(),
      needs: needs.getSerializableState(),
      habitat: habitat.getSerializableState(),
      inventory: inventory.getSerializableState(),
      settings: settings.getSerializableState()
    };
  }

  private async emergencySave(): Promise<void> {
    try {
      const gameState = this.collectGameState();
      const serialized = gameStateSerializer.serialize(gameState);
      localStorage.setItem('gps_emergency_save', JSON.stringify(serialized));
      console.warn('Emergency save completed using localStorage');
    } catch (error) {
      console.error('Emergency save failed:', error);
    }
  }

  private notifySaveSuccess(): void {
    // Notify stores that save was successful
    const stores = [
      useGameControllerStore(),
      useGuineaPigStore(),
      useNeedsStore(),
      useHabitatStore(),
      useInventoryStore(),
      useSettingsStore()
    ];

    stores.forEach(store => {
      if (store.markSaved) {
        store.markSaved();
      }
    });

    // Emit save success event
    const event = new CustomEvent('autosave-success', {
      detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }

  private handleSaveError(error: any): void {
    console.error('Auto-save failed:', error);

    // Emit save error event
    const event = new CustomEvent('autosave-error', {
      detail: { error: error.message, timestamp: Date.now() }
    });
    document.dispatchEvent(event);

    // Try emergency save
    this.emergencySave();
  }

  // Public API
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setSaveFrequency(frequency: number): void {
    this.saveFrequency = Math.max(10000, frequency); // Minimum 10 seconds
  }

  async forceSave(): Promise<void> {
    return this.performAutoSave();
  }

  isAutoSaveEnabled(): boolean {
    return this.isEnabled;
  }

  getSaveFrequency(): number {
    return this.saveFrequency;
  }

  getLastSaveTime(): number {
    return this.lastSaveTime;
  }

  cleanup(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}
```

## Error Boundaries and Recovery

### Storage Error Handling

Implement comprehensive error handling for storage operations:

```typescript
// Storage error handler with recovery strategies
class StorageErrorHandler {
  private errorCounts = new Map<string, number>();
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 5000]; // Progressive delays

  async handleStorageOperation<T>(
    operation: () => Promise<T>,
    operationType: string,
    key?: string
  ): Promise<T> {
    const errorKey = `${operationType}_${key || 'unknown'}`;
    let lastError: Error;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await operation();

        // Reset error count on success
        this.errorCounts.delete(errorKey);

        return result;
      } catch (error) {
        lastError = error as Error;

        const errorCount = (this.errorCounts.get(errorKey) || 0) + 1;
        this.errorCounts.set(errorKey, errorCount);

        console.warn(`Storage operation ${operationType} failed (attempt ${attempt + 1}):`, error);

        // Determine if we should retry
        if (attempt < this.maxRetries - 1) {
          const shouldRetry = this.shouldRetryError(error as Error);

          if (shouldRetry) {
            await this.delay(this.retryDelays[attempt]);
            continue;
          }
        }

        // Handle specific error types
        await this.handleSpecificError(error as Error, operationType, key);
      }
    }

    // All retries failed
    throw new StorageError(
      `Storage operation ${operationType} failed after ${this.maxRetries} attempts`,
      operationType,
      lastError!
    );
  }

  private shouldRetryError(error: Error): boolean {
    // Retry on temporary errors
    if (error.name === 'QuotaExceededError') {
      return true; // Might be able to free space
    }

    if (error.name === 'UnknownError') {
      return true; // Might be temporary
    }

    if (error.message.includes('network')) {
      return true; // Network issues might resolve
    }

    // Don't retry on permanent errors
    if (error.name === 'NotSupportedError') {
      return false;
    }

    if (error.name === 'InvalidStateError') {
      return false;
    }

    // Default to retry
    return true;
  }

  private async handleSpecificError(error: Error, operationType: string, key?: string): Promise<void> {
    switch (error.name) {
      case 'QuotaExceededError':
        await this.handleQuotaExceeded();
        break;

      case 'NotSupportedError':
        await this.handleNotSupported(operationType);
        break;

      case 'InvalidStateError':
        await this.handleInvalidState();
        break;

      case 'DataError':
        await this.handleDataError(key);
        break;

      default:
        await this.handleUnknownError(error);
    }
  }

  private async handleQuotaExceeded(): Promise<void> {
    console.warn('Storage quota exceeded, attempting cleanup...');

    try {
      // Try to free up space
      await this.cleanupOldData();

      // Notify user about storage issues
      this.notifyStorageIssue('quota', 'Storage space is running low. Some old data has been cleaned up.');
    } catch (cleanupError) {
      console.error('Storage cleanup failed:', cleanupError);
      this.notifyStorageIssue('quota_critical', 'Storage space is critically low. Please clear browser data or use a different device.');
    }
  }

  private async handleNotSupported(operationType: string): Promise<void> {
    console.error(`Storage operation ${operationType} not supported`);

    // Fall back to alternative storage if available
    await this.fallbackToAlternativeStorage();

    this.notifyStorageIssue('not_supported', 'Your browser does not support some storage features. Functionality may be limited.');
  }

  private async handleInvalidState(): Promise<void> {
    console.warn('Storage in invalid state, attempting recovery...');

    try {
      // Try to reset storage state
      await this.resetStorageState();
    } catch (resetError) {
      console.error('Storage state reset failed:', resetError);
      this.notifyStorageIssue('invalid_state', 'Storage system encountered an error. Please refresh the page.');
    }
  }

  private async handleDataError(key?: string): Promise<void> {
    console.error(`Data error for key: ${key}`);

    if (key) {
      // Try to remove corrupted data
      try {
        await this.removeCorruptedData(key);
      } catch (removeError) {
        console.error('Failed to remove corrupted data:', removeError);
      }
    }

    this.notifyStorageIssue('data_corruption', 'Some saved data appears to be corrupted and has been removed.');
  }

  private async handleUnknownError(error: Error): Promise<void> {
    console.error('Unknown storage error:', error);

    // Log error for debugging
    this.logErrorForDebugging(error);

    this.notifyStorageIssue('unknown', 'An unexpected storage error occurred. Please try again.');
  }

  private async cleanupOldData(): Promise<void> {
    const storage = storageManager.getCurrentStorage();

    // Remove old backup saves
    const keys = await storage.keys();
    const backupKeys = keys.filter(key => key.includes('backup') || key.includes('temp'));

    for (const key of backupKeys) {
      try {
        await storage.remove(key);
      } catch (error) {
        // Continue cleanup even if individual removals fail
        console.warn(`Failed to remove ${key}:`, error);
      }
    }

    // Clean up old achievement data
    const achievementKeys = keys.filter(key => key.startsWith('achievement_'));
    if (achievementKeys.length > 100) {
      // Keep only the most recent 50
      const toRemove = achievementKeys.slice(0, achievementKeys.length - 50);
      for (const key of toRemove) {
        try {
          await storage.remove(key);
        } catch (error) {
          console.warn(`Failed to remove achievement ${key}:`, error);
        }
      }
    }
  }

  private async fallbackToAlternativeStorage(): Promise<void> {
    // Try to switch to a different storage adapter
    const storageManager = useStorageManager();
    await storageManager.switchToFallbackStorage();
  }

  private async resetStorageState(): Promise<void> {
    // Close and reopen IndexedDB connections
    const storage = storageManager.getCurrentStorage();
    if (storage instanceof IndexedDBAdapter) {
      // Implementation would close and reopen DB
      console.log('Resetting IndexedDB connection...');
    }
  }

  private async removeCorruptedData(key: string): Promise<void> {
    const storage = storageManager.getCurrentStorage();
    await storage.remove(key);
    console.log(`Removed corrupted data for key: ${key}`);
  }

  private logErrorForDebugging(error: Error): void {
    // In a real application, this would send to an error tracking service
    const errorLog = {
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('Error logged for debugging:', errorLog);
  }

  private notifyStorageIssue(type: string, message: string): void {
    const event = new CustomEvent('storage-issue', {
      detail: { type, message, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get error statistics
  getErrorStatistics(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  // Reset error counts
  resetErrorCounts(): void {
    this.errorCounts.clear();
  }
}

// Custom error class for storage operations
class StorageError extends Error {
  constructor(
    message: string,
    public operationType: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Global storage error handler
export const storageErrorHandler = new StorageErrorHandler();
```

### Data Recovery System

Implement comprehensive data recovery mechanisms:

```typescript
// Data recovery manager
class DataRecoveryManager {
  private storage: StorageAdapter;
  private backupLocations = ['gameState_backup', 'gps_emergency_save'];

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  async recoverGameState(): Promise<GameState | null> {
    // Try to recover from multiple sources in order of preference
    const recoveryStrategies = [
      () => this.recoverFromPrimaryStorage(),
      () => this.recoverFromBackupStorage(),
      () => this.recoverFromEmergencySave(),
      () => this.recoverFromLocalStorageBackup(),
      () => this.recoverFromBrowserHistory()
    ];

    for (const strategy of recoveryStrategies) {
      try {
        const recovered = await strategy();
        if (recovered) {
          await this.validateRecoveredData(recovered);
          console.log('Successfully recovered game state');
          return recovered;
        }
      } catch (error) {
        console.warn('Recovery strategy failed:', error);
        continue;
      }
    }

    console.error('All recovery strategies failed');
    return null;
  }

  private async recoverFromPrimaryStorage(): Promise<GameState | null> {
    try {
      const serialized = await this.storage.get<SerializedState>('gameState');
      if (serialized) {
        return gameStateSerializer.deserialize(serialized);
      }
    } catch (error) {
      throw new Error(`Primary storage recovery failed: ${error}`);
    }
    return null;
  }

  private async recoverFromBackupStorage(): Promise<GameState | null> {
    try {
      const serialized = await this.storage.get<SerializedState>('gameState_backup');
      if (serialized) {
        console.log('Recovering from backup storage...');
        return gameStateSerializer.deserialize(serialized);
      }
    } catch (error) {
      throw new Error(`Backup storage recovery failed: ${error}`);
    }
    return null;
  }

  private async recoverFromEmergencySave(): Promise<GameState | null> {
    try {
      const emergencyData = localStorage.getItem('gps_emergency_save');
      if (emergencyData) {
        console.log('Recovering from emergency save...');
        const serialized = JSON.parse(emergencyData);
        return gameStateSerializer.deserialize(serialized);
      }
    } catch (error) {
      throw new Error(`Emergency save recovery failed: ${error}`);
    }
    return null;
  }

  private async recoverFromLocalStorageBackup(): Promise<GameState | null> {
    try {
      // Check for any localStorage keys that might contain game data
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith('gps_') && key !== 'gps_emergency_save'
      );

      for (const key of keys) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.version && parsed.data) {
              console.log(`Recovering from localStorage backup: ${key}`);
              return gameStateSerializer.deserialize(parsed);
            }
          }
        } catch (error) {
          console.warn(`Failed to recover from ${key}:`, error);
        }
      }
    } catch (error) {
      throw new Error(`localStorage backup recovery failed: ${error}`);
    }
    return null;
  }

  private async recoverFromBrowserHistory(): Promise<GameState | null> {
    // This is a theoretical recovery method - browsers don't typically
    // expose history data in a way that would allow game state recovery
    // Included for completeness of recovery strategies
    console.log('Browser history recovery not implemented');
    return null;
  }

  private async validateRecoveredData(gameState: GameState): Promise<void> {
    const errors: string[] = [];

    // Validate essential data structures
    if (!gameState.gameController) {
      errors.push('Missing game controller data');
    }

    if (!gameState.settings) {
      errors.push('Missing settings data');
    }

    // Validate guinea pig data if it should exist
    if (gameState.gameController?.hasGuineaPig && !gameState.guineaPig) {
      errors.push('Guinea pig data missing but should exist');
    }

    // Validate data consistency
    if (gameState.guineaPig) {
      if (!gameState.guineaPig.name || !gameState.guineaPig.birthDate) {
        errors.push('Guinea pig data incomplete');
      }

      if (gameState.guineaPig.friendship < 0 || gameState.guineaPig.friendship > 100) {
        console.warn('Invalid friendship value, correcting...');
        gameState.guineaPig.friendship = Math.max(0, Math.min(100, gameState.guineaPig.friendship));
      }
    }

    // Validate needs data
    if (gameState.needs) {
      for (const [needId, need] of gameState.needs.needs || new Map()) {
        if (need.currentValue < 0 || need.currentValue > 100) {
          console.warn(`Invalid need value for ${needId}, correcting...`);
          need.currentValue = Math.max(0, Math.min(100, need.currentValue));
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Data validation failed: ${errors.join(', ')}`);
    }
  }

  // Create a complete backup of current state
  async createBackup(): Promise<void> {
    try {
      const gameController = useGameControllerStore();
      const gameState = {
        gameController: gameController.getSerializableState(),
        guineaPig: useGuineaPigStore().getSerializableState(),
        needs: useNeedsStore().getSerializableState(),
        habitat: useHabitatStore().getSerializableState(),
        inventory: useInventoryStore().getSerializableState(),
        settings: useSettingsStore().getSerializableState()
      };

      const serialized = gameStateSerializer.serialize(gameState);

      // Save to multiple backup locations
      await this.storage.set('gameState_backup', serialized);
      await this.storage.set(`gameState_backup_${Date.now()}`, serialized);

      // Keep only the 5 most recent backups
      await this.cleanupOldBackups();

      console.log('Backup created successfully');
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const keys = await this.storage.keys();
      const backupKeys = keys
        .filter(key => key.startsWith('gameState_backup_'))
        .sort((a, b) => {
          const timeA = parseInt(a.split('_')[2]) || 0;
          const timeB = parseInt(b.split('_')[2]) || 0;
          return timeB - timeA; // Newest first
        });

      // Keep only the 5 most recent backups
      const toRemove = backupKeys.slice(5);
      for (const key of toRemove) {
        await this.storage.remove(key);
      }
    } catch (error) {
      console.warn('Backup cleanup failed:', error);
    }
  }

  // Export game data for user backup
  async exportGameData(): Promise<string> {
    try {
      const gameState = {
        gameController: useGameControllerStore().getSerializableState(),
        guineaPig: useGuineaPigStore().getSerializableState(),
        needs: useNeedsStore().getSerializableState(),
        habitat: useHabitatStore().getSerializableState(),
        inventory: useInventoryStore().getSerializableState(),
        settings: useSettingsStore().getSerializableState()
      };

      const serialized = gameStateSerializer.serialize(gameState);

      // Add export metadata
      const exportData = {
        ...serialized,
        exportTimestamp: Date.now(),
        exportVersion: gameStateSerializer.getCurrentVersion(),
        browser: navigator.userAgent,
        url: window.location.href
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Export failed: ${error}`);
    }
  }

  // Import game data from user backup
  async importGameData(importData: string): Promise<void> {
    try {
      const parsed = JSON.parse(importData);

      // Validate import data
      const validation = gameStateSerializer.validateSerializedData(parsed);
      if (!validation.isValid) {
        throw new Error(`Invalid import data: ${validation.errors.join(', ')}`);
      }

      // Deserialize and validate
      const gameState = gameStateSerializer.deserialize(parsed);
      await this.validateRecoveredData(gameState);

      // Apply the imported state to all stores
      await this.applyImportedState(gameState);

      console.log('Game data imported successfully');
    } catch (error) {
      throw new Error(`Import failed: ${error}`);
    }
  }

  private async applyImportedState(gameState: GameState): Promise<void> {
    // Apply state to each store
    const gameController = useGameControllerStore();
    const guineaPig = useGuineaPigStore();
    const needs = useNeedsStore();
    const habitat = useHabitatStore();
    const inventory = useInventoryStore();
    const settings = useSettingsStore();

    await gameController.loadState(gameState.gameController);
    await guineaPig.loadState(gameState.guineaPig);
    await needs.loadState(gameState.needs);
    await habitat.loadState(gameState.habitat);
    await inventory.loadState(gameState.inventory);
    await settings.loadState(gameState.settings);

    // Save the imported state
    const autoSave = useAutoSaveManager();
    await autoSave.forceSave();
  }

  // Repair corrupted data where possible
  async repairData(gameState: GameState): Promise<GameState> {
    const repaired = { ...gameState };

    // Repair guinea pig data
    if (repaired.guineaPig) {
      // Ensure friendship is within valid range
      if (repaired.guineaPig.friendship < 0 || repaired.guineaPig.friendship > 100) {
        repaired.guineaPig.friendship = 50; // Default value
      }

      // Ensure birth date is valid
      if (!repaired.guineaPig.birthDate || isNaN(new Date(repaired.guineaPig.birthDate).getTime())) {
        repaired.guineaPig.birthDate = new Date();
      }

      // Ensure position is valid
      if (!repaired.guineaPig.currentPosition ||
          repaired.guineaPig.currentPosition.x < 0 ||
          repaired.guineaPig.currentPosition.x > 7 ||
          repaired.guineaPig.currentPosition.y < 0 ||
          repaired.guineaPig.currentPosition.y > 7) {
        repaired.guineaPig.currentPosition = { x: 4, y: 4 };
      }
    }

    // Repair needs data
    if (repaired.needs && repaired.needs.needs) {
      for (const [needId, need] of repaired.needs.needs) {
        if (need.currentValue < 0 || need.currentValue > 100) {
          need.currentValue = Math.max(0, Math.min(100, need.currentValue));
        }
        if (!need.lastDecayTime || isNaN(need.lastDecayTime)) {
          need.lastDecayTime = Date.now();
        }
      }
    }

    // Repair habitat data
    if (repaired.habitat) {
      // Ensure all values are within valid ranges
      repaired.habitat.cleanliness = Math.max(0, Math.min(100, repaired.habitat.cleanliness || 100));
      repaired.habitat.beddingFreshness = Math.max(0, Math.min(100, repaired.habitat.beddingFreshness || 100));
      repaired.habitat.waterLevel = Math.max(0, Math.min(100, repaired.habitat.waterLevel || 100));
    }

    // Repair inventory data
    if (repaired.inventory) {
      repaired.inventory.currency = Math.max(0, repaired.inventory.currency || 0);
      repaired.inventory.bedding = Math.max(0, repaired.inventory.bedding || 0);
    }

    return repaired;
  }
}

// Global data recovery manager
export const dataRecovery = new DataRecoveryManager(storageManager.getCurrentStorage());
```

This comprehensive data persistence guide provides robust solutions for storage technology selection, state serialization with versioning, intelligent auto-save systems, error handling with recovery strategies, and data validation/repair mechanisms for the guinea pig simulation game.