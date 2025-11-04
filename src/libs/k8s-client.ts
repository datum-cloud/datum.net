import * as k8s from '@kubernetes/client-node';

/**
 * Configuration options for K8sClient
 */
export interface K8sClientConfig {
  /** Path to kubeconfig file (e.g., '~/.kube/config' or './my-kubeconfig.yaml') */
  kubeconfigPath?: string;
  /** Context name to use from kubeconfig (optional, uses current context if not specified) */
  context?: string;
  /** Namespace to use for operations (default: 'default') */
  namespace?: string;
}

/**
 * Kubernetes Custom Resource metadata
 */
export interface K8sMetadata {
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

/**
 * Base structure for Kubernetes Custom Resources
 */
export interface K8sCustomResource<T = unknown> {
  apiVersion: string;
  kind: string;
  metadata: K8sMetadata;
  spec: T;
}

/**
 * Client wrapper for Kubernetes API server with client certificate authentication
 *
 * This client uses kubeconfig files for authentication, which can contain:
 * - Client certificates (cert-data/cert-file and key-data/key-file)
 * - Bearer tokens
 * - Other authentication methods
 *
 * @example
 * ```typescript
 * // Use default kubeconfig location (~/.kube/config)
 * const client = new K8sClient();
 *
 * // Use custom kubeconfig path
 * const client = new K8sClient({
 *   kubeconfigPath: './my-kubeconfig.yaml',
 *   context: 'my-cluster-context',
 *   namespace: 'milo-system'
 * });
 *
 * // List custom resources
 * const contacts = await client.listCustomResources(
 *   'notification.miloapis.com',
 *   'v1alpha1',
 *   'contacts'
 * );
 *
 * // Create a custom resource
 * const contact = await client.createCustomResource(
 *   'notification.miloapis.com',
 *   'v1alpha1',
 *   'contacts',
 *   {
 *     apiVersion: 'notification.miloapis.com/v1alpha1',
 *     kind: 'Contact',
 *     metadata: { name: 'my-contact' },
 *     spec: { email: 'user@example.com', givenName: 'John', familyName: 'Doe' }
 *   }
 * );
 * ```
 */
export class K8sClient {
  private kc: k8s.KubeConfig;
  private customApi: k8s.CustomObjectsApi;
  private coreApi: k8s.CoreV1Api;
  private namespace: string;

  constructor(config?: K8sClientConfig) {
    this.kc = new k8s.KubeConfig();

    // Load kubeconfig
    if (config?.kubeconfigPath) {
      // Load from specified path
      this.kc.loadFromFile(config.kubeconfigPath);
    } else {
      // Load from default location (~/.kube/config or KUBECONFIG env var)
      this.kc.loadFromDefault();
    }

    // Set context if specified
    if (config?.context) {
      this.kc.setCurrentContext(config.context);
    }

    // Set namespace (use from config, or from context, or default to 'default')
    this.namespace = config?.namespace || this.kc.getContextObject(this.kc.getCurrentContext())?.namespace || 'default';

    // Initialize API clients
    this.customApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
    this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
  }

  /**
   * List custom resources of a specific type
   *
   * @param group - API group (e.g., 'notification.miloapis.com')
   * @param version - API version (e.g., 'v1alpha1')
   * @param plural - Resource plural name (e.g., 'contacts')
   * @param namespace - Namespace (optional, uses default if not specified)
   * @returns Promise with the list of resources
   */
  async listCustomResources<T = unknown>(
    group: string,
    version: string,
    plural: string,
    namespace?: string
  ): Promise<k8s.KubernetesListObject<K8sCustomResource<T>>> {
    const ns = namespace || this.namespace;

    const response = await this.customApi.listNamespacedCustomObject({
      group,
      version,
      namespace: ns,
      plural,
    });

    return response as unknown as k8s.KubernetesListObject<K8sCustomResource<T>>;
  }

  /**
   * List custom resources across all namespaces
   *
   * @param group - API group (e.g., 'notification.miloapis.com')
   * @param version - API version (e.g., 'v1alpha1')
   * @param plural - Resource plural name (e.g., 'contacts')
   * @returns Promise with the list of resources from all namespaces
   */
  async listClusterCustomResources<T = unknown>(
    group: string,
    version: string,
    plural: string
  ): Promise<k8s.KubernetesListObject<K8sCustomResource<T>>> {
    const response = await this.customApi.listClusterCustomObject({
      group,
      version,
      plural,
    });

    // The response itself is the body, not response.body
    return response as unknown as k8s.KubernetesListObject<K8sCustomResource<T>>;
  }

  /**
   * Get a specific custom resource by name
   *
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @param name - Resource name
   * @param namespace - Namespace (optional)
   * @returns Promise with the resource
   */
  async getCustomResource<T = unknown>(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string
  ): Promise<K8sCustomResource<T>> {
    const ns = namespace || this.namespace;

    const response = await this.customApi.getNamespacedCustomObject({
      group,
      version,
      namespace: ns,
      plural,
      name,
    });

    return response as unknown as K8sCustomResource<T>;
  }

  /**
   * Create a custom resource
   *
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @param resource - The resource object to create
   * @param namespace - Namespace (optional)
   * @returns Promise with the created resource
   */
  async createCustomResource<T = unknown>(
    group: string,
    version: string,
    plural: string,
    resource: K8sCustomResource<T>,
    namespace?: string
  ): Promise<K8sCustomResource<T>> {
    const ns = namespace || this.namespace;

    const response = await this.customApi.createNamespacedCustomObject({
      group,
      version,
      namespace: ns,
      plural,
      body: resource,
    });

    return response as unknown as K8sCustomResource<T>;
  }

  /**
   * Update a custom resource
   *
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @param name - Resource name
   * @param resource - The updated resource object
   * @param namespace - Namespace (optional)
   * @returns Promise with the updated resource
   */
  async updateCustomResource<T = unknown>(
    group: string,
    version: string,
    plural: string,
    name: string,
    resource: K8sCustomResource<T>,
    namespace?: string
  ): Promise<K8sCustomResource<T>> {
    const ns = namespace || this.namespace;

    const response = await this.customApi.patchNamespacedCustomObject({
      group,
      version,
      namespace: ns,
      plural,
      name,
      body: resource,
    });

    return response as unknown as K8sCustomResource<T>;
  }

  /**
   * Delete a custom resource
   *
   * @param group - API group
   * @param version - API version
   * @param plural - Resource plural name
   * @param name - Resource name
   * @param namespace - Namespace (optional)
   * @returns Promise that resolves when deleted
   */
  async deleteCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string
  ): Promise<void> {
    const ns = namespace || this.namespace;

    await this.customApi.deleteNamespacedCustomObject({
      group,
      version,
      namespace: ns,
      plural,
      name,
    });
  }

  /**
   * Get the current namespace
   */
  getNamespace(): string {
    return this.namespace;
  }

  /**
   * Get the current context name
   */
  getCurrentContext(): string {
    return this.kc.getCurrentContext();
  }

  /**
   * Get the core API client for standard Kubernetes resources
   */
  getCoreApi(): k8s.CoreV1Api {
    return this.coreApi;
  }

  /**
   * Get the custom objects API client for advanced usage
   */
  getCustomApi(): k8s.CustomObjectsApi {
    return this.customApi;
  }
}
