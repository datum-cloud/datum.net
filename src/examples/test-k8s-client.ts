#!/usr/bin/env node
/**
 * Test runner for K8s client examples
 *
 * Usage:
 *   npm run example:k8s -- list
 *   npm run example:k8s -- create
 *   npm run example:k8s -- get <name>
 *   npm run example:k8s -- update <name>
 *   npm run example:k8s -- delete <name>
 *   npm run example:k8s -- all
 */

import {
  exampleDefaultKubeconfig,
  exampleCustomKubeconfig,
  exampleListContacts,
  exampleCreateContact,
  exampleGetContact,
  exampleUpdateContact,
  exampleDeleteContact,
  exampleWithRetry,
  exampleWithEnvConfig,
} from './k8s-client-example.js';

// Get command from args
const command = process.argv[2] || 'help';
const arg = process.argv[3];

async function main() {
  console.log('🚀 K8s Client Example Runner\n');

  try {
    switch (command) {
      case 'info':
        console.log('📋 Showing cluster information...\n');
        await exampleDefaultKubeconfig();
        break;

      case 'config':
        console.log('⚙️  Testing custom kubeconfig...\n');
        await exampleCustomKubeconfig();
        break;

      case 'list':
        console.log('📝 Listing all contacts...\n');
        await exampleListContacts();
        break;

      case 'create':
        console.log('➕ Creating a new contact...\n');
        await exampleCreateContact();
        break;

      case 'get':
        if (!arg) {
          console.error('❌ Error: Please provide a contact name');
          console.error('   Usage: npm run example:k8s -- get <name>');
          process.exit(1);
        }
        console.log(`🔍 Getting contact: ${arg}\n`);
        await exampleGetContact();
        break;

      case 'update':
        if (!arg) {
          console.error('❌ Error: Please provide a contact name');
          console.error('   Usage: npm run example:k8s -- update <name>');
          process.exit(1);
        }
        console.log(`✏️  Updating contact: ${arg}\n`);
        await exampleUpdateContact();
        break;

      case 'delete':
        if (!arg) {
          console.error('❌ Error: Please provide a contact name');
          console.error('   Usage: npm run example:k8s -- delete <name>');
          process.exit(1);
        }
        console.log(`🗑️  Deleting contact: ${arg}\n`);
        await exampleDeleteContact();
        break;

      case 'retry':
        console.log('🔄 Testing retry logic...\n');
        await exampleWithRetry();
        break;

      case 'env':
        console.log('🌍 Testing environment-based configuration...\n');
        await exampleWithEnvConfig();
        break;

      case 'all':
        console.log('🧪 Running all examples...\n');
        console.log('1️⃣  Cluster Info:');
        await exampleDefaultKubeconfig();
        console.log('\n2️⃣  List Contacts:');
        await exampleListContacts();
        console.log('\n3️⃣  Environment Config:');
        await exampleWithEnvConfig();
        break;

      case 'help':
      default:
        console.log('Available commands:');
        console.log('  info              Show cluster and context information');
        console.log('  config            Test custom kubeconfig loading');
        console.log('  list              List all contacts');
        console.log('  create            Create a new contact');
        console.log('  get <name>        Get a specific contact by name');
        console.log('  update <name>     Update a contact');
        console.log('  delete <name>     Delete a contact');
        console.log('  retry             Test retry logic');
        console.log('  env               Test environment variable configuration');
        console.log('  all               Run multiple examples');
        console.log('  help              Show this help message');
        console.log('\nExamples:');
        console.log('  npm run example:k8s -- list');
        console.log('  npm run example:k8s -- create');
        console.log('  npm run example:k8s -- get john-doe');
        console.log('\nEnvironment variables:');
        console.log('  KUBECONFIG        Path to kubeconfig file (default: ~/.kube/config)');
        console.log('  K8S_CONTEXT       Context name to use');
        console.log('  K8S_NAMESPACE     Namespace to use (default: milo-system)');
        break;
    }

    console.log('\n✅ Example completed successfully');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
    }
    process.exit(1);
  }
}

main();
